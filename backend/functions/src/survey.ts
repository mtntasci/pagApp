import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { processSurveyRewardInTransaction } from './reward';
import { evaluateSurveyTargeting } from './targeting';

export interface PAGQuestionOption {
  optionId: string;
  label: string;
  order: number;
}

export interface PAGQuestion {
  questionId: string;
  order: number;
  type: 'SINGLE_SELECT';
  text: string;
  options: PAGQuestionOption[];
}

export interface PAGSurveyTargeting {
  type: 'ALL' | 'PROFILE' | 'LOCATION';
  field?: string;
  operator?: string;
  value?: string;
  country?: string;
  city?: string;
}

export interface PAGSurveyData {
  surveyId: string;
  ownerType: 'PAG' | 'ORGANIZATION';
  organizationId?: string | null;
  surveyType: 'PROFILE' | 'PAG' | 'ORGANIZATION' | 'VERIFICATION';
  masterSurveyId?: string | null;
  title: string;
  description: string;
  status: 'DRAFT' | 'APPROVED' | 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'CANCELLED';
  startAt: any;
  endAt: any;
  questionCount: number;
  questions: PAGQuestion[];
  targeting: PAGSurveyTargeting;
  profileScoreReward: number;
  rewardDefinitionId?: string | null;
  createdBy?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface PAGAnswerInput {
  questionId: string;
  optionId: string;
}

export interface SubmitSurveyInput {
  surveyId: string;
  answers: PAGAnswerInput[];
}

// --------------------------------------------------
// 1. GET ELIGIBLE SURVEYS
// --------------------------------------------------
export const getEligibleSurveysHandler = async (
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
  const now = admin.firestore.Timestamp.now();

  const [surveysSnapshot, userResponsesSnapshot, basicProfileSnap] = await Promise.all([
    db.collection('surveys').where('status', 'in', ['ACTIVE', 'APPROVED', 'SCHEDULED']).get(),
    db.collection('surveyResponses').where('userId', '==', uid).get(),
    db.collection('users').doc(uid).collection('profile').doc('basic').get().catch(() => ({ exists: false, data: () => null } as any))
  ]);

  const completedSurveyIds = new Set<string>();
  userResponsesSnapshot.docs.forEach((doc) => {
    const resData = doc.data();
    if (resData.surveyId) {
      completedSurveyIds.add(resData.surveyId);
    }
  });

  const eligibleSurveys: any[] = [];
  const userBasicProfile = basicProfileSnap.exists ? basicProfileSnap.data() : null;

  surveysSnapshot.docs.forEach((doc) => {
    const survey = doc.data() as PAGSurveyData & { isArchived?: boolean };

    if (survey.isArchived) return;

    if (survey.startAt) {
      const startTime = survey.startAt.toDate ? survey.startAt.toDate() : new Date(survey.startAt);
      if (!isNaN(startTime.getTime()) && startTime > now.toDate()) return;
    }
    if (survey.endAt) {
      const endTime = survey.endAt.toDate ? survey.endAt.toDate() : new Date(survey.endAt);
      if (!isNaN(endTime.getTime()) && endTime < now.toDate()) return;
    }

    const isCompleted = completedSurveyIds.has(survey.surveyId);

    if (isCompleted && survey.surveyType !== 'PROFILE') {
      return;
    }

    // Verification surveys are private to accepted participants and not listed in public feed
    if (survey.surveyType === 'VERIFICATION') {
      return;
    }

    // Evaluate Basic Profile & Campaign targeting server-side
    const isTargeted = evaluateSurveyTargeting(survey.targeting as any, userBasicProfile);
    if (!isTargeted) {
      return;
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
      isCompleted: isCompleted,
      isHighlighted: Boolean((survey as any).isHighlighted)
    });
  });

  // Sort highlighted surveys to the top
  eligibleSurveys.sort((a, b) => {
    if (a.isHighlighted === b.isHighlighted) return 0;
    return a.isHighlighted ? -1 : 1;
  });

  return {
    success: true,
    data: {
      surveys: eligibleSurveys
    }
  };
};

// --------------------------------------------------
// 2. GET SURVEY DETAIL
// --------------------------------------------------
export const getSurveyDetailHandler = async (
  data: { surveyId: string },
  context: functions.https.CallableContext
) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const surveyId = data?.surveyId;
  if (!surveyId || typeof surveyId !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'A valid surveyId is required.'
    );
  }

  const uid = context.auth.uid;
  const db = admin.firestore();

  const surveyDoc = await db.collection('surveys').doc(surveyId).get();
  if (!surveyDoc.exists) {
    throw new functions.https.HttpsError(
      'not-found',
      `Survey with ID ${surveyId} not found.`
    );
  }

  const survey = surveyDoc.data() as PAGSurveyData;
  const now = admin.firestore.Timestamp.now();

  const activeStatuses = ['ACTIVE', 'APPROVED', 'SCHEDULED'];
  if (!activeStatuses.includes(survey.status) || (survey as any).isArchived) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'This survey is no longer active.'
    );
  }

  if (survey.startAt) {
    const startTime = survey.startAt.toDate ? survey.startAt.toDate() : new Date(survey.startAt);
    if (!isNaN(startTime.getTime()) && startTime > now.toDate()) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'This survey has not started yet.'
      );
    }
  }

  if (survey.endAt) {
    const endTime = survey.endAt.toDate ? survey.endAt.toDate() : new Date(survey.endAt);
    if (endTime < now.toDate()) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'This survey has expired.'
      );
    }
  }

  const responseRef = db.collection('surveyResponses').doc(`${surveyId}_${uid}`);
  const responseDoc = await responseRef.get();
  const isCompleted = responseDoc.exists;

  // Verification Survey Authorization Check
  if (survey.surveyType === 'VERIFICATION') {
    const assignSnap = await db.collection('surveyVerificationAssignments')
      .where('userId', '==', uid)
      .where('verificationSurveyId', '==', surveyId)
      .limit(1)
      .get();

    if (assignSnap.empty) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Bu kalite doğrulama anketine erişim yetkiniz bulunmuyor.'
      );
    }

    const assignData = assignSnap.docs[0].data();
    if (!['ACCEPTED', 'PUSH_SENT', 'VERIFICATION_COMPLETED'].includes(assignData.status)) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Bu kalite doğrulama anketi henüz onaylanmamış veya aktif değildir.'
      );
    }
  }

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

// --------------------------------------------------
// 3. SUBMIT SURVEY RESPONSE + SCORE ENGINE (PAG / ORGANIZATION)
// --------------------------------------------------
export const submitSurveyResponseHandler = async (
  data: SubmitSurveyInput,
  context: functions.https.CallableContext
) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const uid = context.auth.uid;
  const { surveyId, answers } = data || {};

  if (!surveyId || typeof surveyId !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'A valid surveyId is required.'
    );
  }

  if (!Array.isArray(answers) || answers.length === 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Answers list cannot be empty.'
    );
  }

  if (answers.length > 3) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'PAG V1 surveys support a maximum of 3 questions.'
    );
  }

  const db = admin.firestore();
  const surveyRef = db.collection('surveys').doc(surveyId);
  const userRef = db.collection('users').doc(uid);
  const responseId = `${surveyId}_${uid}`;
  const responseRef = db.collection('surveyResponses').doc(responseId);
  const ledgerId = `SURVEY_${surveyId}_${uid}`;
  const ledgerRef = db.collection('users').doc(uid).collection('profileScoreLedgers').doc(ledgerId);

  const serverNow = admin.firestore.FieldValue.serverTimestamp();

  return await db.runTransaction(async (transaction) => {
    // === 1. ALL READS FIRST ===
    const surveyDoc = await transaction.get(surveyRef);
    if (!surveyDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Survey not found.');
    }

    const survey = surveyDoc.data() as PAGSurveyData & { isArchived?: boolean };
    const activeStatuses = ['ACTIVE', 'APPROVED', 'SCHEDULED'];
    if (!activeStatuses.includes(survey.status) || survey.isArchived) {
      throw new functions.https.HttpsError('failed-precondition', 'Survey is not active.');
    }

    if (survey.surveyType === 'PROFILE') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Use updateProfileSurveyResponse for PROFILE surveys.'
      );
    }

    let verificationAssignRef: admin.firestore.DocumentReference | null = null;
    if (survey.surveyType === 'VERIFICATION') {
      const assignSnap = await transaction.get(
        db.collection('surveyVerificationAssignments')
          .where('userId', '==', uid)
          .where('verificationSurveyId', '==', surveyId)
          .limit(1)
      );

      if (assignSnap.empty) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'Bu kalite doğrulama anketi için yetkiniz bulunmuyor.'
        );
      }

      const aData = assignSnap.docs[0].data();
      if (!['ACCEPTED', 'PUSH_SENT', 'VERIFICATION_COMPLETED'].includes(aData.status)) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'Bu kalite doğrulama anketi henüz onaylanmamış veya aktif değildir.'
        );
      }
      verificationAssignRef = assignSnap.docs[0].ref;
    } else {
      // Verify server-authoritative targeting eligibility for regular surveys
      const userBasicProfileDoc = await transaction.get(db.collection('users').doc(uid).collection('profile').doc('basic'));
      const userBasicProfile = userBasicProfileDoc.exists ? userBasicProfileDoc.data() : null;
      const isEligibleTarget = evaluateSurveyTargeting(survey.targeting as any, userBasicProfile);
      if (!isEligibleTarget) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'User does not meet the basic profile targeting criteria for this survey.'
        );
      }
    }

    const surveyQuestions = survey.questions || [];
    if (answers.length > surveyQuestions.length && surveyQuestions.length > 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Answers count (${answers.length}) exceeds question count (${surveyQuestions.length}).`
      );
    }

    for (const ans of answers) {
      const q = surveyQuestions.find((sq) => sq.questionId === ans.questionId || (sq as any).id === ans.questionId);
      if (q && Array.isArray(q.options)) {
        const opt = q.options.find((o: any, idx: number) => {
          if (typeof o === 'string') return o === ans.optionId || String(idx + 1) === ans.optionId;
          return (
            o.optionId === ans.optionId ||
            o.label === ans.optionId ||
            `opt_${idx + 1}` === ans.optionId ||
            String(idx + 1) === ans.optionId
          );
        });
        if (!opt) {
          functions.logger.warn(`Option ID ${ans.optionId} fuzzy fallback applied for question ${ans.questionId}`);
        }
      }
    }

    const userDoc = await transaction.get(userRef);
    const existingUserScore = userDoc.exists ? (userDoc.data()?.profileScore || 0) : 0;
    const existingRewardBalance = userDoc.exists ? (userDoc.data()?.rewardBalance || 0) : 0;

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

    // Process Financial Reward / Voucher Engine (All READS happen inside here before any WRITE!)
    const rewardResult = await processSurveyRewardInTransaction(
      transaction,
      db,
      uid,
      surveyId,
      survey,
      serverNow
    );

    // === 2. ALL WRITES AFTER ALL READS ===
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

    // Handle Money Reward Write if applicable
    if (rewardResult.rewardType === 'MONEY' && rewardResult.rewardAwarded > 0) {
      const rewardLedgerId = `REWARD_${surveyId}_${uid}`;
      const rewardLedgerRef = db.collection('rewardLedgers').doc(rewardLedgerId);
      transaction.set(rewardLedgerRef, {
        id: rewardLedgerId,
        userId: uid,
        surveyId: surveyId,
        type: 'MONEY',
        amount: rewardResult.rewardAwarded,
        reason: survey.title || 'ANKET_ODUL_KAZANCI',
        createdAt: serverNow
      });
      transaction.set(userRef, {
        rewardBalance: admin.firestore.FieldValue.increment(rewardResult.rewardAwarded),
        updatedAt: serverNow
      }, { merge: true });
    }

    // Handle Voucher Reward Write if applicable
    if (rewardResult.rewardType === 'VOUCHER' && rewardResult.voucherRef) {
      transaction.update(rewardResult.voucherRef, {
        status: 'ASSIGNED',
        assignedUserId: uid,
        assignedAt: serverNow
      });
      const rewardLedgerId = `REWARD_${surveyId}_${uid}`;
      const rewardLedgerRef = db.collection('rewardLedgers').doc(rewardLedgerId);
      transaction.set(rewardLedgerRef, {
        id: rewardLedgerId,
        userId: uid,
        surveyId: surveyId,
        type: 'VOUCHER',
        amount: rewardResult.rewardAwarded,
        voucherId: rewardResult.voucherId,
        voucherPoolId: rewardResult.voucherPoolId,
        voucherTitle: rewardResult.voucherTitle,
        reason: survey.title || 'ANKET_HEDIYE_CEKI',
        createdAt: serverNow
      });
    }

    const updatedScore = existingUserScore + scoreReward;
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

    // Atomically increment completedCount & responseCount on the Survey document
    transaction.set(surveyDoc.ref, {
      completedCount: admin.firestore.FieldValue.increment(1),
      responseCount: admin.firestore.FieldValue.increment(1),
      updatedAt: serverNow
    }, { merge: true });

    // If this is a Quality Verification Survey, mark assignment as VERIFICATION_COMPLETED
    if (verificationAssignRef) {
      transaction.update(verificationAssignRef, {
        status: 'VERIFICATION_COMPLETED',
        updatedAt: serverNow
      });
    }

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

// --------------------------------------------------
// 4. UPDATE PROFILE SURVEY RESPONSE (PROFILE SURVEY)
// --------------------------------------------------
export const updateProfileSurveyResponseHandler = async (
  data: SubmitSurveyInput,
  context: functions.https.CallableContext
) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const uid = context.auth.uid;
  const { surveyId, answers } = data || {};

  if (!surveyId || typeof surveyId !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'A valid surveyId is required.'
    );
  }

  if (!Array.isArray(answers) || answers.length === 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Answers list cannot be empty.'
    );
  }

  if (answers.length > 3) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'PAG V1 profile surveys support a maximum of 3 questions.'
    );
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

    const survey = surveyDoc.data() as PAGSurveyData;
    if (survey.surveyType !== 'PROFILE') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Use submitSurveyResponse for PAG or ORGANIZATION surveys.'
      );
    }

    const surveyQuestions = survey.questions || [];
    const profileUpdates: Record<string, any> = {
      updatedAt: serverNow
    };

    for (const ans of answers) {
      const q = surveyQuestions.find((sq) => sq.questionId === ans.questionId);
      if (!q) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          `Question ID ${ans.questionId} not found in survey.`
        );
      }
      const opt = q.options.find((o) => o.optionId === ans.optionId);
      if (!opt) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          `Option ID ${ans.optionId} is invalid.`
        );
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

    // Atomically increment completedCount & responseCount on the Survey document
    transaction.set(surveyDoc.ref, {
      completedCount: admin.firestore.FieldValue.increment(1),
      responseCount: admin.firestore.FieldValue.increment(1),
      updatedAt: serverNow
    }, { merge: true });

    // Also write to user subcollection profileScoreLedgers
    if (!existingLedger.exists && awardedScore > 0) {
      const userSubLedgerRef = db.collection('users').doc(uid).collection('profileScoreLedgers').doc(ledgerId);
      transaction.set(userSubLedgerRef, {
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
      });
    }

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

// --------------------------------------------------
// 5. GET COMPLETED SURVEYS
// --------------------------------------------------
export const getCompletedSurveysHandler = async (
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

  const userResponsesSnapshot = await db
    .collection('surveyResponses')
    .where('userId', '==', uid)
    .get();

  const completedSurveys: any[] = [];

  for (const doc of userResponsesSnapshot.docs) {
    const resData = doc.data();
    if (!resData.surveyId) continue;

    const surveyDoc = await db.collection('surveys').doc(resData.surveyId).get();
    const surveyData = surveyDoc.exists ? (surveyDoc.data() as PAGSurveyData) : null;

    completedSurveys.push({
      surveyId: resData.surveyId,
      ownerType: surveyData?.ownerType || 'PAG',
      organizationId: resData.organizationId || surveyData?.organizationId || null,
      surveyType: resData.surveyType || surveyData?.surveyType || 'PAG',
      title: surveyData?.title || 'Tamamlanan Anket',
      description: surveyData?.description || 'Bu anketi başarıyla tamamladınız.',
      status: 'COMPLETED',
      questionCount: surveyData?.questions ? surveyData.questions.length : 3,
      profileScoreReward: surveyData?.profileScoreReward || 0,
      isCompleted: true,
      completedAt: resData.submittedAt || resData.createdAt || new Date().toISOString()
    });
  }

  return {
    success: true,
    data: {
      surveys: completedSurveys
    }
  };
};
