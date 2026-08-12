"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserRewardsHandler = exports.processSurveyRewardInTransaction = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
/**
 * Transaction-safe Reward Processing Engine
 */
const processSurveyRewardInTransaction = async (transaction, db, uid, surveyId, survey, serverNow) => {
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
    const rewardDef = survey.rewardDefinition;
    // --------------------------------------------------
    // 1. MONEY REWARD TYPE
    // --------------------------------------------------
    if (rewardDef.rewardType === 'MONEY') {
        // Determine finisher rank for this survey
        const existingResponsesSnap = await db
            .collection('surveyResponses')
            .where('surveyId', '==', surveyId)
            .where('status', '==', 'COMPLETED')
            .get();
        // Order by serverCompletedAt ASC, userId ASC
        const finisherCount = existingResponsesSnap.docs.length;
        const currentRank = finisherCount + 1; // 1-based rank for current finisher
        let awardedAmount = 0;
        // Check Tiered Rewards (e.g. 1st rank: 300, 2nd: 200, 3rd: 100)
        const tieredRules = rewardDef.tieredRewards || [];
        const matchedTier = tieredRules.find((t) => t.rank === currentRank);
        if (matchedTier) {
            awardedAmount = matchedTier.amount;
        }
        else {
            // Check remaining pool equal distribution (e.g. next 20 users get 20 TL each)
            const maxTieredRank = tieredRules.reduce((max, r) => Math.max(max, r.rank), 0);
            const remainingCount = rewardDef.remainingPoolCount || 0;
            const remainingAmountPerUser = rewardDef.remainingPoolAmountPerUser || 0;
            if (currentRank > maxTieredRank && currentRank <= maxTieredRank + remainingCount) {
                awardedAmount = remainingAmountPerUser;
            }
        }
        if (awardedAmount > 0) {
            // Create Immutable Money Reward Ledger
            transaction.set(ledgerRef, {
                id: ledgerId,
                userId: uid,
                surveyId: surveyId,
                type: 'MONEY',
                amount: awardedAmount,
                reason: survey.title || 'ANKET_ODUL_KAZANCI',
                createdAt: serverNow,
                metadata: {
                    surveyType: survey.surveyType,
                    ownerType: survey.ownerType,
                    finisherRank: currentRank
                }
            });
            // Atomically Increment User Reward Balance
            const userRef = db.collection('users').doc(uid);
            transaction.set(userRef, {
                rewardBalance: admin.firestore.FieldValue.increment(awardedAmount),
                updatedAt: serverNow
            }, { merge: true });
            functions.logger.info(`MONEY_REWARD_AWARDED: user=${uid}, surveyId=${surveyId}, rank=${currentRank}, amount=${awardedAmount}`);
            return {
                rewardAwarded: awardedAmount,
                rewardType: 'MONEY'
            };
        }
        return {
            rewardAwarded: 0,
            rewardType: 'NONE'
        };
    }
    // --------------------------------------------------
    // 2. VOUCHER REWARD TYPE
    // --------------------------------------------------
    if (rewardDef.rewardType === 'VOUCHER' && rewardDef.voucherPoolId) {
        const poolId = rewardDef.voucherPoolId;
        const vouchersSnap = await db
            .collection('voucherPools')
            .doc(poolId)
            .collection('vouchers')
            .where('status', '==', 'AVAILABLE')
            .limit(1)
            .get();
        if (!vouchersSnap.empty) {
            const voucherDoc = vouchersSnap.docs[0];
            const voucherData = voucherDoc.data();
            const voucherRef = voucherDoc.ref;
            // Assign Voucher to User
            transaction.update(voucherRef, {
                status: 'ASSIGNED',
                assignedUserId: uid,
                assignedAt: serverNow
            });
            const valueAmount = voucherData.valueAmount || 0;
            const voucherTitle = voucherData.title || 'Hediye Çeki';
            // Create Immutable Voucher Ledger
            transaction.set(ledgerRef, {
                id: ledgerId,
                userId: uid,
                surveyId: surveyId,
                type: 'VOUCHER',
                amount: valueAmount,
                voucherId: voucherDoc.id,
                voucherPoolId: poolId,
                voucherTitle: voucherTitle,
                reason: survey.title || 'ANKET_HEDIYE_CEKI',
                createdAt: serverNow
            });
            // Redact plaintext code from logging
            functions.logger.info(`VOUCHER_ASSIGNED: user=${uid}, surveyId=${surveyId}, poolId=${poolId}, voucherId=${voucherDoc.id}`);
            return {
                rewardAwarded: valueAmount,
                rewardType: 'VOUCHER',
                voucherCode: voucherData.code,
                voucherTitle: voucherTitle
            };
        }
        else {
            functions.logger.warn(`VOUCHER_POOL_EXHAUSTED: user=${uid}, surveyId=${surveyId}, poolId=${poolId}`);
        }
    }
    return {
        rewardAwarded: 0,
        rewardType: 'NONE'
    };
};
exports.processSurveyRewardInTransaction = processSurveyRewardInTransaction;
// --------------------------------------------------
// 3. GET USER REWARDS CALLABLE HANDLER
// --------------------------------------------------
const getUserRewardsHandler = async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const uid = context.auth.uid;
    const db = admin.firestore();
    // 1. Fetch User Reward Balance
    const userDoc = await db.collection('users').doc(uid).get();
    const rewardBalance = userDoc.exists ? (userDoc.data()?.rewardBalance || 0) : 0;
    // 2. Fetch Reward Ledgers
    const ledgersSnap = await db
        .collection('rewardLedgers')
        .where('userId', '==', uid)
        .get();
    const ledgers = [];
    ledgersSnap.docs.forEach((doc) => {
        const d = doc.data();
        ledgers.push({
            id: doc.id,
            surveyId: d.surveyId || '',
            type: d.type || 'MONEY',
            amount: d.amount || 0,
            reason: d.reason || '',
            createdAt: d.createdAt ? (d.createdAt.toDate ? d.createdAt.toDate().toISOString() : d.createdAt) : new Date().toISOString()
        });
    });
    // Sort ledgers DESC
    ledgers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    // 3. Fetch Assigned Vouchers across pools
    const assignedVouchers = [];
    const poolsSnap = await db.collection('voucherPools').get();
    for (const poolDoc of poolsSnap.docs) {
        const vouchersSnap = await poolDoc.ref
            .collection('vouchers')
            .where('assignedUserId', '==', uid)
            .get();
        vouchersSnap.docs.forEach((vDoc) => {
            const v = vDoc.data();
            assignedVouchers.push({
                voucherId: vDoc.id,
                poolId: poolDoc.id,
                title: v.title || 'Hediye Çeki',
                code: v.code || '',
                valueAmount: v.valueAmount || 0,
                status: v.status || 'ASSIGNED',
                assignedAt: v.assignedAt ? (v.assignedAt.toDate ? v.assignedAt.toDate().toISOString() : v.assignedAt) : new Date().toISOString(),
                expiresAt: v.expiresAt ? (v.expiresAt.toDate ? v.expiresAt.toDate().toISOString() : v.expiresAt) : null
            });
        });
    }
    return {
        success: true,
        data: {
            rewardBalance: rewardBalance,
            ledgers: ledgers,
            vouchers: assignedVouchers
        }
    };
};
exports.getUserRewardsHandler = getUserRewardsHandler;
//# sourceMappingURL=reward.js.map