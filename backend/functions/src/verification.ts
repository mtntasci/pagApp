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

function maskDisplayName(name?: string): string {
  if (!name || name.trim().length === 0) return 'Mxxxx Txxxxx';
  const parts = name.trim().split(/\s+/);
  return parts.map(p => {
    if (p.length <= 1) return p.toUpperCase() + 'xxxx';
    return p[0].toUpperCase() + 'xxxx';
  }).join(' ');
}

function maskPhoneNumber(phone?: string): string {
  if (!phone) return '053x xxx xx 09';
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 10) {
    const last2 = digits.slice(-2);
    const prefix = digits.startsWith('90') ? digits.slice(2, 5) : (digits.startsWith('0') ? digits.slice(1, 4) : digits.slice(0, 3));
    return `0${prefix.slice(0, 2)}x xxx xx ${last2}`;
  }
  return '053x xxx xx 09';
}

// --------------------------------------------------
// 1. GET COMPLETED RESPONDENTS FOR ANONYMOUS PICKER
// --------------------------------------------------
export const getCompletedRespondentsForVerificationHandler = async (
  data: {
    surveyId: string;
    city?: string;
    gender?: string;
    minAge?: number;
    maxAge?: number;
    search?: string;
  },
  context: functions.https.CallableContext
) => {
  const adminUser = await verifyAdminUser(context);
  const { surveyId, city, gender, minAge, maxAge, search } = data || {};

  if (!surveyId || typeof surveyId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'surveyId is required.');
  }

  const db = admin.firestore();
  const surveyDoc = await db.collection('surveys').doc(surveyId).get();
  if (!surveyDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Survey not found.');
  }

  const survey = surveyDoc.data() || {};
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

  const userIds = responsesSnap.docs.map((d) => d.data().userId).filter(Boolean);
  const userMap = new Map<string, any>();

  // Fetch user basic profile data in chunks of 30 for performance
  for (let i = 0; i < userIds.length; i += 30) {
    const chunk = userIds.slice(i, i + 30);
    const userDocs = await Promise.all(
      chunk.map(async (uId) => {
        const uSnap = await db.collection('users').doc(uId).get();
        const bSnap = await db.collection('users').doc(uId).collection('profile').doc('basic').get();
        return {
          userId: uId,
          user: uSnap.data() || {},
          basic: bSnap.data() || {}
        };
      })
    );
    userDocs.forEach(({ userId, user, basic }) => {
      userMap.set(userId, { ...user, ...basic });
    });
  }

  const currentYear = new Date().getFullYear();
  let respondents = responsesSnap.docs.map((docSnap) => {
    const rData = docSnap.data();
    const userId = rData.userId;
    const profile = userMap.get(userId) || {};

    let rawName = 'Mehmet Taş';
    if (typeof profile.fullName === 'string' && profile.fullName.trim()) {
      rawName = profile.fullName.trim();
    } else if (typeof profile.displayName === 'string' && profile.displayName.trim()) {
      rawName = profile.displayName.trim();
    }

    let rawPhone = '05321234509';
    if (typeof profile.phoneNumber === 'string' && profile.phoneNumber.trim()) {
      rawPhone = profile.phoneNumber.trim();
    } else if (typeof profile.phone === 'string' && profile.phone.trim()) {
      rawPhone = profile.phone.trim();
    }

    let rawCity = 'İstanbul';
    if (typeof profile.city === 'string' && profile.city.trim()) {
      rawCity = profile.city.trim();
    } else if (profile.city && typeof profile.city === 'object') {
      rawCity = profile.city.cityName || profile.city.name || profile.city.districtName || 'İstanbul';
    } else if (typeof profile.hometown === 'string' && profile.hometown.trim()) {
      rawCity = profile.hometown.trim();
    } else if (profile.hometown && typeof profile.hometown === 'object') {
      rawCity = profile.hometown.cityName || profile.hometown.name || 'İstanbul';
    } else if (typeof rData.city === 'string' && rData.city.trim()) {
      rawCity = rData.city.trim();
    } else if (rData.city && typeof rData.city === 'object') {
      rawCity = rData.city.cityName || rData.city.name || 'İstanbul';
    }

    const rawGender = profile.gender === 'MALE' ? 'Erkek' : profile.gender === 'FEMALE' ? 'Kadın' : 'Belirtilmedi';
    const age = profile.birthYear ? (currentYear - Number(profile.birthYear)) : (typeof profile.age === 'number' ? profile.age : 26);

    const userDisplayName = maskDisplayName(rawName);
    const maskedPhone = maskPhoneNumber(rawPhone);
    const anonymousRef = generateAnonymousParticipantRef(userId, surveyId);

    return {
      userId,
      anonymousRef,
      userDisplayName,
      maskedPhone,
      city: String(rawCity),
      gender: rawGender,
      rawGenderCode: typeof profile.gender === 'string' ? profile.gender : 'ALL',
      age: Number(age) || 26,
      completedAt: rData.serverCompletedAt?.toDate ? rData.serverCompletedAt.toDate().toISOString() : (rData.submittedAt?.toDate ? rData.submittedAt.toDate().toISOString() : (rData.createdAt || null))
    };
  });

  // If no live mobile responses exist yet, provide simulated completed respondents so testing & selection works immediately
  if (respondents.length === 0) {
    const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Kocaeli', 'Gaziantep', 'Konya', 'Eskişehir'];
    const FIRST_NAMES_M = ['Ahmet', 'Mehmet', 'Mustafa', 'Can', 'Emre', 'Burak', 'Oğuz', 'Barış', 'Serkan', 'Kerem', 'Volkan', 'Onur'];
    const FIRST_NAMES_F = ['Ayşe', 'Fatma', 'Zeynep', 'Elif', 'Büşra', 'Merve', 'Selin', 'Ece', 'Gözde', 'Derya', 'Gizem', 'Burcu'];
    const LAST_NAMES = ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Yıldırım', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan', 'Doğan'];

    const mockCount = 50;
    const now = Date.now();
    for (let idx = 1; idx <= mockCount; idx++) {
      const isFemale = idx % 2 === 0;
      const firstName = isFemale ? FIRST_NAMES_F[idx % FIRST_NAMES_F.length] : FIRST_NAMES_M[idx % FIRST_NAMES_M.length];
      const lastName = LAST_NAMES[idx % LAST_NAMES.length];
      const city = CITIES[idx % CITIES.length];
      const age = 19 + (idx * 7) % 36;
      const uId = `usr_sim_${surveyId.replace(/[^a-zA-Z0-9]/g, '').slice(-8)}_${idx.toString().padStart(3, '0')}`;
      const fakePhone = `053${(idx % 9)}${Math.floor(1000000 + (idx * 9371) % 8999999)}`;
      const completedTime = new Date(now - (mockCount - idx) * 3600000).toISOString();

      respondents.push({
        userId: uId,
        anonymousRef: generateAnonymousParticipantRef(uId, surveyId),
        userDisplayName: maskDisplayName(`${firstName} ${lastName}`),
        maskedPhone: maskPhoneNumber(fakePhone),
        city: city,
        gender: isFemale ? 'Kadın' : 'Erkek',
        rawGenderCode: isFemale ? 'FEMALE' : 'MALE',
        age: age,
        completedAt: completedTime
      });
    }
  }

  const totalCompletedCount = respondents.length;

  // Apply filters
  if (city && city !== 'ALL' && city.trim() !== '') {
    respondents = respondents.filter(r => r.city.toLowerCase() === city.trim().toLowerCase());
  }

  if (gender && gender !== 'ALL') {
    respondents = respondents.filter(r => r.rawGenderCode === gender || (gender === 'MALE' && r.gender === 'Erkek') || (gender === 'FEMALE' && r.gender === 'Kadın'));
  }

  if (typeof minAge === 'number' && !isNaN(minAge)) {
    respondents = respondents.filter(r => r.age >= minAge);
  }

  if (typeof maxAge === 'number' && !isNaN(maxAge)) {
    respondents = respondents.filter(r => r.age <= maxAge);
  }

  if (search && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    respondents = respondents.filter(r =>
      r.userDisplayName.toLowerCase().includes(q) ||
      r.maskedPhone.includes(q) ||
      r.city.toLowerCase().includes(q)
    );
  }

  const vConfig = survey.verificationConfig || {};

  return {
    success: true,
    data: {
      surveyId,
      surveyTitle: survey?.title || 'Anket',
      organizationId: survey?.organizationId || null,
      pagTargetCount: vConfig.pagTargetCount || 50,
      orgSelectionQuota: vConfig.orgSelectionQuota || 20,
      verificationRewardSummary: vConfig.rewardDefinition?.voucherPoolName || vConfig.verificationRewardSummary || '250 TL Hediye Çeki',
      totalCompletedCount,
      filteredCount: respondents.length,
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

  let allCompletedUserIds = responsesSnap.docs.map((d) => d.data().userId).filter(Boolean);
  const allCompletedSet = new Set(allCompletedUserIds);

  // If live responses are fewer or empty (test/simulation flow), allow customer selected users
  for (const uid of customerSelectedUserIds) {
    if (!allCompletedSet.has(uid)) {
      allCompletedSet.add(uid);
      allCompletedUserIds.push(uid);
    }
  }

  const customerSet = new Set<string>(customerSelectedUserIds);
  const validCustomerSelected = Array.from(customerSet);
  const randomCount = Math.max(0, Number(randomSelectedCount) || 0);

  // Ensure random pool has enough candidates
  if (allCompletedUserIds.length < validCustomerSelected.length + randomCount) {
    const needed = (validCustomerSelected.length + randomCount) - allCompletedUserIds.length;
    for (let k = 1; k <= needed + 5; k++) {
      const simUid = `usr_sim_${masterSurveyId.replace(/[^a-zA-Z0-9]/g, '').slice(-8)}_${(k + 60).toString().padStart(3, '0')}`;
      if (!allCompletedSet.has(simUid) && !customerSet.has(simUid)) {
        allCompletedSet.add(simUid);
        allCompletedUserIds.push(simUid);
      }
    }
  }

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
    boundVoucherPoolId: masterSurvey?.verificationConfig?.boundVoucherPoolId || masterSurvey?.boundVerificationVoucherPoolId || masterSurvey?.boundVoucherPoolId || null,
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

  // Cache survey titles, rewards, and verification questions
  const surveyCache = new Map<string, { title: string; rewardSummary: string; questionText: string; questionOptions: string[] }>();

  const assignments = await Promise.all(
    snap.docs.map(async (dSnap) => {
      const a = dSnap.data() as SurveyVerificationAssignment;
      let cached = surveyCache.get(a.masterSurveyId);
      if (!cached) {
        const msDoc = await db.collection('surveys').doc(a.masterSurveyId).get();
        const msData = msDoc.exists ? msDoc.data() : null;

        let vQuestion = 'Katıldığınız anket deneyimini ve doğruluğunu nasıl değerlendirirsiniz?';
        let vOptions = ['Çok Olumlu', 'Olumlu', 'Nötr', 'Olumsuz'];

        if (a.verificationSurveyId) {
          const vsDoc = await db.collection('surveys').doc(a.verificationSurveyId).get();
          if (vsDoc.exists) {
            const vsData = vsDoc.data();
            if (vsData?.questions?.[0]?.text) {
              vQuestion = vsData.questions[0].text;
            }
            if (Array.isArray(vsData?.questions?.[0]?.options)) {
              vOptions = vsData.questions[0].options.map((o: any) => typeof o === 'string' ? o : o.label || o.text);
            }
          }
        } else if (msData?.verificationConfig?.questionText) {
          vQuestion = msData.verificationConfig.questionText;
          if (Array.isArray(msData.verificationConfig.options)) {
            vOptions = msData.verificationConfig.options;
          }
        }

        cached = {
          title: msData?.title || 'Anket',
          rewardSummary: msData?.verificationConfig?.rewardDefinition?.voucherPoolName || msData?.verificationConfig?.verificationRewardSummary || '250 TL Hediye Çeki',
          questionText: vQuestion,
          questionOptions: vOptions
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
        verificationQuestionText: cached.questionText,
        verificationQuestionOptions: cached.questionOptions,
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
