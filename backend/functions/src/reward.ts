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
    // Determine finisher rank using transaction.get(query)
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
// 3. GET USER REWARDS CALLABLE HANDLER
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

  const rewardLedgersSnap = await db
    .collection('rewardLedgers')
    .where('userId', '==', uid)
    .get();

  const userDoc = await db.collection('users').doc(uid).get();
  const rewardBalance = userDoc.exists ? (userDoc.data()?.rewardBalance || 0) : 0;

  const rewards: any[] = [];
  const vouchers: any[] = [];

  rewardLedgersSnap.docs.forEach((doc) => {
    const d = doc.data();
    if (d.type === 'VOUCHER') {
      vouchers.push({
        ledgerId: doc.id,
        surveyId: d.surveyId,
        voucherId: d.voucherId,
        voucherPoolId: d.voucherPoolId,
        voucherTitle: d.voucherTitle || 'Hediye Çeki',
        amount: d.amount,
        createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt
      });
    } else {
      rewards.push({
        ledgerId: doc.id,
        surveyId: d.surveyId,
        type: d.type || 'MONEY',
        amount: d.amount,
        reason: d.reason,
        createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt
      });
    }
  });

  return {
    success: true,
    data: {
      rewardBalance,
      rewards,
      vouchers
    }
  };
};
