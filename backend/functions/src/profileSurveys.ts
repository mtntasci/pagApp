import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { BasicProfileInput } from './profile';

export interface ProfileQuestionOption {
  optionId: string;
  label: string;
  order: number;
}

export interface ProfileQuestion {
  id: string;
  questionText: string;
  categoryId: string;
  categoryName: string;
  targetingGender: 'ALL' | 'MALE' | 'FEMALE';
  options: ProfileQuestionOption[];
  profileScoreReward: number;
  status: 'DRAFT' | 'APPROVED' | 'ACTIVE' | 'ARCHIVED';
  showOnHome: boolean;
  sortOrder: number;
  createdAt: any;
  updatedAt: any;
  createdBy: string;
}

export interface ProfileCategory {
  id: string;
  name: string;
  isVisible: boolean;
  sortOrder: number;
  createdAt?: any;
  updatedAt?: any;
}

// 13 Official Profile Survey Categories Seed
export const DEFAULT_PROFILE_CATEGORIES: ProfileCategory[] = [
  { id: "yasam-tarzi", name: "Yaşam Tarzı", isVisible: true, sortOrder: 1 },
  { id: "alisveris-aliskanliklari", name: "Alışveriş Alışkanlıkları", isVisible: true, sortOrder: 2 },
  { id: "yeme-icme", name: "Yeme & İçme", isVisible: true, sortOrder: 3 },
  { id: "teknoloji-kullanimi", name: "Teknoloji Kullanımı", isVisible: true, sortOrder: 4 },
  { id: "ulasim-arac", name: "Ulaşım & Araç", isVisible: true, sortOrder: 5 },
  { id: "spor-aktivite", name: "Spor & Aktivite", isVisible: true, sortOrder: 6 },
  { id: "seyahat", name: "Seyahat", isVisible: true, sortOrder: 7 },
  { id: "finansal-aliskanliklar", name: "Finansal Alışkanlıklar", isVisible: true, sortOrder: 8 },
  { id: "ev-aile", name: "Ev & Aile", isVisible: true, sortOrder: 9 },
  { id: "ilgi-alanlari", name: "İlgi Alanları", isVisible: true, sortOrder: 10 },
  { id: "medya-eglence", name: "Medya & Eğlence", isVisible: true, sortOrder: 11 },
  { id: "kariyer-calisma-hayati", name: "Kariyer & Çalışma Hayatı", isVisible: true, sortOrder: 12 },
  { id: "genel", name: "Genel", isVisible: true, sortOrder: 13 }
];

// Helper: Evaluate gender eligibility for Profile Questions
export function isGenderEligible(
  questionGender: 'ALL' | 'MALE' | 'FEMALE',
  userGender?: string
): boolean {
  if (questionGender === 'ALL') return true;
  if (!userGender || userGender === 'PREFER_NOT_TO_SAY') return false;
  return questionGender === userGender;
}

// --------------------------------------------------
// 1. GET ELIGIBLE PROFILE QUESTIONS FOR USER (BATCH SIZE 3)
// --------------------------------------------------
export const getProfileQuestionsHandler = async (
  data: { categoryId?: string; batchSize?: number },
  context: functions.https.CallableContext
) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const uid = context.auth.uid;
  const db = admin.firestore();
  const batchSize = Math.min(Math.max(data?.batchSize || 3, 1), 3); // Strictly max 3 per batch

  // Read User Basic Profile for Gender
  const userBasicSnap = await db.collection('users').doc(uid).collection('profile').doc('basic').get();
  const userBasicData = userBasicSnap.exists ? userBasicSnap.data() as BasicProfileInput : null;
  const userGender = userBasicData?.gender || 'PREFER_NOT_TO_SAY';

  // Read User Profile Answers
  const userAnswersSnap = await db.collection('userProfileAnswers').doc(uid).collection('answers').get();
  const answeredQuestionIds = new Set<string>();
  userAnswersSnap.docs.forEach((doc) => {
    answeredQuestionIds.add(doc.id);
  });

  // Query Active Profile Questions
  let query: admin.firestore.Query = db.collection('profileQuestions').where('status', '==', 'ACTIVE');
  if (data?.categoryId) {
    query = query.where('categoryId', '==', data.categoryId);
  }

  const questionsSnap = await query.get();
  const allQuestions: ProfileQuestion[] = [];

  questionsSnap.docs.forEach((doc) => {
    const qData = doc.data() as ProfileQuestion;
    qData.id = doc.id;
    if (isGenderEligible(qData.targetingGender || 'ALL', userGender)) {
      allQuestions.push(qData);
    }
  });

  // Sort questions by sortOrder ASC, createdAt DESC
  allQuestions.sort((a, b) => {
    const orderDiff = (a.sortOrder || 0) - (b.sortOrder || 0);
    if (orderDiff !== 0) return orderDiff;
    const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
    const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
    return bTime - aTime;
  });

  // Split into unanswered and answered
  const unanswered = allQuestions.filter((q) => !answeredQuestionIds.has(q.id));
  const answered = allQuestions.filter((q) => answeredQuestionIds.has(q.id));

  // Dynamic Available Score Calculation (X = sum of score rewards of unanswered eligible questions)
  const availableScoreX = unanswered.reduce((sum, q) => sum + (q.profileScoreReward || 10), 0);

  // Check if at least one unanswered question has showOnHome == true
  const hasPromotedQuestion = unanswered.some((q) => q.showOnHome === true);

  // Take first batch (max 3)
  const currentBatch = unanswered.slice(0, batchSize);

  return {
    success: true,
    data: {
      unansweredQuestions: currentBatch,
      totalUnansweredCount: unanswered.length,
      totalAnsweredCount: answered.length,
      availableScoreX,
      hasPromotedQuestion,
      hasMoreUnanswered: unanswered.length > batchSize
    }
  };
};

// --------------------------------------------------
// 2. SUBMIT PROFILE QUESTION ANSWERS (BATCH SUBMIT)
// --------------------------------------------------
export const submitProfileQuestionAnswersHandler = async (
  data: { answers: Array<{ questionId: string; optionId: string }> },
  context: functions.https.CallableContext
) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const uid = context.auth.uid;
  const answers = data?.answers;

  if (!Array.isArray(answers) || answers.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Answers list cannot be empty.');
  }

  if (answers.length > 3) {
    throw new functions.https.HttpsError('invalid-argument', 'Maximum 3 answers allowed per batch session.');
  }

  const db = admin.firestore();
  const serverNow = admin.firestore.FieldValue.serverTimestamp();

  return await db.runTransaction(async (transaction) => {
    // === 1. ALL READS FIRST ===
    const questionRefs = answers.map((a) => db.collection('profileQuestions').doc(a.questionId));
    const ledgerRefs = answers.map((a) => db.collection('profileScoreLedgers').doc(`PROFILE_Q_${a.questionId}_${uid}`));
    const answerRefs = answers.map((a) => db.collection('userProfileAnswers').doc(uid).collection('answers').doc(a.questionId));
    const userRef = db.collection('users').doc(uid);

    const questionDocs = await Promise.all(questionRefs.map((ref) => transaction.get(ref)));
    const ledgerDocs = await Promise.all(ledgerRefs.map((ref) => transaction.get(ref)));
    const userDoc = await transaction.get(userRef);

    let batchScoreAwarded = 0;
    const writesToPerform: Array<() => void> = [];

    for (let i = 0; i < answers.length; i++) {
      const ans = answers[i];
      const qDoc = questionDocs[i];
      const ledgerDoc = ledgerDocs[i];
      const answerRef = answerRefs[i];

      if (!qDoc.exists) {
        throw new functions.https.HttpsError('not-found', `Profile question ${ans.questionId} not found.`);
      }

      const qData = qDoc.data() as ProfileQuestion;
      const options = qData.options || [];
      const validOpt = options.find((o) => o.optionId === ans.optionId || (o as any).label === ans.optionId);
      if (!validOpt) {
        throw new functions.https.HttpsError('invalid-argument', `Invalid option ${ans.optionId} for question ${ans.questionId}.`);
      }

      // Check if first time answering (Score Ledger does not exist)
      const isFirstAnswer = !ledgerDoc.exists;
      const scoreReward = isFirstAnswer ? (qData.profileScoreReward || 10) : 0;

      if (isFirstAnswer) {
        batchScoreAwarded += scoreReward;
        // Schedule Score Ledger Write
        const ledgerRef = ledgerRefs[i];
        writesToPerform.push(() => {
          transaction.set(ledgerRef, {
            id: `PROFILE_Q_${ans.questionId}_${uid}`,
            userId: uid,
            sourceType: 'PROFILE',
            sourceId: ans.questionId,
            amount: scoreReward,
            reason: qData.questionText || 'Profil Anket Yanıtı',
            createdAt: serverNow,
            metadata: {
              categoryId: qData.categoryId,
              categoryName: qData.categoryName
            }
          });
        });
      }

      // Schedule User Answer Write
      writesToPerform.push(() => {
        transaction.set(answerRef, {
          questionId: ans.questionId,
          selectedOptionId: validOpt.optionId,
          selectedOptionLabel: validOpt.label,
          categoryId: qData.categoryId,
          updatedAt: serverNow,
          firstAnsweredAt: serverNow
        }, { merge: true });
      });
    }

    // === 2. ALL WRITES AFTER READS ===
    writesToPerform.forEach((w) => w());

    if (batchScoreAwarded > 0) {
      transaction.set(userRef, {
        profileScore: admin.firestore.FieldValue.increment(batchScoreAwarded),
        updatedAt: serverNow
      }, { merge: true });
    }

    const currentScore = (userDoc.exists ? (userDoc.data()?.profileScore || 0) : 0) + batchScoreAwarded;

    return {
      success: true,
      data: {
        batchScoreAwarded,
        currentProfileScore: currentScore,
        completedCount: answers.length
      }
    };
  });
};

// --------------------------------------------------
// 3. GET ANSWERED PROFILE QUESTIONS (PAST ANSWERS)
// --------------------------------------------------
export const getAnsweredProfileQuestionsHandler = async (
  data: any,
  context: functions.https.CallableContext
) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const uid = context.auth.uid;
  const db = admin.firestore();

  const userAnswersSnap = await db.collection('userProfileAnswers').doc(uid).collection('answers').get();
  const answeredList: any[] = [];

  for (const doc of userAnswersSnap.docs) {
    const aData = doc.data();
    const qDoc = await db.collection('profileQuestions').doc(doc.id).get();
    if (qDoc.exists) {
      const qData = qDoc.data() as ProfileQuestion;
      answeredList.push({
        questionId: doc.id,
        questionText: qData.questionText,
        categoryId: qData.categoryId,
        categoryName: qData.categoryName,
        options: qData.options || [],
        selectedOptionId: aData.selectedOptionId,
        selectedOptionLabel: aData.selectedOptionLabel,
        updatedAt: aData.updatedAt?.toDate ? aData.updatedAt.toDate().toISOString() : aData.updatedAt
      });
    }
  }

  return {
    success: true,
    data: {
      answeredQuestions: answeredList
    }
  };
};

// --------------------------------------------------
// 4. UPDATE EXISTING PROFILE QUESTION ANSWER (ZERO SCORE)
// --------------------------------------------------
export const updateProfileQuestionAnswerHandler = async (
  data: { questionId: string; selectedOptionId: string },
  context: functions.https.CallableContext
) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const uid = context.auth.uid;
  const { questionId, selectedOptionId } = data || {};

  if (!questionId || !selectedOptionId) {
    throw new functions.https.HttpsError('invalid-argument', 'questionId and selectedOptionId are required.');
  }

  const db = admin.firestore();
  const serverNow = admin.firestore.FieldValue.serverTimestamp();

  const qDoc = await db.collection('profileQuestions').doc(questionId).get();
  if (!qDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Profile question not found.');
  }

  const qData = qDoc.data() as ProfileQuestion;
  const opt = (qData.options || []).find((o) => o.optionId === selectedOptionId || (o as any).label === selectedOptionId);
  if (!opt) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid option ID.');
  }

  const answerRef = db.collection('userProfileAnswers').doc(uid).collection('answers').doc(questionId);
  await answerRef.set({
    questionId: questionId,
    selectedOptionId: opt.optionId,
    selectedOptionLabel: opt.label,
    categoryId: qData.categoryId,
    updatedAt: serverNow
  }, { merge: true });

  functions.logger.info(`PROFILE_ANSWER_UPDATED_ZERO_SCORE: user=${uid}, questionId=${questionId}`);

  return {
    success: true,
    data: {
      updated: true,
      scoreAwarded: 0
    }
  };
};

// --------------------------------------------------
// 5. ADMIN: CREATE OR UPDATE PROFILE QUESTION
// --------------------------------------------------
export const createOrUpdateProfileQuestionAdminHandler = async (
  data: Partial<ProfileQuestion>,
  context: functions.https.CallableContext
) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const uid = context.auth.uid;
  const db = admin.firestore();

  const portalUserDoc = await db.collection('portalUsers').doc(uid).get();
  if (!portalUserDoc.exists) {
    throw new functions.https.HttpsError('permission-denied', 'Only authorized portal users can manage profile questions.');
  }

  const portalUser = portalUserDoc.data();
  const role = portalUser?.role || 'PAG_STAFF';

  if (!['SUPER_ADMIN', 'PAG_STAFF'].includes(role)) {
    throw new functions.https.HttpsError('permission-denied', 'Insufficient portal privileges.');
  }

  const { id, questionText, categoryId, categoryName, targetingGender, options, profileScoreReward, status, showOnHome, sortOrder } = data;

  if (!questionText || typeof questionText !== 'string' || questionText.trim() === '') {
    throw new functions.https.HttpsError('invalid-argument', 'Valid questionText is required.');
  }

  if (!Array.isArray(options) || options.length < 2) {
    throw new functions.https.HttpsError('invalid-argument', 'At least 2 options are required.');
  }

  const questionId = id || `pq_${Date.now()}`;
  const questionRef = db.collection('profileQuestions').doc(questionId);
  const serverNow = admin.firestore.FieldValue.serverTimestamp();

  // Role Approval Authority Logic:
  // SUPER_ADMIN can activate directly.
  // PAG_STAFF creates as DRAFT / PENDING_APPROVAL.
  let targetStatus = status || 'DRAFT';
  if (role === 'PAG_STAFF' && targetStatus === 'ACTIVE') {
    targetStatus = 'DRAFT';
  }

  const payload: Partial<ProfileQuestion> = {
    id: questionId,
    questionText: questionText.trim(),
    categoryId: categoryId || 'cat_lifestyle',
    categoryName: categoryName || 'Yaşam Tarzı',
    targetingGender: targetingGender || 'ALL',
    options: options.map((opt, idx) => ({
      optionId: opt.optionId || `opt_${idx + 1}`,
      label: opt.label || `Seçenek ${idx + 1}`,
      order: opt.order || idx + 1
    })),
    profileScoreReward: typeof profileScoreReward === 'number' ? profileScoreReward : 10,
    status: targetStatus,
    showOnHome: !!showOnHome,
    sortOrder: typeof sortOrder === 'number' ? sortOrder : 1,
    updatedAt: serverNow,
    createdBy: uid
  };

  const existingDoc = await questionRef.get();
  if (!existingDoc.exists) {
    payload.createdAt = serverNow;
  }

  await questionRef.set(payload, { merge: true });

  return {
    success: true,
    data: {
      questionId,
      status: targetStatus
    }
  };
};

// --------------------------------------------------
// 6. ADMIN: LIST PROFILE QUESTIONS
// --------------------------------------------------
export const listProfileQuestionsAdminHandler = async (
  data: { categoryId?: string },
  context: functions.https.CallableContext
) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const uid = context.auth.uid;
  const db = admin.firestore();

  const portalUserDoc = await db.collection('portalUsers').doc(uid).get();
  if (!portalUserDoc.exists) {
    throw new functions.https.HttpsError('permission-denied', 'Unauthorized portal access.');
  }

  let query: admin.firestore.Query = db.collection('profileQuestions');
  if (data?.categoryId) {
    query = query.where('categoryId', '==', data.categoryId);
  }

  const snap = await query.get();
  const list: any[] = [];
  snap.docs.forEach((doc) => {
    const d = doc.data();
    list.push({
      ...d,
      id: doc.id,
      createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt,
      updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : d.updatedAt
    });
  });

  return {
    success: true,
    data: {
      questions: list
    }
  };
};

// --------------------------------------------------
// 7. ADMIN: MANAGE PROFILE CATEGORIES
// --------------------------------------------------
export const manageProfileCategoriesAdminHandler = async (
  data: { action: 'GET' | 'SAVE'; category?: ProfileCategory },
  context: functions.https.CallableContext
) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const db = admin.firestore();
  const collectionRef = db.collection('profileSurveyCategories');

  if (data?.action === 'SAVE' && data.category) {
    const cat = data.category;
    const catId = cat.id || cat.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const existingDoc = await collectionRef.doc(catId).get();
    const serverNow = admin.firestore.FieldValue.serverTimestamp();

    await collectionRef.doc(catId).set({
      id: catId,
      name: cat.name,
      isVisible: typeof cat.isVisible === 'boolean' ? cat.isVisible : true,
      sortOrder: typeof cat.sortOrder === 'number' ? cat.sortOrder : 1,
      updatedAt: serverNow,
      createdAt: existingDoc.exists ? (existingDoc.data()?.createdAt || serverNow) : serverNow
    }, { merge: true });

    return {
      success: true,
      data: { categoryId: catId }
    };
  }

  // GET categories
  let snap = await collectionRef.get();

  if (snap.empty) {
    // Auto Seed Official 13 Profile Categories
    const batch = db.batch();
    const serverNow = admin.firestore.FieldValue.serverTimestamp();
    DEFAULT_PROFILE_CATEGORIES.forEach((cat) => {
      const docRef = collectionRef.doc(cat.id);
      batch.set(docRef, {
        ...cat,
        createdAt: serverNow,
        updatedAt: serverNow
      });
    });
    await batch.commit();
    snap = await collectionRef.get();
  }

  const categories: ProfileCategory[] = [];
  snap.docs.forEach((doc) => {
    const d = doc.data();
    categories.push({
      id: doc.id,
      name: d.name || doc.id,
      isVisible: typeof d.isVisible === 'boolean' ? d.isVisible : true,
      sortOrder: typeof d.sortOrder === 'number' ? d.sortOrder : 1,
      createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt,
      updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : d.updatedAt
    });
  });

  categories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return {
    success: true,
    data: { categories }
  };
};
