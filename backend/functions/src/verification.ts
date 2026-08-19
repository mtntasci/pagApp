import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { verifyAdminUser, removeUndefinedFields } from './admin';

export type VerificationCampaignStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type VerificationAssignmentStatus =
  | 'QUEUED'
  | 'ASSIGNED'
  | 'CALLING'
  | 'REACHED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'NO_ANSWER'
  | 'CALL_BACK_LATER'
  | 'WRONG_PERSON_OR_ISSUE'
  | 'PUSH_SENT'
  | 'VERIFICATION_COMPLETED'
  | 'FAILED';

export interface SurveyVerificationCampaign {
  id: string;
  masterSurveyId: string;
  organizationId: string | null;
  status: VerificationCampaignStatus;
  requestedCount: number;
  customerSelectedCount: number;
  randomSelectedCount: number;
  verificationSurveyId: string;
  verificationRewardSummary: string;
  createdAt: any;
  createdBy: string;
  startedAt: any;
  completedAt: any;
}

export interface SurveyVerificationAssignment {
  id: string;
  verificationCampaignId: string;
  masterSurveyId: string;
  verificationSurveyId: string;
  organizationId: string | null;
  userId: string;
  userDisplayName: string; // First + Last name for agent display
  selectionSource: 'CUSTOMER' | 'RANDOM';
  status: VerificationAssignmentStatus;
  assignedAgentId: string | null;
  callStartedAt: any;
  callEndedAt: any;
  agentNote: string | null;
  createdAt: any;
  updatedAt: any;
}

export interface VerificationCallAuditLog {
  id: string;
  agentId: string;
  assignmentId: string;
  campaignId: string;
  action: string;
  result?: string;
  agentNote?: string;
  callStartedAt?: any;
  callEndedAt?: any;
  createdAt: any;
}

/**
 * Generates an anonymous respondent reference for organization view (e.g. Katılımcı #A82F1).
 * Never exposes real name, phone, or email to organization users.
 */
export function generateAnonymousParticipantRef(userId: string, surveyId: string): string {
  let hash = 0;
  const input = `${surveyId}_${userId}`;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(5, '0').substring(0, 5);
  return `Katılımcı #${hex}`;
}

/**
 * Server-side random selection helper without duplicates.
 */
export function selectRandomUniqueUsers(
  pool: string[],
  excludeSet: Set<string>,
  countNeeded: number
): string[] {
  const eligible = pool.filter((uid) => !excludeSet.has(uid));
  const shuffled = [...eligible];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, countNeeded);
}

// --------------------------------------------------
// 1. GET COMPLETED RESPONDENTS FOR ANONYMOUS PICKER
// --------------------------------------------------
export const getCompletedRespondentsForVerificationHandler = async (
  data: { surveyId: string },
  context: functions.https.CallableContext
) => {
  const adminUser = await verifyAdminUser(context);
  const { surveyId } = data || {};

  if (!surveyId || typeof surveyId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'surveyId is required.');
  }

  const db = admin.firestore();
  const surveyDoc = await db.collection('surveys').doc(surveyId).get();
  if (!surveyDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Survey not found.');
  }

  const survey = surveyDoc.data();
  if (adminUser.role === 'ORGANIZATION_USER') {
    if (survey?.organizationId !== adminUser.organizationId) {
      throw new functions.https.HttpsError('permission-denied', 'Cross-tenant survey access is denied.');
    }
    if (adminUser.organizationId) {
      const orgDoc = await db.collection('organizations').doc(adminUser.organizationId).get();
      if (orgDoc.exists && orgDoc.data()?.isVerificationAuthorized === false) {
        throw new functions.https.HttpsError('permission-denied', 'Firmanız için Kalite Doğrulama yetkisi aktif değildir.');
      }
    }
  }

  // Fetch completed responses for this survey
  const responsesSnap = await db.collection('surveyResponses')
    .where('surveyId', '==', surveyId)
    .where('status', '==', 'COMPLETED')
    .get();

  const respondents = responsesSnap.docs.map((docSnap) => {
    const rData = docSnap.data();
    const userId = rData.userId;
    const anonymousRef = generateAnonymousParticipantRef(userId, surveyId);
    return {
      userId,
      anonymousRef,
      completedAt: rData.serverCompletedAt || rData.submittedAt || rData.createdAt || null
    };
  });

  return {
    success: true,
    data: {
      surveyId,
      surveyTitle: survey?.title || 'Anket',
      totalCompletedCount: respondents.length,
      respondents: respondents
    }
  };
};

// --------------------------------------------------
// 2. CREATE VERIFICATION CAMPAIGN (ORGANIZATION / ADMIN)
// --------------------------------------------------
export const createVerificationCampaignHandler = async (
  data: {
    masterSurveyId: string;
    customerSelectedUserIds: string[];
    randomSelectedCount: number;
    verificationQuestionText?: string;
    verificationQuestionOptions?: string[];
    verificationRewardSummary?: string;
    rewardDefinition?: any;
    profileScoreReward?: number;
  },
  context: functions.https.CallableContext
) => {
  const adminUser = await verifyAdminUser(context);
  const {
    masterSurveyId,
    customerSelectedUserIds,
    randomSelectedCount,
    verificationQuestionText,
    verificationQuestionOptions,
    verificationRewardSummary,
    rewardDefinition,
    profileScoreReward
  } = data || {};

  if (!masterSurveyId || typeof masterSurveyId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'masterSurveyId is required.');
  }

  if (!Array.isArray(customerSelectedUserIds)) {
    throw new functions.https.HttpsError('invalid-argument', 'customerSelectedUserIds must be an array.');
  }

  const db = admin.firestore();
  const masterSurveyDoc = await db.collection('surveys').doc(masterSurveyId).get();
  if (!masterSurveyDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Master survey not found.');
  }

  const masterSurvey = masterSurveyDoc.data();
  if (adminUser.role === 'ORGANIZATION_USER' && masterSurvey?.organizationId !== adminUser.organizationId) {
    throw new functions.https.HttpsError('permission-denied', 'Cross-tenant access denied.');
  }

  // Check if quality verification is enabled on the survey
  const verificationEnabled = masterSurvey?.verificationConfig?.enabled === true || masterSurvey?.isVerificationEnabled === true;
  if (!verificationEnabled && adminUser.role !== 'SUPER_ADMIN') {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Bu anket için Kalite Doğrulama Hizmeti aktif edilmemiştir.'
    );
  }

  // Fetch all completed responses
  const responsesSnap = await db.collection('surveyResponses')
    .where('surveyId', '==', masterSurveyId)
    .where('status', '==', 'COMPLETED')
    .get();

  const allCompletedUserIds = responsesSnap.docs.map((d) => d.data().userId).filter(Boolean);
  const allCompletedSet = new Set(allCompletedUserIds);

  // Validate customer selected users
  const customerSet = new Set<string>();
  for (const uid of customerSelectedUserIds) {
    if (!allCompletedSet.has(uid)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `User ${uid} has not completed master survey ${masterSurveyId}.`
      );
    }
    customerSet.add(uid);
  }

  const validCustomerSelected = Array.from(customerSet);
  const randomCount = Math.max(0, Number(randomSelectedCount) || 0);

  // Server-side random selection from remaining completed respondents
  const serverRandomSelected = selectRandomUniqueUsers(allCompletedUserIds, customerSet, randomCount);
  const totalCount = validCustomerSelected.length + serverRandomSelected.length;

  if (totalCount === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Total selected respondents cannot be zero.');
  }

  const serverNow = admin.firestore.FieldValue.serverTimestamp();
  const campaignId = `ver_camp_${masterSurveyId}_${Date.now()}`;
  const verificationSurveyId = `srv_ver_${masterSurveyId}_${Date.now()}`;

  const resolvedRewardSummary = verificationRewardSummary ||
    masterSurvey?.verificationConfig?.verificationRewardSummary ||
    '250 TL Hediye Çeki';

  // 1. Create linked 1-question verification survey
  const questionText = verificationQuestionText ||
    `Katıldığınız "${masterSurvey?.title || 'Anket'}" anketinin doğruluğunu onaylıyor musunuz?`;
  const questionOptions = (verificationQuestionOptions && verificationQuestionOptions.length > 0)
    ? verificationQuestionOptions
    : ['Evet, onaylıyorum', 'Hayır, hatırlamıyorum'];

  const verificationSurveyPayload = {
    surveyId: verificationSurveyId,
    ownerType: masterSurvey?.ownerType || 'ORGANIZATION',
    organizationId: masterSurvey?.organizationId || null,
    surveyType: 'VERIFICATION',
    masterSurveyId: masterSurveyId,
    category: masterSurvey?.category || 'General',
    title: `Kalite Doğrulama — ${masterSurvey?.title || 'Anket'}`,
    description: `Katıldığınız anket için tek soruluk kalite doğrulama sorusu.`,
    status: 'ACTIVE',
    isArchived: false,
    questionCount: 1,
    questions: [
      {
        questionId: 'vq1',
        id: 'vq1',
        order: 1,
        type: 'SINGLE_SELECT',
        text: questionText,
        questionText: questionText,
        options: questionOptions.map((optLabel, idx) => ({
          optionId: `opt_${idx + 1}`,
          id: `opt_${idx + 1}`,
          label: optLabel,
          order: idx + 1
        }))
      }
    ],
    targeting: { type: 'ALL' },
    profileScoreReward: typeof profileScoreReward === 'number' ? profileScoreReward : 25,
    rewardDefinition: rewardDefinition || masterSurvey?.verificationConfig?.rewardDefinition || {
      rewardType: 'VOUCHER',
      voucherPoolName: 'Doğrulama Hediye Çeki'
    },
    verificationRewardSummary: resolvedRewardSummary,
    createdBy: adminUser.uid,
    createdAt: serverNow,
    updatedAt: serverNow
  };

  await db.collection('surveys').doc(verificationSurveyId).set(removeUndefinedFields(verificationSurveyPayload));

  // 2. Create Survey Verification Campaign Document
  const campaignPayload: SurveyVerificationCampaign = {
    id: campaignId,
    masterSurveyId,
    organizationId: masterSurvey?.organizationId || null,
    status: 'ACTIVE',
    requestedCount: totalCount,
    customerSelectedCount: validCustomerSelected.length,
    randomSelectedCount: serverRandomSelected.length,
    verificationSurveyId,
    verificationRewardSummary: resolvedRewardSummary,
    createdAt: serverNow,
    createdBy: adminUser.uid,
    startedAt: serverNow,
    completedAt: null
  };

  await db.collection('surveyVerificationCampaigns').doc(campaignId).set(removeUndefinedFields(campaignPayload));

  // 3. Batch Create Verification Assignments with User Display Names
  // Fetch user basic profile names for call center display (strict PII guard: no phone/email saved to assignment)
  const allTargetUserIds = [...validCustomerSelected, ...serverRandomSelected];
  const userProfilesSnap = await Promise.all(
    allTargetUserIds.map((uid) => db.collection('users').doc(uid).collection('profile').doc('basic').get())
  );

  const nameMap = new Map<string, string>();
  userProfilesSnap.forEach((snap, idx) => {
    const uid = allTargetUserIds[idx];
    if (snap.exists) {
      const bData = snap.data();
      const name = `${bData?.firstName || ''} ${bData?.lastName || ''}`.trim();
      nameMap.set(uid, name || 'PAG Kullanıcısı');
    } else {
      nameMap.set(uid, 'PAG Kullanıcısı');
    }
  });

  const batch = db.batch();
  for (const uid of validCustomerSelected) {
    const assignmentId = `assign_${campaignId}_${uid}`;
    const assignRef = db.collection('surveyVerificationAssignments').doc(assignmentId);
    const assignPayload: SurveyVerificationAssignment = {
      id: assignmentId,
      verificationCampaignId: campaignId,
      masterSurveyId,
      verificationSurveyId,
      organizationId: masterSurvey?.organizationId || null,
      userId: uid,
      userDisplayName: nameMap.get(uid) || 'PAG Kullanıcısı',
      selectionSource: 'CUSTOMER',
      status: 'QUEUED',
      assignedAgentId: null,
      callStartedAt: null,
      callEndedAt: null,
      agentNote: null,
      createdAt: serverNow,
      updatedAt: serverNow
    };
    batch.set(assignRef, removeUndefinedFields(assignPayload));
  }

  for (const uid of serverRandomSelected) {
    const assignmentId = `assign_${campaignId}_${uid}`;
    const assignRef = db.collection('surveyVerificationAssignments').doc(assignmentId);
    const assignPayload: SurveyVerificationAssignment = {
      id: assignmentId,
      verificationCampaignId: campaignId,
      masterSurveyId,
      verificationSurveyId,
      organizationId: masterSurvey?.organizationId || null,
      userId: uid,
      userDisplayName: nameMap.get(uid) || 'PAG Kullanıcısı',
      selectionSource: 'RANDOM',
      status: 'QUEUED',
      assignedAgentId: null,
      callStartedAt: null,
      callEndedAt: null,
      agentNote: null,
      createdAt: serverNow,
      updatedAt: serverNow
    };
    batch.set(assignRef, removeUndefinedFields(assignPayload));
  }

  await batch.commit();

  return {
    success: true,
    data: {
      campaignId,
      masterSurveyId,
      verificationSurveyId,
      customerSelectedCount: validCustomerSelected.length,
      randomSelectedCount: serverRandomSelected.length,
      totalCount,
      verificationRewardSummary: resolvedRewardSummary
    }
  };
};

// --------------------------------------------------
// 3. LIST VERIFICATION CAMPAIGNS
// --------------------------------------------------
export const listVerificationCampaignsHandler = async (
  data: any,
  context: functions.https.CallableContext
) => {
  const adminUser = await verifyAdminUser(context);
  const db = admin.firestore();

  let query: admin.firestore.Query = db.collection('surveyVerificationCampaigns');

  if (adminUser.role === 'ORGANIZATION_USER') {
    query = query.where('organizationId', '==', adminUser.organizationId);
  }

  const snap = await query.orderBy('createdAt', 'desc').get();
  const campaigns: any[] = [];

  for (const docSnap of snap.docs) {
    const cData = docSnap.data();
    // Fetch master survey title
    let masterSurveyTitle = 'Anket';
    if (cData.masterSurveyId) {
      const msDoc = await db.collection('surveys').doc(cData.masterSurveyId).get();
      if (msDoc.exists) {
        masterSurveyTitle = msDoc.data()?.title || 'Anket';
      }
    }

    campaigns.push({
      ...cData,
      masterSurveyTitle
    });
  }

  return {
    success: true,
    data: {
      campaigns
    }
  };
};

// --------------------------------------------------
// 4. GET VERIFICATION CAMPAIGN PROGRESS / DETAIL
// --------------------------------------------------
export const getVerificationCampaignDetailHandler = async (
  data: { campaignId: string },
  context: functions.https.CallableContext
) => {
  const adminUser = await verifyAdminUser(context);
  const { campaignId } = data || {};

  if (!campaignId) {
    throw new functions.https.HttpsError('invalid-argument', 'campaignId is required.');
  }

  const db = admin.firestore();
  const campDoc = await db.collection('surveyVerificationCampaigns').doc(campaignId).get();
  if (!campDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Verification campaign not found.');
  }

  const campaign = campDoc.data() as SurveyVerificationCampaign;
  if (adminUser.role === 'ORGANIZATION_USER' && campaign.organizationId !== adminUser.organizationId) {
    throw new functions.https.HttpsError('permission-denied', 'Tenant access denied.');
  }

  const assignmentsSnap = await db.collection('surveyVerificationAssignments')
    .where('verificationCampaignId', '==', campaignId)
    .get();

  const total = assignmentsSnap.docs.length;
  let customerSelected = 0;
  let randomSelected = 0;
  let called = 0;
  let reached = 0;
  let accepted = 0;
  let declined = 0;
  let noAnswer = 0;
  let callBackLater = 0;
  let wrongPerson = 0;
  let pushSent = 0;
  let completed = 0;

  assignmentsSnap.docs.forEach((d) => {
    const a = d.data() as SurveyVerificationAssignment;
    if (a.selectionSource === 'CUSTOMER') customerSelected++;
    if (a.selectionSource === 'RANDOM') randomSelected++;

    if (a.callStartedAt || ['CALLING', 'REACHED', 'ACCEPTED', 'DECLINED', 'NO_ANSWER', 'CALL_BACK_LATER', 'WRONG_PERSON_OR_ISSUE', 'PUSH_SENT', 'VERIFICATION_COMPLETED'].includes(a.status)) {
      called++;
    }

    if (['REACHED', 'ACCEPTED', 'DECLINED', 'PUSH_SENT', 'VERIFICATION_COMPLETED'].includes(a.status)) {
      reached++;
    }

    if (['ACCEPTED', 'PUSH_SENT', 'VERIFICATION_COMPLETED'].includes(a.status)) {
      accepted++;
    }

    if (a.status === 'DECLINED') declined++;
    if (a.status === 'NO_ANSWER') noAnswer++;
    if (a.status === 'CALL_BACK_LATER') callBackLater++;
    if (a.status === 'WRONG_PERSON_OR_ISSUE') wrongPerson++;
    if (['PUSH_SENT', 'VERIFICATION_COMPLETED'].includes(a.status)) pushSent++;
    if (a.status === 'VERIFICATION_COMPLETED') completed++;
  });

  const completionRate = accepted > 0 ? Math.round((completed / accepted) * 100) : 0;
  const reachRate = called > 0 ? Math.round((reached / called) * 100) : 0;

  // Master survey title
  let masterSurveyTitle = 'Anket';
  if (campaign.masterSurveyId) {
    const sDoc = await db.collection('surveys').doc(campaign.masterSurveyId).get();
    if (sDoc.exists) {
      masterSurveyTitle = sDoc.data()?.title || 'Anket';
    }
  }

  return {
    success: true,
    data: {
      campaign: {
        ...campaign,
        masterSurveyTitle
      },
      stats: {
        total,
        customerSelected,
        randomSelected,
        called,
        reached,
        accepted,
        declined,
        noAnswer,
        callBackLater,
        wrongPerson,
        pushSent,
        completed,
        completionRate,
        reachRate
      }
    }
  };
};

// --------------------------------------------------
// 5. CALL CENTER: LIST ASSIGNMENTS FOR AGENT
// --------------------------------------------------
export const listVerificationAssignmentsForAgentHandler = async (
  data: { campaignId?: string },
  context: functions.https.CallableContext
) => {
  const adminUser = await verifyAdminUser(context);
  // Both CALL_CENTER_AGENT and SUPER_ADMIN / PAG_STAFF can access
  const db = admin.firestore();
  const { campaignId } = data || {};

  let query: admin.firestore.Query = db.collection('surveyVerificationAssignments');
  if (campaignId) {
    query = query.where('verificationCampaignId', '==', campaignId);
  }
  if (adminUser.role === 'CALL_CENTER_AGENT') {
    // Agent can see unassigned/queued or assignments assigned to them
    // For open assignment queue in V1, return all active campaign assignments
  }

  const snap = await query.orderBy('createdAt', 'desc').limit(200).get();

  // Cache survey titles and rewards
  const surveyCache = new Map<string, { title: string; rewardSummary: string }>();

  const assignments = await Promise.all(
    snap.docs.map(async (dSnap) => {
      const a = dSnap.data() as SurveyVerificationAssignment;
      let cached = surveyCache.get(a.masterSurveyId);
      if (!cached) {
        const msDoc = await db.collection('surveys').doc(a.masterSurveyId).get();
        const msData = msDoc.exists ? msDoc.data() : null;
        cached = {
          title: msData?.title || 'Anket',
          rewardSummary: msData?.verificationConfig?.verificationRewardSummary || '250 TL Hediye Çeki'
        };
        surveyCache.set(a.masterSurveyId, cached);
      }

      // STRICT PII SANITIZATION: Never return phone, email, TCKN, IBAN, KYC, or survey answers
      return {
        id: a.id,
        verificationCampaignId: a.verificationCampaignId,
        masterSurveyId: a.masterSurveyId,
        masterSurveyTitle: cached.title,
        verificationSurveyId: a.verificationSurveyId,
        verificationRewardSummary: cached.rewardSummary,
        userDisplayName: a.userDisplayName || 'PAG Kullanıcısı', // Ad + Soyad
        selectionSource: a.selectionSource,
        status: a.status,
        assignedAgentId: a.assignedAgentId,
        callStartedAt: a.callStartedAt || null,
        callEndedAt: a.callEndedAt || null,
        agentNote: a.agentNote || null,
        createdAt: a.createdAt || null,
        updatedAt: a.updatedAt || null
      };
    })
  );

  return {
    success: true,
    data: {
      assignments
    }
  };
};

// --------------------------------------------------
// 6. CALL CENTER: START CALL (SIMULATION ABSTRACTION)
// --------------------------------------------------
export const startVerificationCallHandler = async (
  data: { assignmentId: string },
  context: functions.https.CallableContext
) => {
  const adminUser = await verifyAdminUser(context);
  const { assignmentId } = data || {};

  if (!assignmentId || typeof assignmentId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'assignmentId is required.');
  }

  const db = admin.firestore();
  const assignRef = db.collection('surveyVerificationAssignments').doc(assignmentId);
  const serverNow = admin.firestore.FieldValue.serverTimestamp();

  return await db.runTransaction(async (transaction) => {
    const docSnap = await transaction.get(assignRef);
    if (!docSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Verification assignment not found.');
    }

    const assignment = docSnap.data() as SurveyVerificationAssignment;
    const allowedStatuses: VerificationAssignmentStatus[] = [
      'QUEUED',
      'ASSIGNED',
      'CALL_BACK_LATER',
      'NO_ANSWER',
      'CALLING'
    ];

    if (!allowedStatuses.includes(assignment.status)) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        `Cannot initiate call for assignment in status ${assignment.status}.`
      );
    }

    // Update assignment to CALLING
    transaction.update(assignRef, {
      status: 'CALLING',
      assignedAgentId: adminUser.uid,
      callStartedAt: serverNow,
      updatedAt: serverNow
    });

    // Create Audit Log (no phone number logged)
    const logRef = db.collection('verificationCallAuditLogs').doc();
    transaction.set(logRef, {
      id: logRef.id,
      agentId: adminUser.uid,
      assignmentId,
      campaignId: assignment.verificationCampaignId,
      action: 'START_CALL_SIMULATED',
      callStartedAt: serverNow,
      createdAt: serverNow
    });

    return {
      success: true,
      data: {
        assignmentId,
        status: 'CALLING',
        callProvider: 'SIMULATED',
        userDisplayName: assignment.userDisplayName
      }
    };
  });
};

// --------------------------------------------------
// 7. CALL CENTER: SUBMIT CALL RESULT
// --------------------------------------------------
export const submitVerificationCallResultHandler = async (
  data: {
    assignmentId: string;
    result: 'ACCEPTED' | 'DECLINED' | 'NO_ANSWER' | 'CALL_BACK_LATER' | 'WRONG_PERSON_OR_ISSUE';
    agentNote?: string;
  },
  context: functions.https.CallableContext
) => {
  const adminUser = await verifyAdminUser(context);
  const { assignmentId, result, agentNote } = data || {};

  if (!assignmentId || typeof assignmentId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'assignmentId is required.');
  }

  const validResults = ['ACCEPTED', 'DECLINED', 'NO_ANSWER', 'CALL_BACK_LATER', 'WRONG_PERSON_OR_ISSUE'];
  if (!validResults.includes(result)) {
    throw new functions.https.HttpsError('invalid-argument', `Invalid call result: ${result}`);
  }

  const db = admin.firestore();
  const assignRef = db.collection('surveyVerificationAssignments').doc(assignmentId);
  const serverNow = admin.firestore.FieldValue.serverTimestamp();

  return await db.runTransaction(async (transaction) => {
    const docSnap = await transaction.get(assignRef);
    if (!docSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Verification assignment not found.');
    }

    const assignment = docSnap.data() as SurveyVerificationAssignment;
    const cleanNote = typeof agentNote === 'string' ? agentNote.trim() : null;

    let targetStatus: VerificationAssignmentStatus = result;
    if (result === 'ACCEPTED') {
      targetStatus = 'ACCEPTED';
    }

    transaction.update(assignRef, {
      status: targetStatus,
      agentNote: cleanNote,
      callEndedAt: serverNow,
      updatedAt: serverNow
    });

    // Create Audit Log (No phone logged)
    const logRef = db.collection('verificationCallAuditLogs').doc();
    transaction.set(logRef, {
      id: logRef.id,
      agentId: adminUser.uid,
      assignmentId,
      campaignId: assignment.verificationCampaignId,
      action: 'SUBMIT_CALL_RESULT',
      result: result,
      agentNote: cleanNote,
      callStartedAt: assignment.callStartedAt || null,
      callEndedAt: serverNow,
      createdAt: serverNow
    });

    return {
      success: true,
      data: {
        assignmentId,
        status: targetStatus,
        result,
        pushQueued: result === 'ACCEPTED'
      }
    };
  });
};

// --------------------------------------------------
// 8. MOBILE APP: GET PENDING VERIFICATION SURVEY (APP OPEN PRIORITY)
// --------------------------------------------------
export const getPendingVerificationSurveyHandler = async (
  data: any,
  context: functions.https.CallableContext
) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authenticated user required.');
  }

  const uid = context.auth.uid;
  const db = admin.firestore();

  // Query pending accepted verification assignments for this user
  const assignmentsSnap = await db.collection('surveyVerificationAssignments')
    .where('userId', '==', uid)
    .where('status', 'in', ['ACCEPTED', 'PUSH_SENT'])
    .limit(1)
    .get();

  if (assignmentsSnap.empty) {
    return {
      success: true,
      data: {
        hasPendingVerification: false,
        pendingSurvey: null
      }
    };
  }

  const assignmentDoc = assignmentsSnap.docs[0];
  const assignment = assignmentDoc.data() as SurveyVerificationAssignment;

  // Fetch verification survey details
  const verSurveyDoc = await db.collection('surveys').doc(assignment.verificationSurveyId).get();
  if (!verSurveyDoc.exists) {
    return {
      success: true,
      data: {
        hasPendingVerification: false,
        pendingSurvey: null
      }
    };
  }

  const verSurvey = verSurveyDoc.data();

  // Fetch master survey title
  let masterSurveyTitle = 'Anket';
  if (assignment.masterSurveyId) {
    const msDoc = await db.collection('surveys').doc(assignment.masterSurveyId).get();
    if (msDoc.exists) {
      masterSurveyTitle = msDoc.data()?.title || 'Anket';
    }
  }

  return {
    success: true,
    data: {
      hasPendingVerification: true,
      pendingSurvey: {
        assignmentId: assignment.id,
        verificationSurveyId: assignment.verificationSurveyId,
        masterSurveyId: assignment.masterSurveyId,
        masterSurveyTitle: masterSurveyTitle,
        title: verSurvey?.title || `Kalite Doğrulama — ${masterSurveyTitle}`,
        description: verSurvey?.description || 'Katıldığınız anket için tek soruluk kalite doğrulaması sizi bekliyor.',
        rewardSummary: verSurvey?.verificationRewardSummary || '250 TL Hediye Çeki',
        questionCount: 1,
        questions: verSurvey?.questions || []
      }
    }
  };
};
