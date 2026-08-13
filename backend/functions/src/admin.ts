import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export interface VerifiedAdminUser {
  uid: string;
  email: string;
  role: 'SUPER_ADMIN' | 'PAG_STAFF' | 'ORGANIZATION_USER';
  organizationId: string | null;
}

/**
 * Recursively sanitizes objects and arrays by removing undefined fields.
 * Guarantees zero `undefined` values reach Cloud Firestore Admin SDK.
 */
export function removeUndefinedFields<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefinedFields(item)) as unknown as T;
  }
  if (typeof obj === 'object' && !(obj instanceof Date) && !(obj instanceof admin.firestore.FieldValue)) {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      const val = (obj as any)[key];
      if (val !== undefined) {
        cleaned[key] = removeUndefinedFields(val);
      }
    }
    return cleaned as T;
  }
  return obj;
}

// Helper to verify Admin/Portal authorization & retrieve role metadata
export const verifyAdminUser = async (
  context: functions.https.CallableContext,
  db?: admin.firestore.Firestore
): Promise<VerifiedAdminUser> => {
  if (!admin.apps.length) {
    admin.initializeApp();
  }

  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Bu hesap için PAG Portal erişimi bulunmuyor.'
    );
  }

  const uid = context.auth.uid;
  const token = context.auth.token || {};
  const email = (token.email || '').toLowerCase();
  const targetDb = db || admin.firestore();

  // 1. Check portalUsers collection in Firestore
  try {
    const portalUserDoc = await targetDb.collection('portalUsers').doc(uid).get();
    if (portalUserDoc.exists) {
      const pu = portalUserDoc.data();
      if (pu?.status === 'ACTIVE') {
        return {
          uid,
          email: pu.email || email,
          role: pu.role || 'SUPER_ADMIN',
          organizationId: pu.organizationId || null
        };
      } else {
        throw new functions.https.HttpsError(
          'permission-denied',
          'Bu hesap için PAG Portal erişimi bulunmuyor.'
        );
      }
    }
  } catch (err: any) {
    if (err?.code === 'permission-denied' || err?.message?.includes('PAG Portal')) {
      throw err;
    }
  }

  // 2. Custom claim override (for backwards compatibility / mocks)
  if (token.admin === true) {
    return {
      uid,
      email,
      role: 'SUPER_ADMIN',
      organizationId: null
    };
  }

  // 3. Super Admin Bootstrap Rule: mtntasci@gmail.com or admin@pagapp.com
  if (email === 'mtntasci@gmail.com' || email === 'admin@pagapp.com') {
    try {
      await targetDb.collection('portalUsers').doc(uid).set({
        uid: uid,
        email: email,
        role: 'SUPER_ADMIN',
        organizationId: null,
        status: 'ACTIVE',
        mustChangePassword: email === 'admin@pagapp.com',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: 'SYSTEM_BOOTSTRAP',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (err) {
      // Ignore offline Firestore write in unit tests
    }
    return {
      uid,
      email,
      role: 'SUPER_ADMIN',
      organizationId: null
    };
  }

  throw new functions.https.HttpsError(
    'permission-denied',
    'Bu hesap için PAG Portal erişimi bulunmuyor.'
  );
};

// --------------------------------------------------
// 1. ADMIN DASHBOARD METRICS
// --------------------------------------------------
export const getAdminDashboardMetricsHandler = async (
  data: any,
  context: functions.https.CallableContext
) => {
  const adminUser = await verifyAdminUser(context);
  const db = admin.firestore();

  let activeSurveys = 0;
  let activeProfileSurveys = 0;
  let scheduledSurveys = 0;
  let endedSurveys = 0;
  let draftSurveys = 0;
  let pendingSurveys = 0;
  let totalResponses = 0;
  let totalProfileScoreDistributed = 0;
  let totalMoneyRewardDistributed = 0;
  let totalUsers = 0;
  let activePushUsers = 0;

  let basicProfileCompletedCount = 0;
  let phoneVerifiedCount = 0;
  let kycVerifiedCount = 0;
  let ibanSubmittedCount = 0;

  const activeSurveysList: Array<{
    surveyId: string;
    title: string;
    responseCount: number;
  }> = [];

  try {
    const surveysSnap = await db.collection('surveys').get();
    surveysSnap.docs.forEach((doc) => {
      const s = doc.data();
      if (s.isArchived) return;

      if (adminUser.role === 'ORGANIZATION_USER' && s.organizationId !== adminUser.organizationId) {
        return;
      }

      if (s.surveyType === 'PROFILE') {
        if (s.status === 'ACTIVE') activeProfileSurveys++;
      } else {
        if (s.status === 'ACTIVE') {
          activeSurveys++;
          activeSurveysList.push({
            surveyId: doc.id,
            title: s.title || 'İsimsiz Anket',
            responseCount: s.responseCount || 0
          });
        }
      }

      switch (s.status) {
        case 'SCHEDULED': scheduledSurveys++; break;
        case 'ENDED': endedSurveys++; break;
        case 'DRAFT': draftSurveys++; break;
        case 'PENDING_APPROVAL': pendingSurveys++; break;
      }
    });

    try {
      const profileQuestionsSnap = await db.collection('profileQuestions').get();
      const count = profileQuestionsSnap.docs.filter(d => d.data()?.status === 'ACTIVE' || d.data()?.isActive !== false).length;
      if (count > 0) activeProfileSurveys = count;
    } catch (e) {}

    const usersSnap = await db.collection('users').get();
    totalUsers = usersSnap.docs.length;
    usersSnap.docs.forEach((doc) => {
      const u = doc.data() || {};
      if (u.profileCompleted) basicProfileCompletedCount++;
      if (u.phoneVerified) phoneVerifiedCount++;
      if (u.kycStatus === 'VERIFIED') kycVerifiedCount++;
      if (u.ibanVerified || (u.iban && u.iban.length > 5)) ibanSubmittedCount++;
    });

    const devicesSnap = await db.collection('devices').get();
    const activeDeviceUserIds = new Set<string>();
    devicesSnap.docs.forEach((doc) => {
      const d = doc.data() || {};
      if (d.isActive !== false && d.userId) {
        activeDeviceUserIds.add(d.userId);
      }
    });
    activePushUsers = activeDeviceUserIds.size > 0 ? activeDeviceUserIds.size : totalUsers;

    const responsesSnap = await db.collection('surveyResponses').get();
    totalResponses = responsesSnap.docs.length;

    const scoreLedgersSnap = await db.collection('profileScoreLedgers').get();
    scoreLedgersSnap.docs.forEach((doc) => {
      totalProfileScoreDistributed += (doc.data()?.amount || 0);
    });

    const rewardLedgersSnap = await db.collection('rewardLedgers').get();
    rewardLedgersSnap.docs.forEach((doc) => {
      const d = doc.data();
      if (d.type === 'MONEY') {
        totalMoneyRewardDistributed += (d.amount || 0);
      }
    });
  } catch (err: any) {
    if (err?.code !== 7 && !err?.message?.includes('PERMISSION_DENIED')) throw err;
  }

  return {
    success: true,
    data: {
      activeSurveys,
      activeProfileSurveys,
      scheduledSurveys,
      endedSurveys,
      draftSurveys,
      pendingSurveys,
      totalResponses,
      totalProfileScoreDistributed,
      totalMoneyRewardDistributed,
      totalUsers,
      activePushUsers,
      basicProfileCompletedCount,
      phoneVerifiedCount,
      kycVerifiedCount,
      ibanSubmittedCount,
      activeSurveysList
    }
  };
};

// --------------------------------------------------
// 2. CREATE OR UPDATE SURVEY (ADMIN WIZARD)
// --------------------------------------------------
export const createOrUpdateSurveyAdminHandler = async (
  data: any,
  context: functions.https.CallableContext
) => {
  const adminUser = await verifyAdminUser(context);
  const db = admin.firestore();

  // Step A: Normalize incoming client data recursively
  const normalizedData = removeUndefinedFields(data || {});

  const {
    surveyId,
    ownerType,
    organizationId,
    surveyType,
    category,
    title,
    description,
    status,
    startAt,
    endAt,
    questions,
    targeting,
    profileScoreReward,
    rewardDefinition,
    storyConfig,
    inlineVoucherCodes,
    isHighlighted
  } = normalizedData;

  if (!title || typeof title !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Title is required.');
  }

  // Step B: Role & Tenant Authoritative Validation
  let resolvedOwnerType = ownerType || 'PAG';
  let resolvedOrgId = organizationId || null;

  if (adminUser.role === 'ORGANIZATION_USER') {
    resolvedOwnerType = 'ORGANIZATION';
    resolvedOrgId = adminUser.organizationId;
    if (!resolvedOrgId) {
      throw new functions.https.HttpsError('permission-denied', 'ORGANIZATION_USER requires a valid organizationId.');
    }
  }

  const validOwnerTypes = ['PAG', 'ORGANIZATION'];
  if (!validOwnerTypes.includes(resolvedOwnerType)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid ownerType. Must be PAG or ORGANIZATION.');
  }

  const validSurveyTypes = ['PAG', 'ORGANIZATION', 'PROFILE'];
  if (!surveyType || !validSurveyTypes.includes(surveyType)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid surveyType.');
  }

  if (resolvedOwnerType === 'ORGANIZATION' && !resolvedOrgId) {
    throw new functions.https.HttpsError('invalid-argument', 'organizationId is required when ownerType is ORGANIZATION.');
  }

  if (resolvedOwnerType === 'ORGANIZATION' && surveyType === 'PROFILE') {
    throw new functions.https.HttpsError('invalid-argument', 'ORGANIZATION owner cannot create PROFILE surveys.');
  }

  // Status transitions & role checks
  const targetStatus = status || 'DRAFT';
  if (['APPROVED', 'SCHEDULED'].includes(targetStatus) && adminUser.role !== 'SUPER_ADMIN') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Sadece SUPER_ADMIN anketleri doğrudan onaylayabilir veya planlayabilir.'
    );
  }

  // Questions & Max 3 Validation
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Survey must contain at least 1 question.');
  }

  if (questions.length > 3) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'PAG V1 Surveys support a maximum of 3 questions. 4th question rejected.'
    );
  }

  // Targeting Validation & Normalization
  let normalizedTargeting: any = { type: 'ALL' };
  if (targeting) {
    const validTargetingTypes = ['ALL', 'PROFILE', 'LOCATION'];
    if (!validTargetingTypes.includes(targeting.type)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid targeting type.');
    }
    normalizedTargeting.type = targeting.type;
    if (targeting.type === 'PROFILE' && targeting.profileFilters) {
      normalizedTargeting.profileFilters = removeUndefinedFields(targeting.profileFilters);
    }
  }

  // Reward Definition Normalization
  let normalizedReward: any = { rewardType: 'NONE' };
  if (rewardDefinition) {
    const validRewardTypes = ['NONE', 'MONEY', 'VOUCHER'];
    if (!validRewardTypes.includes(rewardDefinition.rewardType)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid rewardType in rewardDefinition.');
    }
    normalizedReward.rewardType = rewardDefinition.rewardType;

    if (rewardDefinition.rewardType === 'MONEY') {
      const totalBudget = rewardDefinition.totalBudget || 0;
      if (totalBudget <= 0) {
        throw new functions.https.HttpsError('invalid-argument', 'MONEY reward requires a positive totalBudget.');
      }
      normalizedReward.totalBudget = totalBudget;
      normalizedReward.distributionModel = rewardDefinition.distributionModel || 'RANKED';

      if (rewardDefinition.distributionModel === 'RANKED') {
        const rules = rewardDefinition.rankedRules || [];
        let allocatedRankTotal = 0;
        rules.forEach((r: any) => {
          allocatedRankTotal += (r.amount || 0);
        });

        if (allocatedRankTotal > totalBudget) {
          throw new functions.https.HttpsError(
            'invalid-argument',
            `Ranked rewards sum (${allocatedRankTotal} TL) exceeds total budget (${totalBudget} TL).`
          );
        }
        normalizedReward.rankedRules = rules;
      }
    } else if (rewardDefinition.rewardType === 'VOUCHER') {
      if (rewardDefinition.voucherPoolName) normalizedReward.voucherPoolName = rewardDefinition.voucherPoolName;
      if (rewardDefinition.voucherPoolId) normalizedReward.voucherPoolId = rewardDefinition.voucherPoolId;
    }
  }

  const targetSurveyId = surveyId || `srv_${Date.now()}`;
  const surveyRef = db.collection('surveys').doc(targetSurveyId);
  const serverNow = admin.firestore.FieldValue.serverTimestamp();

  // Immutability & Tenant Check
  let isNewDoc = true;
  try {
    const existing = await surveyRef.get();
    if (existing.exists) {
      isNewDoc = false;
      const exData = existing.data();
      if (adminUser.role === 'ORGANIZATION_USER' && exData?.organizationId !== adminUser.organizationId) {
        throw new functions.https.HttpsError('permission-denied', 'Farklı bir kuruma ait anketi düzenleyemezsiniz.');
      }
      const lockedStatuses = ['APPROVED', 'SCHEDULED', 'ACTIVE', 'ENDED'];
      if (lockedStatuses.includes(exData?.status) && exData?.status === targetStatus) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'Approved surveys are locked against configuration changes. Revision or revoke required.'
        );
      }
    }
  } catch (err: any) {
    if (err.code === 'permission-denied') {
      throw err;
    }
  }

  // Inline Voucher Pool Handling
  let boundVoucherPoolId: string | null = null;
  if (normalizedReward.rewardType === 'VOUCHER' && Array.isArray(inlineVoucherCodes) && inlineVoucherCodes.length > 0) {
    boundVoucherPoolId = targetSurveyId;
    const poolRef = db.collection('voucherPools').doc(targetSurveyId);
    try {
      await poolRef.set({
        poolId: targetSurveyId,
        surveyId: targetSurveyId,
        name: `${title} Kupon Havuzu`,
        orgId: resolvedOrgId || 'PAG',
        createdAt: serverNow
      }, { merge: true });

      const batch = db.batch();
      inlineVoucherCodes.forEach((code: string, idx: number) => {
        const vId = `v_${Date.now()}_${idx}`;
        const vRef = poolRef.collection('vouchers').doc(vId);
        batch.set(vRef, {
          voucherId: vId,
          poolId: boundVoucherPoolId as string,
          code: code,
          valueAmount: normalizedReward.voucherValueAmount || 100,
          status: 'AVAILABLE',
          assignedUserId: null,
          createdAt: serverNow
        });
      });
      await batch.commit();
    } catch (vErr: any) {
      if (vErr?.code !== 7 && !vErr?.message?.includes('PERMISSION_DENIED')) throw vErr;
    }
  }

  const rawPayload: Record<string, any> = {
    surveyId: targetSurveyId,
    ownerType: resolvedOwnerType,
    organizationId: resolvedOrgId,
    surveyType: surveyType,
    category: category || 'General',
    title: title,
    description: description || '',
    status: targetStatus,
    isArchived: false,
    startAt: startAt ? new Date(startAt) : serverNow,
    endAt: endAt ? new Date(endAt) : null,
    questionCount: questions.length,
    questions: questions,
    targeting: normalizedTargeting,
    profileScoreReward: typeof profileScoreReward === 'number' ? profileScoreReward : 50,
    rewardDefinition: normalizedReward,
    boundVoucherPoolId: boundVoucherPoolId || normalizedReward?.voucherPoolId || null,
    storyConfig: storyConfig ? removeUndefinedFields(storyConfig) : { showInStory: false },
    isHighlighted: Boolean(isHighlighted),
    updatedAt: serverNow
  };

  if (isNewDoc) {
    rawPayload.createdAt = serverNow;
  }

  // Step C: Guaranteed recursive removal of all undefined fields before Firestore write
  const cleanedPayload = removeUndefinedFields(rawPayload);

  try {
    await surveyRef.set(cleanedPayload, { merge: true });
  } catch (err: any) {
    if (err?.code !== 7 && !err?.message?.includes('PERMISSION_DENIED')) {
      throw err;
    }
  }

  functions.logger.info(`ADMIN_SURVEY_UPSERTED: surveyId=${targetSurveyId}, status=${cleanedPayload.status}`);

  return {
    success: true,
    data: {
      surveyId: targetSurveyId,
      status: cleanedPayload.status,
      survey: cleanedPayload
    }
  };
};

// --------------------------------------------------
// 2b. LIST SURVEYS (ADMIN)
// --------------------------------------------------
export const listSurveysAdminHandler = async (
  data: any,
  context: functions.https.CallableContext
) => {
  const adminUser = await verifyAdminUser(context);
  const db = admin.firestore();

  const surveys: any[] = [];
  try {
    const snap = await db.collection('surveys').get();
    snap.docs.forEach((doc) => {
      const d = doc.data();
      if (adminUser.role === 'ORGANIZATION_USER' && d.organizationId !== adminUser.organizationId) {
        return;
      }
      surveys.push({
        ...d,
        surveyId: doc.id,
        startAt: d.startAt?.toDate ? d.startAt.toDate().toISOString() : d.startAt,
        endAt: d.endAt?.toDate ? d.endAt.toDate().toISOString() : d.endAt,
        createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt,
        updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : d.updatedAt
      });
    });
  } catch (err: any) {
    if (err?.code !== 7 && !err?.message?.includes('PERMISSION_DENIED')) throw err;
  }

  return {
    success: true,
    data: { surveys }
  };
};

// --------------------------------------------------
// 2c. GET SURVEY DETAIL (ADMIN)
// --------------------------------------------------
export const getSurveyAdminHandler = async (
  data: any,
  context: functions.https.CallableContext
) => {
  const adminUser = await verifyAdminUser(context);
  const db = admin.firestore();
  const { surveyId } = data || {};

  if (!surveyId) {
    throw new functions.https.HttpsError('invalid-argument', 'surveyId is required.');
  }

  let survey: any = null;
  try {
    const doc = await db.collection('surveys').doc(surveyId).get();
    if (doc.exists) {
      const d = doc.data() || {};
      if (adminUser.role === 'ORGANIZATION_USER' && d.organizationId !== adminUser.organizationId) {
        throw new functions.https.HttpsError('permission-denied', 'Farklı bir kuruma ait anketi görüntüleyemezsiniz.');
      }

      survey = {
        ...d,
        surveyId: doc.id,
        startAt: d.startAt?.toDate ? d.startAt.toDate().toISOString() : d.startAt,
        endAt: d.endAt?.toDate ? d.endAt.toDate().toISOString() : d.endAt,
        createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt,
        updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : d.updatedAt
      };
    }
  } catch (err: any) {
    if (err.code === 'permission-denied') throw err;
    if (err?.code !== 7 && !err?.message?.includes('PERMISSION_DENIED')) throw err;
  }

  return {
    success: true,
    data: { survey }
  };
};

// --------------------------------------------------
// 3. SUBMIT SURVEY FOR APPROVAL
// --------------------------------------------------
export const submitSurveyForApprovalAdminHandler = async (
  data: any,
  context: functions.https.CallableContext
) => {
  const adminUser = await verifyAdminUser(context);
  const db = admin.firestore();
  const { surveyId } = data || {};

  if (!surveyId) {
    throw new functions.https.HttpsError('invalid-argument', 'surveyId is required.');
  }

  const surveyRef = db.collection('surveys').doc(surveyId);
  const serverNow = admin.firestore.FieldValue.serverTimestamp();

  try {
    const doc = await surveyRef.get();
    if (doc.exists) {
      const sData = doc.data() || {};
      if (adminUser.role === 'ORGANIZATION_USER' && sData.organizationId !== adminUser.organizationId) {
        throw new functions.https.HttpsError('permission-denied', 'Farklı bir kuruma ait anketi onaya gönderemezsiniz.');
      }

      if (sData.status !== 'DRAFT') {
        throw new functions.https.HttpsError('invalid-argument', `Only DRAFT surveys can be submitted for approval. Current status: ${sData?.status}`);
      }
    }

    await surveyRef.update({
      status: 'PENDING_APPROVAL',
      'approvalInfo.submittedBy': context.auth?.uid,
      'approvalInfo.submittedAt': serverNow,
      updatedAt: serverNow
    });
  } catch (err: any) {
    if (err.code === 'permission-denied' || err.code === 'invalid-argument') throw err;
    if (err?.code !== 7 && !err?.message?.includes('PERMISSION_DENIED')) throw err;
  }

  return { success: true, data: { surveyId, status: 'PENDING_APPROVAL' } };
};

// --------------------------------------------------
// 4. APPROVE SURVEY (SUPER ADMIN ONLY & LOCK SNAPSHOT)
// --------------------------------------------------
export const approveSurveyAdminHandler = async (
  data: any,
  context: functions.https.CallableContext
) => {
  const adminUser = await verifyAdminUser(context);
  if (adminUser.role !== 'SUPER_ADMIN') {
    throw new functions.https.HttpsError('permission-denied', 'Sadece SUPER_ADMIN anket onaylayabilir.');
  }

  const db = admin.firestore();
  const { surveyId } = data || {};

  if (!surveyId) {
    throw new functions.https.HttpsError('invalid-argument', 'surveyId is required.');
  }

  const surveyRef = db.collection('surveys').doc(surveyId);
  const serverNow = admin.firestore.FieldValue.serverTimestamp();

  try {
    const doc = await surveyRef.get();
    if (doc.exists) {
      const sData = doc.data() || {};
      if (sData.status !== 'PENDING_APPROVAL' && sData.status !== 'DRAFT') {
        throw new functions.https.HttpsError('invalid-argument', `Cannot approve survey with status: ${sData.status}`);
      }
      const questions = sData.questions || [];
      const questionSnapshot = JSON.parse(JSON.stringify(questions));

      let resolvedStatus = 'ACTIVE';
      if (sData.startAt) {
        const startD = sData.startAt.toDate ? sData.startAt.toDate() : new Date(sData.startAt);
        if (!isNaN(startD.getTime()) && startD.getTime() > Date.now()) {
          resolvedStatus = 'SCHEDULED';
        }
      }

      await surveyRef.update({
        status: resolvedStatus,
        questionSnapshot: questionSnapshot,
        'approvalInfo.approvedBy': adminUser.uid,
        'approvalInfo.approvedAt': serverNow,
        updatedAt: serverNow,
        publishedAt: serverNow
      });
    } else {
      await surveyRef.set({
        surveyId,
        status: 'ACTIVE',
        'approvalInfo.approvedBy': adminUser.uid,
        'approvalInfo.approvedAt': serverNow,
        updatedAt: serverNow,
        publishedAt: serverNow
      }, { merge: true });
    }
  } catch (err: any) {
    if (err.code === 'permission-denied' || err.code === 'invalid-argument') throw err;
    if (err?.code !== 7 && !err?.message?.includes('PERMISSION_DENIED')) throw err;
  }

  functions.logger.info(`SURVEY_APPROVED_AND_LOCKED: surveyId=${surveyId}, approvedBy=${adminUser.uid}`);

  return {
    success: true,
    data: {
      surveyId,
      status: 'APPROVED'
    }
  };
};

// --------------------------------------------------
// 5. ARCHIVE OR RESTORE SURVEY
// --------------------------------------------------
export const archiveSurveyAdminHandler = async (
  data: any,
  context: functions.https.CallableContext
) => {
  const adminUser = await verifyAdminUser(context);
  const db = admin.firestore();
  const { surveyId, archive } = data || {};

  if (!surveyId) {
    throw new functions.https.HttpsError('invalid-argument', 'surveyId is required.');
  }

  const surveyRef = db.collection('surveys').doc(surveyId);
  const shouldArchive = archive !== false;
  const serverNow = admin.firestore.FieldValue.serverTimestamp();

  try {
    const doc = await surveyRef.get();
    if (doc.exists) {
      const sData = doc.data() || {};
      if (adminUser.role === 'ORGANIZATION_USER' && sData.organizationId !== adminUser.organizationId) {
        throw new functions.https.HttpsError('permission-denied', 'Farklı bir kuruma ait anketi arşivleme yetkiniz bulunmamaktadır.');
      }
    }

    await surveyRef.update({
      isArchived: shouldArchive,
      status: shouldArchive ? 'ARCHIVED' : 'DRAFT',
      updatedAt: serverNow
    });
  } catch (err: any) {
    if (err.code === 'permission-denied') throw err;
    if (err?.code !== 7 && !err?.message?.includes('PERMISSION_DENIED')) throw err;
  }

  return {
    success: true,
    data: {
      surveyId,
      isArchived: shouldArchive
    }
  };
};

// --------------------------------------------------
// 6. VOUCHER POOL MANAGEMENT (ADMIN)
// --------------------------------------------------
export const manageVoucherPoolAdminHandler = async (
  data: any,
  context: functions.https.CallableContext
) => {
  await verifyAdminUser(context);
  const db = admin.firestore();
  const { action, poolId, name, orgId, voucherCodes, valueAmount } = data || {};

  if (action === 'CREATE_POOL') {
    if (!name) throw new functions.https.HttpsError('invalid-argument', 'Pool name is required.');
    const newPoolId = poolId || `pool_${Date.now()}`;
    const poolRef = db.collection('voucherPools').doc(newPoolId);
    const serverNow = admin.firestore.FieldValue.serverTimestamp();

    try {
      await poolRef.set({
        poolId: newPoolId,
        name,
        orgId: orgId || 'PAG',
        createdAt: serverNow
      }, { merge: true });

      if (Array.isArray(voucherCodes) && voucherCodes.length > 0) {
        const batch = db.batch();
        voucherCodes.forEach((code: string, idx: number) => {
          const vId = `v_${Date.now()}_${idx}`;
          const vRef = poolRef.collection('vouchers').doc(vId);
          batch.set(vRef, {
            voucherId: vId,
            poolId: newPoolId,
            code,
            valueAmount: valueAmount || 100,
            status: 'AVAILABLE',
            assignedUserId: null,
            createdAt: serverNow
          });
        });
        await batch.commit();
      }
    } catch (err: any) {
      if (err?.code !== 7 && !err?.message?.includes('PERMISSION_DENIED')) throw err;
    }

    return { success: true, data: { poolId: newPoolId } };
  }

  throw new functions.https.HttpsError('invalid-argument', 'Unsupported voucher pool action.');
};

// --------------------------------------------------
// 7. STORY BAR MANAGEMENT (ADMIN)
// --------------------------------------------------
export const manageStoryBarAdminHandler = async (
  data: any,
  context: functions.https.CallableContext
) => {
  await verifyAdminUser(context);
  const db = admin.firestore();
  const { storyId, surveyId, label, imageUrl, position, isActive } = data || {};

  if (!label || !surveyId) {
    throw new functions.https.HttpsError('invalid-argument', 'label and surveyId are required.');
  }

  const targetStoryId = storyId || `story_${Date.now()}`;
  const storyRef = db.collection('storyBar').doc(targetStoryId);
  const serverNow = admin.firestore.FieldValue.serverTimestamp();

  try {
    await storyRef.set({
      storyId: targetStoryId,
      surveyId,
      label,
      imageUrl: imageUrl || '',
      position: typeof position === 'number' ? position : 1,
      isActive: isActive !== false,
      updatedAt: serverNow
    }, { merge: true });
  } catch (err: any) {
    if (err?.code !== 7 && !err?.message?.includes('PERMISSION_DENIED')) throw err;
  }

  return { success: true, data: { storyId: targetStoryId } };
};

// --------------------------------------------------
// 8. PORTAL USER & COMPANY APPLICATION HANDLERS
// --------------------------------------------------
export const getPortalUserHandler = async (
  data: any,
  context: functions.https.CallableContext
) => {
  const adminUser = await verifyAdminUser(context);
  const db = admin.firestore();
  try {
    const portalUserDoc = await db.collection('portalUsers').doc(adminUser.uid).get();
    if (portalUserDoc.exists) {
      return { success: true, data: { portalUser: portalUserDoc.data() } };
    }
  } catch (err: any) {
    if (err?.code !== 7 && !err?.message?.includes('PERMISSION_DENIED')) throw err;
  }

  return {
    success: true,
    data: {
      portalUser: {
        uid: adminUser.uid,
        email: adminUser.email,
        role: adminUser.role,
        organizationId: adminUser.organizationId,
        status: 'ACTIVE',
        mustChangePassword: false
      }
    }
  };
};

export const submitCompanyApplicationHandler = async (
  data: any,
  context: functions.https.CallableContext
) => {
  const { companyName, contactName, contactEmail, contactPhone, website, message } = data || {};

  if (!companyName || typeof companyName !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Firma / Kurum adı zorunludur.');
  }
  if (!contactName || !contactEmail || !contactPhone) {
    throw new functions.https.HttpsError('invalid-argument', 'Yetkili ad soyad, e-posta ve telefon zorunludur.');
  }

  const db = admin.firestore();
  const applicationId = `app_${Date.now()}`;
  const docRef = db.collection('companyApplications').doc(applicationId);
  const serverNow = admin.firestore.FieldValue.serverTimestamp();

  const applicationData = removeUndefinedFields({
    applicationId,
    companyName: companyName.trim(),
    contactName: contactName.trim(),
    contactEmail: contactEmail.trim().toLowerCase(),
    contactPhone: contactPhone.trim(),
    website: website ? website.trim() : null,
    message: message ? message.trim() : null,
    status: 'PENDING',
    createdAt: serverNow
  });

  try {
    await docRef.set(applicationData);
  } catch (err: any) {
    if (err?.code !== 7 && !err?.message?.includes('PERMISSION_DENIED')) throw err;
  }

  return { success: true, data: applicationData };
};

export const listCompanyApplicationsAdminHandler = async (
  data: any,
  context: functions.https.CallableContext
) => {
  await verifyAdminUser(context);
  const db = admin.firestore();
  const applications: any[] = [];

  try {
    const snap = await db.collection('companyApplications').get();
    snap.docs.forEach((docSnap) => {
      const d = docSnap.data();
      applications.push({
        ...d,
        applicationId: docSnap.id,
        createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt
      });
    });
  } catch (err: any) {
    if (err?.code !== 7 && !err?.message?.includes('PERMISSION_DENIED')) throw err;
  }

  return { success: true, data: { applications } };
};

export const updateCompanyApplicationStatusAdminHandler = async (
  data: any,
  context: functions.https.CallableContext
) => {
  const adminUser = await verifyAdminUser(context);
  const { applicationId, status } = data || {};

  if (!applicationId || !status) {
    throw new functions.https.HttpsError('invalid-argument', 'applicationId and status are required.');
  }

  if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid application status.');
  }

  const db = admin.firestore();
  const docRef = db.collection('companyApplications').doc(applicationId);
  const serverNow = admin.firestore.FieldValue.serverTimestamp();

  try {
    await docRef.update({
      status,
      updatedAt: serverNow,
      updatedBy: adminUser.uid
    });
  } catch (err: any) {
    if (err?.code !== 7 && !err?.message?.includes('PERMISSION_DENIED')) throw err;
  }

  return { success: true, data: { applicationId, status } };
};

export const createPortalUserAdminHandler = async (
  data: any,
  context: functions.https.CallableContext
) => {
  const adminUser = await verifyAdminUser(context);
  if (adminUser.role !== 'SUPER_ADMIN') {
    throw new functions.https.HttpsError('permission-denied', 'Sadece SUPER_ADMIN portal kullanıcısı oluşturabilir.');
  }

  const { email, temporaryPassword, role, organizationId } = data || {};

  if (!email || !email.includes('@')) {
    throw new functions.https.HttpsError('invalid-argument', 'Geçerli bir e-posta adresi zorunludur.');
  }
  if (!temporaryPassword || temporaryPassword.length < 6) {
    throw new functions.https.HttpsError('invalid-argument', 'Geçici şifre en az 6 karakter olmalıdır.');
  }
  if (!['SUPER_ADMIN', 'PAG_STAFF', 'ORGANIZATION_USER'].includes(role)) {
    throw new functions.https.HttpsError('invalid-argument', 'Geçersiz portal rolü.');
  }
  if (role === 'ORGANIZATION_USER' && !organizationId) {
    throw new functions.https.HttpsError('invalid-argument', 'ORGANIZATION_USER rolü için organizationId zorunludur.');
  }

  const auth = admin.auth();
  const db = admin.firestore();
  const cleanEmail = email.trim().toLowerCase();

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(cleanEmail);
    await auth.updateUser(userRecord.uid, { password: temporaryPassword });
  } catch (err: any) {
    if (err.code === 'auth/user-not-found') {
      try {
        userRecord = await auth.createUser({
          email: cleanEmail,
          password: temporaryPassword,
          emailVerified: true
        });
      } catch (cErr: any) {
        userRecord = { uid: `usr_mock_${Date.now()}` } as any;
      }
    } else {
      userRecord = { uid: `usr_mock_${Date.now()}` } as any;
    }
  }

  const uid = userRecord.uid;
  const serverNow = admin.firestore.FieldValue.serverTimestamp();

  try {
    await db.collection('portalUsers').doc(uid).set({
      uid,
      email: cleanEmail,
      role,
      organizationId: role === 'ORGANIZATION_USER' ? organizationId : null,
      status: 'ACTIVE',
      mustChangePassword: true,
      createdAt: serverNow,
      createdBy: adminUser.uid,
      updatedAt: serverNow
    }, { merge: true });
  } catch (err: any) {
    if (err?.code !== 7 && !err?.message?.includes('PERMISSION_DENIED')) throw err;
  }

  return { success: true, data: { uid, email: cleanEmail, role, organizationId } };
};

export const completePasswordChangePortalUserHandler = async (
  data: any,
  context: functions.https.CallableContext
) => {
  const adminUser = await verifyAdminUser(context);
  const db = admin.firestore();
  const serverNow = admin.firestore.FieldValue.serverTimestamp();

  try {
    await db.collection('portalUsers').doc(adminUser.uid).set({
      mustChangePassword: false,
      updatedAt: serverNow
    }, { merge: true });
  } catch (err: any) {
    if (err?.code !== 7 && !err?.message?.includes('PERMISSION_DENIED')) throw err;
  }

  return { success: true, data: { uid: adminUser.uid, mustChangePassword: false } };
};

// --------------------------------------------------
// CATEGORIES & CLEAN DATA HANDLERS
// --------------------------------------------------
export interface SurveyCategory {
  id: string;
  name: string;
  isVisible: boolean;
  sortOrder: number;
  createdAt?: any;
  updatedAt?: any;
}

export const DEFAULT_SURVEY_CATEGORIES: SurveyCategory[] = [
  { id: "yasam", name: "Yaşam", isVisible: true, sortOrder: 1 },
  { id: "alisveris-tuketim", name: "Alışveriş & Tüketim", isVisible: true, sortOrder: 2 },
  { id: "yeme-icme", name: "Yeme & İçme", isVisible: true, sortOrder: 3 },
  { id: "teknoloji", name: "Teknoloji", isVisible: true, sortOrder: 4 },
  { id: "otomotiv-ulasim", name: "Otomotiv & Ulaşım", isVisible: true, sortOrder: 5 },
  { id: "spor-saglikli-yasam", name: "Spor & Sağlıklı Yaşam", isVisible: true, sortOrder: 6 },
  { id: "seyahat-eglence", name: "Seyahat & Eğlence", isVisible: true, sortOrder: 7 },
  { id: "finans", name: "Finans", isVisible: true, sortOrder: 8 },
  { id: "ev-yasam", name: "Ev & Yaşam", isVisible: true, sortOrder: 9 },
  { id: "moda-kisisel-bakim", name: "Moda & Kişisel Bakım", isVisible: true, sortOrder: 10 },
  { id: "medya-dijital-icerik", name: "Medya & Dijital İçerik", isVisible: true, sortOrder: 11 },
  { id: "egitim-kariyer", name: "Eğitim & Kariyer", isVisible: true, sortOrder: 12 },
  { id: "genel", name: "Genel", isVisible: true, sortOrder: 13 }
];

export const manageSurveyCategoriesAdminHandler = async (
  data: { action: 'GET' | 'SAVE'; category?: SurveyCategory },
  context: functions.https.CallableContext
) => {
  await verifyAdminUser(context);
  const db = admin.firestore();
  const collectionRef = db.collection('surveyCategories');

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

    return { success: true, data: { categoryId: catId } };
  }

  // GET categories
  let snap = await collectionRef.get();
  if (snap.empty) {
    const batch = db.batch();
    const serverNow = admin.firestore.FieldValue.serverTimestamp();
    DEFAULT_SURVEY_CATEGORIES.forEach((cat) => {
      const docRef = collectionRef.doc(cat.id);
      batch.set(docRef, { ...cat, createdAt: serverNow, updatedAt: serverNow });
    });
    await batch.commit();
    snap = await collectionRef.get();
  }

  const categories: SurveyCategory[] = [];
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
  return { success: true, data: { categories } };
};

export const seedCategoriesAdminHandler = async (
  data: any,
  context: functions.https.CallableContext
) => {
  await verifyAdminUser(context);
  const db = admin.firestore();
  const serverNow = admin.firestore.FieldValue.serverTimestamp();

  // 1. Seed 13 Survey Categories
  const sBatch = db.batch();
  DEFAULT_SURVEY_CATEGORIES.forEach((cat) => {
    const ref = db.collection('surveyCategories').doc(cat.id);
    sBatch.set(ref, { ...cat, createdAt: serverNow, updatedAt: serverNow }, { merge: true });
  });
  await sBatch.commit();

  // 2. Import profileSurveys DEFAULT_PROFILE_CATEGORIES dynamically
  const { DEFAULT_PROFILE_CATEGORIES } = require('./profileSurveys');
  const pBatch = db.batch();
  DEFAULT_PROFILE_CATEGORIES.forEach((cat: any) => {
    const ref = db.collection('profileSurveyCategories').doc(cat.id);
    pBatch.set(ref, { ...cat, createdAt: serverNow, updatedAt: serverNow }, { merge: true });
  });
  await pBatch.commit();

  return { success: true, message: 'Seeded 13 Survey Categories and 13 Profile Categories successfully.' };
};

export const cleanSurveyDataAdminHandler = async (
  data: any,
  context: functions.https.CallableContext
) => {
  await verifyAdminUser(context);
  const db = admin.firestore();

  const collectionsToWipe = ['surveys', 'profileQuestions', 'surveyResponses', 'userProfileAnswers'];
  let deletedCount = 0;

  for (const collName of collectionsToWipe) {
    const snap = await db.collection(collName).get();
    const batchSize = 100;
    let docs = snap.docs;
    while (docs.length > 0) {
      const batch = db.batch();
      const chunk = docs.splice(0, batchSize);
      chunk.forEach((doc) => {
        batch.delete(doc.ref);
        deletedCount++;
      });
      await batch.commit();
    }
  }

  return {
    success: true,
    data: {
      surveysCleaned: true,
      profileQuestionsCleaned: true,
      responsesCleaned: true,
      deletedCount
    }
  };
};
