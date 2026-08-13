import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export interface TieredRewardRule {
  rank: number;
  amount: number;
}

export interface PAGRewardDefinition {
  rewardType: 'NONE' | 'MONEY' | 'VOUCHER';
  totalPoolAmount?: number;
  totalBudget?: number;
  distributionModel?: 'RANKED' | 'EQUAL';
  rankedRules?: TieredRewardRule[];
  tieredRewards?: TieredRewardRule[];
  remainingPoolCount?: number;
  remainingPoolAmountPerUser?: number;
  voucherPoolId?: string;
  voucherPoolName?: string;
}

export interface ProcessRewardResult {
  rewardAwarded: number;
  rewardType: 'NONE' | 'MONEY' | 'VOUCHER';
  voucherCode?: string;
  voucherTitle?: string;
  voucherId?: string;
  voucherPoolId?: string;
  voucherRef?: admin.firestore.DocumentReference;
  isDuplicate?: boolean;
}

/**
 * Transaction-safe Reward Processing Engine
 * READ-ONLY inside transaction: performs all reads, returns write instructions.
 */
export const processSurveyRewardInTransaction = async (
  transaction: admin.firestore.Transaction,
  db: admin.firestore.Firestore,
  uid: string,
  surveyId: string,
  survey: any,
  serverNow: any
): Promise<ProcessRewardResult> => {
  const ledgerId = `REWARD_${surveyId}_${uid}`;
  const ledgerRef = db.collection('rewardLedgers').doc(ledgerId);
  const ledgerDoc = await transaction.get(ledgerRef);

  // Idempotency check: duplicate submissions receive 0 reward
  if (ledgerDoc.exists) {
    functions.logger.info(`DUPLICATE_REWARD_CLAIM_PREVENTED: user=${uid}, surveyId=${surveyId}`);
    return {
      rewardAwarded: 0,
      rewardType: 'NONE',
      isDuplicate: true
    };
  }

  // PROFILE surveys do not yield monetary rewards by default
  if (survey.surveyType === 'PROFILE' || !survey.rewardDefinition || survey.rewardDefinition.rewardType === 'NONE') {
    return {
      rewardAwarded: 0,
      rewardType: 'NONE'
    };
  }

  const rewardDef: PAGRewardDefinition = survey.rewardDefinition;

  // --------------------------------------------------
  // 1. MONEY REWARD TYPE
  // --------------------------------------------------
  if (rewardDef.rewardType === 'MONEY') {
    const existingResponsesSnap = await transaction.get(
      db.collection('surveyResponses')
        .where('surveyId', '==', surveyId)
        .where('status', '==', 'COMPLETED')
    );

    const finisherCount = existingResponsesSnap.docs.length;
    const currentRank = finisherCount + 1;

    let awardedAmount = 0;
    const tieredRules = rewardDef.rankedRules || rewardDef.tieredRewards || [];
    const matchedTier = tieredRules.find((t) => t.rank === currentRank);

    if (matchedTier) {
      awardedAmount = matchedTier.amount;
    } else if (rewardDef.distributionModel === 'EQUAL') {
      awardedAmount = rewardDef.remainingPoolAmountPerUser || 10;
    } else {
      const maxTieredRank = tieredRules.reduce((max, r) => Math.max(max, r.rank), 0);
      const remainingCount = rewardDef.remainingPoolCount || 20;
      const remainingAmountPerUser = rewardDef.remainingPoolAmountPerUser || 10;

      if (currentRank > maxTieredRank && currentRank <= maxTieredRank + remainingCount) {
        awardedAmount = remainingAmountPerUser;
      }
    }

    return {
      rewardAwarded: awardedAmount,
      rewardType: 'MONEY'
    };
  }

  // --------------------------------------------------
  // 2. VOUCHER REWARD TYPE
  // --------------------------------------------------
  if (rewardDef.rewardType === 'VOUCHER') {
    const poolId = rewardDef.voucherPoolId || survey.boundVoucherPoolId || surveyId;
    const vouchersSnap = await transaction.get(
      db.collection('voucherPools')
        .doc(poolId)
        .collection('vouchers')
        .where('status', '==', 'AVAILABLE')
        .limit(1)
    );

    if (!vouchersSnap.empty) {
      const voucherDoc = vouchersSnap.docs[0];
      const voucherData = voucherDoc.data();
      const voucherRef = voucherDoc.ref;
      const valueAmount = voucherData.valueAmount || 100;
      const voucherTitle = voucherData.title || rewardDef.voucherPoolName || 'Hediye Çeki';

      return {
        rewardAwarded: valueAmount,
        rewardType: 'VOUCHER',
        voucherCode: voucherData.code,
        voucherTitle: voucherTitle,
        voucherId: voucherDoc.id,
        voucherPoolId: poolId,
        voucherRef: voucherRef
      };
    } else {
      functions.logger.warn(`VOUCHER_POOL_EXHAUSTED: user=${uid}, surveyId=${surveyId}, poolId=${poolId}`);
    }
  }

  return {
    rewardAwarded: 0,
    rewardType: 'NONE'
  };
};

// --------------------------------------------------
// 3. GET USER REWARDS & PROFILE SCORE HISTORY CALLABLE
// --------------------------------------------------
export const getUserRewardsHandler = async (
  data: any,
  context: functions.https.CallableContext
) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const uid = context.auth.uid;
  const db = admin.firestore();

  // Execute queries in parallel for maximum performance
  const [rewardLedgersSnap, scoreLedgersSnap, userDocSnap] = await Promise.all([
    db.collection('rewardLedgers').where('userId', '==', uid).get(),
    db.collection('users').doc(uid).collection('profileScoreLedgers').get(),
    db.collection('users').doc(uid).get()
  ]);

  const userDocData = userDocSnap.exists ? userDocSnap.data() || {} : {};
  const rewardBalance = userDocData.rewardBalance || 0;
  const profileScore = userDocData.profileScore || 0;

  const rewards: any[] = [];
  const vouchers: any[] = [];

  rewardLedgersSnap.docs.forEach((doc) => {
    const d = doc.data();
    const createdAtIso = d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt || new Date().toISOString();
    if (d.type === 'VOUCHER') {
      vouchers.push({
        voucherId: d.voucherId || doc.id,
        poolId: d.voucherPoolId || '',
        title: d.voucherTitle || 'Hediye Çeki',
        code: d.code || 'CODE_REDACTED',
        valueAmount: d.amount || 0,
        status: 'ASSIGNED',
        assignedAt: createdAtIso,
        expiresAt: null
      });
    } else {
      rewards.push({
        id: doc.id,
        surveyId: d.surveyId || '',
        type: d.type || 'MONEY',
        amount: d.amount || 0,
        reason: d.reason || 'Anket Ödülü',
        createdAt: createdAtIso
      });
    }
  });

  const scoreLedgers: any[] = [];
  scoreLedgersSnap.docs.forEach((doc) => {
    const d = doc.data();
    const createdAtIso = d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt || new Date().toISOString();
    scoreLedgers.push({
      id: doc.id,
      userId: d.userId || uid,
      sourceType: d.sourceType || 'SURVEY',
      sourceId: d.sourceId || '',
      amount: d.amount || 0,
      reason: d.reason || 'Profil Puanı Kazancı',
      createdAt: createdAtIso,
      metadata: d.metadata || null
    });
  });

  // Sort descending by date
  rewards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  vouchers.sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());
  scoreLedgers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    success: true,
    data: {
      rewardBalance,
      profileScore,
      rewards,
      vouchers,
      scoreLedgers
    }
  };
};
