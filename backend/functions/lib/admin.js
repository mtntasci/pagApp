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
exports.manageStoryBarAdminHandler = exports.manageVoucherPoolAdminHandler = exports.createOrUpdateSurveyAdminHandler = exports.getAdminDashboardMetricsHandler = exports.verifyAdminUser = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
// Helper to verify Admin authorization
const verifyAdminUser = async (context, db) => {
    if (!admin.apps.length) {
        admin.initializeApp();
    }
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const uid = context.auth.uid;
    // Check custom claim first
    if (context.auth.token && context.auth.token.admin === true) {
        return uid;
    }
    // Fallback check on user document in Firestore
    try {
        const targetDb = db || admin.firestore();
        const userDoc = await targetDb.collection('users').doc(uid).get();
        if (userDoc.exists) {
            const uData = userDoc.data();
            if (uData?.isAdmin === true || uData?.role === 'ADMIN' || uData?.admin === true) {
                return uid;
            }
        }
    }
    catch (err) {
        functions.logger.warn(`Admin check Firestore read failed for user ${uid}:`, err);
    }
    throw new functions.https.HttpsError('permission-denied', 'Admin privileges are required to perform this action.');
};
exports.verifyAdminUser = verifyAdminUser;
// --------------------------------------------------
// 1. ADMIN DASHBOARD METRICS
// --------------------------------------------------
const getAdminDashboardMetricsHandler = async (data, context) => {
    await (0, exports.verifyAdminUser)(context);
    const db = admin.firestore();
    const surveysSnap = await db.collection('surveys').get();
    let activeSurveys = 0;
    let scheduledSurveys = 0;
    let endedSurveys = 0;
    let draftSurveys = 0;
    surveysSnap.docs.forEach((doc) => {
        const s = doc.data();
        switch (s.status) {
            case 'ACTIVE':
                activeSurveys++;
                break;
            case 'SCHEDULED':
                scheduledSurveys++;
                break;
            case 'ENDED':
                endedSurveys++;
                break;
            case 'DRAFT':
                draftSurveys++;
                break;
        }
    });
    const responsesSnap = await db.collection('surveyResponses').get();
    const totalResponses = responsesSnap.docs.length;
    const scoreLedgersSnap = await db.collection('profileScoreLedgers').get();
    let totalProfileScoreDistributed = 0;
    scoreLedgersSnap.docs.forEach((doc) => {
        totalProfileScoreDistributed += (doc.data()?.amount || 0);
    });
    const rewardLedgersSnap = await db.collection('rewardLedgers').get();
    let totalMoneyRewardDistributed = 0;
    rewardLedgersSnap.docs.forEach((doc) => {
        const d = doc.data();
        if (d.type === 'MONEY') {
            totalMoneyRewardDistributed += (d.amount || 0);
        }
    });
    return {
        success: true,
        data: {
            activeSurveys,
            scheduledSurveys,
            endedSurveys,
            draftSurveys,
            totalResponses,
            totalProfileScoreDistributed,
            totalMoneyRewardDistributed
        }
    };
};
exports.getAdminDashboardMetricsHandler = getAdminDashboardMetricsHandler;
// --------------------------------------------------
// 2. CREATE OR UPDATE SURVEY (ADMIN)
// --------------------------------------------------
const createOrUpdateSurveyAdminHandler = async (data, context) => {
    await (0, exports.verifyAdminUser)(context);
    const db = admin.firestore();
    const { surveyId, ownerType, organizationId, surveyType, title, description, status, startAt, endAt, questions, targeting, profileScoreReward, rewardDefinition } = data || {};
    if (!title || typeof title !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Title is required.');
    }
    const validTypes = ['PAG', 'ORGANIZATION', 'PROFILE'];
    if (!surveyType || !validTypes.includes(surveyType)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid surveyType.');
    }
    if (!Array.isArray(questions) || questions.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'Survey must contain at least 1 question.');
    }
    // Strict Max 3 Questions Validation
    if (questions.length > 3) {
        throw new functions.https.HttpsError('invalid-argument', 'PAG V1 Surveys support a maximum of 3 questions. 4th question rejected.');
    }
    const validStatuses = ['DRAFT', 'APPROVED', 'SCHEDULED', 'ACTIVE', 'ENDED', 'CANCELLED'];
    if (status && !validStatuses.includes(status)) {
        throw new functions.https.HttpsError('invalid-argument', `Invalid status: ${status}`);
    }
    // Validate Reward Definition if present
    if (rewardDefinition) {
        const validRewardTypes = ['NONE', 'MONEY', 'VOUCHER'];
        if (!validRewardTypes.includes(rewardDefinition.rewardType)) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid rewardType in rewardDefinition.');
        }
    }
    const targetSurveyId = surveyId || `srv_${Date.now()}`;
    const surveyRef = db.collection('surveys').doc(targetSurveyId);
    const serverNow = admin.firestore.FieldValue.serverTimestamp();
    const payload = {
        surveyId: targetSurveyId,
        ownerType: ownerType || 'PAG',
        organizationId: organizationId || null,
        surveyType: surveyType,
        title: title,
        description: description || '',
        status: status || 'DRAFT',
        startAt: startAt ? new Date(startAt) : serverNow,
        endAt: endAt ? new Date(endAt) : null,
        questionCount: questions.length,
        questions: questions,
        targeting: targeting || { type: 'ALL' },
        profileScoreReward: typeof profileScoreReward === 'number' ? profileScoreReward : 50,
        rewardDefinition: rewardDefinition || { rewardType: 'NONE' },
        updatedAt: serverNow
    };
    const existing = await surveyRef.get();
    if (!existing.exists) {
        payload.createdAt = serverNow;
    }
    await surveyRef.set(payload, { merge: true });
    functions.logger.info(`ADMIN_SURVEY_UPSERTED: surveyId=${targetSurveyId}, status=${payload.status}`);
    return {
        success: true,
        data: {
            surveyId: targetSurveyId,
            status: payload.status
        }
    };
};
exports.createOrUpdateSurveyAdminHandler = createOrUpdateSurveyAdminHandler;
// --------------------------------------------------
// 3. VOUCHER POOL MANAGEMENT (ADMIN)
// --------------------------------------------------
const manageVoucherPoolAdminHandler = async (data, context) => {
    await (0, exports.verifyAdminUser)(context);
    const db = admin.firestore();
    const { action, poolId, name, orgId, voucherCodes, valueAmount } = data || {};
    const serverNow = admin.firestore.FieldValue.serverTimestamp();
    if (action === 'CREATE_POOL') {
        if (!name) {
            throw new functions.https.HttpsError('invalid-argument', 'Pool name is required.');
        }
        const newPoolId = poolId || `pool_${Date.now()}`;
        await db.collection('voucherPools').doc(newPoolId).set({
            poolId: newPoolId,
            name: name,
            orgId: orgId || 'PAG',
            createdAt: serverNow
        });
        return { success: true, data: { poolId: newPoolId } };
    }
    if (action === 'BULK_ADD_VOUCHERS') {
        if (!poolId || !Array.isArray(voucherCodes) || voucherCodes.length === 0) {
            throw new functions.https.HttpsError('invalid-argument', 'Valid poolId and non-empty voucherCodes array required.');
        }
        const poolRef = db.collection('voucherPools').doc(poolId);
        const batch = db.batch();
        voucherCodes.forEach((code, idx) => {
            const vId = `v_${Date.now()}_${idx}`;
            const vRef = poolRef.collection('vouchers').doc(vId);
            batch.set(vRef, {
                voucherId: vId,
                poolId: poolId,
                code: code,
                valueAmount: valueAmount || 100,
                status: 'AVAILABLE',
                assignedUserId: null,
                createdAt: serverNow
            });
        });
        await batch.commit();
        functions.logger.info(`ADMIN_BULK_VOUCHERS_ADDED: poolId=${poolId}, count=${voucherCodes.length}`);
        return { success: true, data: { poolId, count: voucherCodes.length } };
    }
    if (action === 'LIST_POOLS') {
        const poolsSnap = await db.collection('voucherPools').get();
        const result = [];
        for (const pDoc of poolsSnap.docs) {
            const pData = pDoc.data();
            const vouchersSnap = await pDoc.ref.collection('vouchers').get();
            let total = 0;
            let available = 0;
            let assigned = 0;
            vouchersSnap.docs.forEach((v) => {
                total++;
                if (v.data().status === 'AVAILABLE')
                    available++;
                if (v.data().status === 'ASSIGNED')
                    assigned++;
            });
            result.push({
                poolId: pDoc.id,
                name: pData.name || '',
                orgId: pData.orgId || '',
                totalCount: total,
                availableCount: available,
                assignedCount: assigned
            });
        }
        return { success: true, data: { pools: result } };
    }
    throw new functions.https.HttpsError('invalid-argument', 'Unknown action.');
};
exports.manageVoucherPoolAdminHandler = manageVoucherPoolAdminHandler;
// --------------------------------------------------
// 4. STORY BAR MANAGEMENT (ADMIN)
// --------------------------------------------------
const manageStoryBarAdminHandler = async (data, context) => {
    await (0, exports.verifyAdminUser)(context);
    const db = admin.firestore();
    const { action, storyId, surveyId, imageUrl, label, position, isActive, startAt, endAt } = data || {};
    const serverNow = admin.firestore.FieldValue.serverTimestamp();
    if (action === 'UPSERT_STORY') {
        if (!surveyId || !imageUrl || !label) {
            throw new functions.https.HttpsError('invalid-argument', 'surveyId, imageUrl, and label are required.');
        }
        const targetStoryId = storyId || `story_${Date.now()}`;
        const storyRef = db.collection('stories').doc(targetStoryId);
        const payload = {
            storyId: targetStoryId,
            surveyId: surveyId,
            imageUrl: imageUrl,
            label: label,
            position: typeof position === 'number' ? position : 1,
            isActive: isActive !== false,
            startAt: startAt ? new Date(startAt) : serverNow,
            endAt: endAt ? new Date(endAt) : null,
            updatedAt: serverNow
        };
        await storyRef.set(payload, { merge: true });
        return { success: true, data: { storyId: targetStoryId } };
    }
    if (action === 'LIST_STORIES') {
        const storiesSnap = await db.collection('stories').orderBy('position', 'asc').get();
        const stories = storiesSnap.docs.map((doc) => doc.data());
        return { success: true, data: { stories } };
    }
    throw new functions.https.HttpsError('invalid-argument', 'Unknown action.');
};
exports.manageStoryBarAdminHandler = manageStoryBarAdminHandler;
//# sourceMappingURL=admin.js.map