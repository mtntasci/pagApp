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
exports.updateProfileSurveyResponseHandler = exports.submitSurveyResponseHandler = exports.getSurveyDetailHandler = exports.getEligibleSurveysHandler = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const reward_1 = require("./reward");
// --------------------------------------------------
// 1. GET ELIGIBLE SURVEYS
// --------------------------------------------------
const getEligibleSurveysHandler = async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const uid = context.auth.uid;
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();
    const surveysSnapshot = await db
        .collection('surveys')
        .where('status', '==', 'ACTIVE')
        .get();
    const userResponsesSnapshot = await db
        .collection('surveyResponses')
        .where('userId', '==', uid)
        .get();
    const completedSurveyIds = new Set();
    userResponsesSnapshot.docs.forEach((doc) => {
        const resData = doc.data();
        if (resData.surveyId) {
            completedSurveyIds.add(resData.surveyId);
        }
    });
    const eligibleSurveys = [];
    surveysSnapshot.docs.forEach((doc) => {
        const survey = doc.data();
        if (survey.startAt) {
            const startTime = survey.startAt.toDate ? survey.startAt.toDate() : new Date(survey.startAt);
            if (startTime > now.toDate())
                return;
        }
        if (survey.endAt) {
            const endTime = survey.endAt.toDate ? survey.endAt.toDate() : new Date(survey.endAt);
            if (endTime < now.toDate())
                return;
        }
        const isCompleted = completedSurveyIds.has(survey.surveyId);
        if (isCompleted && survey.surveyType !== 'PROFILE') {
            return;
        }
        if (survey.targeting) {
            if (survey.targeting.type === 'LOCATION' && survey.targeting.country) {
                if (survey.targeting.country !== 'TR') {
                    return;
                }
            }
        }
        eligibleSurveys.push({
            surveyId: survey.surveyId,
            ownerType: survey.ownerType,
            organizationId: survey.organizationId || null,
            surveyType: survey.surveyType,
            title: survey.title,
            description: survey.description,
            status: survey.status,
            startAt: survey.startAt,
            endAt: survey.endAt,
            questionCount: survey.questions ? survey.questions.length : 0,
            profileScoreReward: survey.profileScoreReward || 0,
            isCompleted: isCompleted
        });
    });
    return {
        success: true,
        data: {
            surveys: eligibleSurveys
        }
    };
};
exports.getEligibleSurveysHandler = getEligibleSurveysHandler;
// --------------------------------------------------
// 2. GET SURVEY DETAIL
// --------------------------------------------------
const getSurveyDetailHandler = async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const surveyId = data?.surveyId;
    if (!surveyId || typeof surveyId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'A valid surveyId is required.');
    }
    const uid = context.auth.uid;
    const db = admin.firestore();
    const surveyDoc = await db.collection('surveys').doc(surveyId).get();
    if (!surveyDoc.exists) {
        throw new functions.https.HttpsError('not-found', `Survey with ID ${surveyId} not found.`);
    }
    const survey = surveyDoc.data();
    const now = admin.firestore.Timestamp.now();
    if (survey.status !== 'ACTIVE') {
        throw new functions.https.HttpsError('failed-precondition', 'This survey is no longer active.');
    }
    if (survey.startAt) {
        const startTime = survey.startAt.toDate ? survey.startAt.toDate() : new Date(survey.startAt);
        if (startTime > now.toDate()) {
            throw new functions.https.HttpsError('failed-precondition', 'This survey has not started yet.');
        }
    }
    if (survey.endAt) {
        const endTime = survey.endAt.toDate ? survey.endAt.toDate() : new Date(survey.endAt);
        if (endTime < now.toDate()) {
            throw new functions.https.HttpsError('failed-precondition', 'This survey has expired.');
        }
    }
    const responseRef = db.collection('surveyResponses').doc(`${surveyId}_${uid}`);
    const responseDoc = await responseRef.get();
    const isCompleted = responseDoc.exists;
    const questions = (survey.questions || []).slice(0, 3);
    return {
        success: true,
        data: {
            surveyId: survey.surveyId,
            ownerType: survey.ownerType,
            organizationId: survey.organizationId || null,
            surveyType: survey.surveyType,
            title: survey.title,
            description: survey.description,
            status: survey.status,
            startAt: survey.startAt,
            endAt: survey.endAt,
            questionCount: questions.length,
            questions: questions,
            profileScoreReward: survey.profileScoreReward || 0,
            isCompleted: isCompleted,
            existingAnswers: isCompleted ? (responseDoc.data()?.answers || []) : []
        }
    };
};
exports.getSurveyDetailHandler = getSurveyDetailHandler;
// --------------------------------------------------
// 3. SUBMIT SURVEY RESPONSE + SCORE ENGINE (PAG / ORGANIZATION)
// --------------------------------------------------
const submitSurveyResponseHandler = async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const uid = context.auth.uid;
    const { surveyId, answers } = data || {};
    if (!surveyId || typeof surveyId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'A valid surveyId is required.');
    }
    if (!Array.isArray(answers) || answers.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'Answers list cannot be empty.');
    }
    if (answers.length > 3) {
        throw new functions.https.HttpsError('invalid-argument', 'PAG V1 surveys support a maximum of 3 questions.');
    }
    const db = admin.firestore();
    const surveyRef = db.collection('surveys').doc(surveyId);
    const userRef = db.collection('users').doc(uid);
    const responseId = `${surveyId}_${uid}`;
    const responseRef = db.collection('surveyResponses').doc(responseId);
    const ledgerId = `SURVEY_${surveyId}_${uid}`;
    const ledgerRef = db.collection('profileScoreLedgers').doc(ledgerId);
    const serverNow = admin.firestore.FieldValue.serverTimestamp();
    return await db.runTransaction(async (transaction) => {
        const surveyDoc = await transaction.get(surveyRef);
        if (!surveyDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Survey not found.');
        }
        const survey = surveyDoc.data();
        if (survey.status !== 'ACTIVE') {
            throw new functions.https.HttpsError('failed-precondition', 'Survey is not active.');
        }
        if (survey.surveyType === 'PROFILE') {
            throw new functions.https.HttpsError('invalid-argument', 'Use updateProfileSurveyResponse for PROFILE surveys.');
        }
        const surveyQuestions = survey.questions || [];
        if (answers.length !== surveyQuestions.length) {
            throw new functions.https.HttpsError('invalid-argument', `All ${surveyQuestions.length} questions must be answered.`);
        }
        for (const ans of answers) {
            const q = surveyQuestions.find((sq) => sq.questionId === ans.questionId);
            if (!q) {
                throw new functions.https.HttpsError('invalid-argument', `Question ID ${ans.questionId} does not exist in survey.`);
            }
            const opt = q.options.find((o) => o.optionId === ans.optionId);
            if (!opt) {
                throw new functions.https.HttpsError('invalid-argument', `Option ID ${ans.optionId} is invalid for question ${ans.questionId}.`);
            }
        }
        const userDoc = await transaction.get(userRef);
        const existingUserScore = userDoc.exists ? (userDoc.data()?.profileScore || 0) : 0;
        // Check duplicate response and ledger
        const existingResponse = await transaction.get(responseRef);
        const existingLedger = await transaction.get(ledgerRef);
        if (existingResponse.exists || existingLedger.exists) {
            functions.logger.info(`DUPLICATE_SUBMISSION_IDEMPOTENT: user=${uid}, surveyId=${surveyId}`);
            return {
                success: true,
                data: {
                    completed: true,
                    responseId: responseId,
                    surveyId: surveyId,
                    completedAt: existingResponse.data()?.serverCompletedAt || new Date().toISOString(),
                    isDuplicate: true,
                    profileScoreAwarded: 0,
                    currentProfileScore: existingUserScore
                }
            };
        }
        const scoreReward = survey.profileScoreReward || 0;
        // Create Immutable Score Ledger Entry
        const ledgerPayload = {
            id: ledgerId,
            userId: uid,
            sourceType: 'SURVEY',
            sourceId: surveyId,
            amount: scoreReward,
            reason: survey.title || 'COMPLETED_SURVEY',
            createdAt: serverNow,
            metadata: {
                surveyType: survey.surveyType,
                ownerType: survey.ownerType
            }
        };
        transaction.set(ledgerRef, ledgerPayload);
        // Atomically Increment User Profile Score
        transaction.set(userRef, {
            profileScore: admin.firestore.FieldValue.increment(scoreReward),
            updatedAt: serverNow
        }, { merge: true });
        // Process Financial Reward / Voucher Engine inside the same transaction
        const rewardResult = await (0, reward_1.processSurveyRewardInTransaction)(transaction, db, uid, surveyId, survey, serverNow);
        const updatedScore = existingUserScore + scoreReward;
        const existingRewardBalance = userDoc.exists ? (userDoc.data()?.rewardBalance || 0) : 0;
        const newRewardBalance = existingRewardBalance + (rewardResult.rewardAwarded || 0);
        // Write Response Document
        const responsePayload = {
            responseId: responseId,
            surveyId: surveyId,
            userId: uid,
            organizationId: survey.organizationId || null,
            surveyType: survey.surveyType,
            answers: answers,
            status: 'COMPLETED',
            submittedAt: serverNow,
            serverCompletedAt: serverNow,
            profileScoreProcessed: true,
            rewardProcessed: rewardResult.rewardType !== 'NONE',
            createdAt: serverNow
        };
        transaction.set(responseRef, responsePayload);
        functions.logger.info(`SURVEY_SUBMITTED_WITH_SCORE_AND_REWARD: user=${uid}, surveyId=${surveyId}, scoreAwarded=${scoreReward}, rewardAwarded=${rewardResult.rewardAwarded}`);
        return {
            success: true,
            data: {
                completed: true,
                responseId: responseId,
                surveyId: surveyId,
                completedAt: new Date().toISOString(),
                isDuplicate: false,
                profileScoreAwarded: scoreReward,
                currentProfileScore: updatedScore,
                rewardAwarded: rewardResult.rewardAwarded,
                rewardType: rewardResult.rewardType,
                voucherCode: rewardResult.voucherCode,
                voucherTitle: rewardResult.voucherTitle,
                currentRewardBalance: newRewardBalance
            }
        };
    });
};
exports.submitSurveyResponseHandler = submitSurveyResponseHandler;
// --------------------------------------------------
// 4. UPDATE PROFILE SURVEY RESPONSE (PROFILE SURVEY)
// --------------------------------------------------
const updateProfileSurveyResponseHandler = async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const uid = context.auth.uid;
    const { surveyId, answers } = data || {};
    if (!surveyId || typeof surveyId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'A valid surveyId is required.');
    }
    if (!Array.isArray(answers) || answers.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'Answers list cannot be empty.');
    }
    if (answers.length > 3) {
        throw new functions.https.HttpsError('invalid-argument', 'PAG V1 profile surveys support a maximum of 3 questions.');
    }
    const db = admin.firestore();
    const surveyRef = db.collection('surveys').doc(surveyId);
    const userRef = db.collection('users').doc(uid);
    const userProfileRef = db.collection('users').doc(uid).collection('profile').doc('current');
    const responseId = `${surveyId}_${uid}`;
    const responseRef = db.collection('surveyResponses').doc(responseId);
    const ledgerId = `PROFILE_SURVEY_${surveyId}_${uid}`;
    const ledgerRef = db.collection('profileScoreLedgers').doc(ledgerId);
    const serverNow = admin.firestore.FieldValue.serverTimestamp();
    return await db.runTransaction(async (transaction) => {
        const surveyDoc = await transaction.get(surveyRef);
        if (!surveyDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Survey not found.');
        }
        const survey = surveyDoc.data();
        if (survey.surveyType !== 'PROFILE') {
            throw new functions.https.HttpsError('invalid-argument', 'Use submitSurveyResponse for PAG or ORGANIZATION surveys.');
        }
        const surveyQuestions = survey.questions || [];
        const profileUpdates = {
            updatedAt: serverNow
        };
        for (const ans of answers) {
            const q = surveyQuestions.find((sq) => sq.questionId === ans.questionId);
            if (!q) {
                throw new functions.https.HttpsError('invalid-argument', `Question ID ${ans.questionId} not found in survey.`);
            }
            const opt = q.options.find((o) => o.optionId === ans.optionId);
            if (!opt) {
                throw new functions.https.HttpsError('invalid-argument', `Option ID ${ans.optionId} is invalid.`);
            }
            profileUpdates[ans.questionId] = {
                optionId: ans.optionId,
                label: opt.label,
                updatedAt: new Date().toISOString()
            };
        }
        transaction.set(userProfileRef, profileUpdates, { merge: true });
        const userDoc = await transaction.get(userRef);
        const existingUserScore = userDoc.exists ? (userDoc.data()?.profileScore || 0) : 0;
        const existingLedger = await transaction.get(ledgerRef);
        let awardedScore = 0;
        // Award Profile Score ONLY on first completion of Profile Survey
        if (!existingLedger.exists) {
            awardedScore = survey.profileScoreReward || 0;
            const ledgerPayload = {
                id: ledgerId,
                userId: uid,
                sourceType: 'PROFILE_SURVEY',
                sourceId: surveyId,
                amount: awardedScore,
                reason: survey.title || 'COMPLETED_PROFILE_SURVEY',
                createdAt: serverNow,
                metadata: {
                    surveyType: 'PROFILE'
                }
            };
            transaction.set(ledgerRef, ledgerPayload);
            transaction.set(userRef, {
                profileScore: admin.firestore.FieldValue.increment(awardedScore),
                updatedAt: serverNow
            }, { merge: true });
        }
        const responsePayload = {
            responseId: responseId,
            surveyId: surveyId,
            userId: uid,
            organizationId: null,
            surveyType: 'PROFILE',
            answers: answers,
            status: 'COMPLETED',
            submittedAt: serverNow,
            serverCompletedAt: serverNow,
            profileScoreProcessed: true,
            rewardProcessed: false,
            createdAt: serverNow
        };
        transaction.set(responseRef, responsePayload, { merge: true });
        const finalScore = existingUserScore + awardedScore;
        functions.logger.info(`PROFILE_SURVEY_PROCESSED: user=${uid}, awarded=${awardedScore}, total=${finalScore}`);
        return {
            success: true,
            data: {
                completed: true,
                responseId: responseId,
                surveyId: surveyId,
                completedAt: new Date().toISOString(),
                profileScoreAwarded: awardedScore,
                currentProfileScore: finalScore
            }
        };
    });
};
exports.updateProfileSurveyResponseHandler = updateProfileSurveyResponseHandler;
//# sourceMappingURL=survey.js.map