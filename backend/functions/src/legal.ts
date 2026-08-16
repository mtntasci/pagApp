import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as crypto from 'crypto';

export type LegalDocumentType =
  | 'TERMS'
  | 'KVKK_NOTICE'
  | 'EXPLICIT_CONSENT'
  | 'COMMERCIAL_COMMUNICATION'
  | 'REWARD_TERMS'
  | 'PRIVACY_POLICY'
  | 'AGE_SUITABILITY';

export interface LegalDocument {
  documentId: string;
  type: LegalDocumentType;
  version: string;
  title: string;
  url: string;
  contentHash: string;
  isRequired: boolean;
  isActive: boolean;
  publishedAt?: any;
  requiresReacceptance: boolean;
}

export interface UserLegalAcceptance {
  documentId: string;
  documentType: LegalDocumentType;
  version: string;
  contentHash: string;
  acceptedAt: any;
  accepted: boolean;
  source: 'IOS' | 'ANDROID' | 'WEB';
}

export interface CommunicationPreferences {
  pushMarketing: boolean;
  smsMarketing: boolean;
  emailMarketing: boolean;
  phoneMarketing: boolean;
  updatedAt?: any;
}

export interface RecordLegalAcceptanceInput {
  documentId: string;
  version: string;
  contentHash?: string;
}

export interface RecordLegalAcceptancesPayload {
  acceptances: RecordLegalAcceptanceInput[];
  communicationPreferences?: {
    pushMarketing?: boolean;
    smsMarketing?: boolean;
    emailMarketing?: boolean;
    phoneMarketing?: boolean;
  };
  source?: 'IOS' | 'ANDROID' | 'WEB';
}

/**
 * Computes deterministic SHA-256 hash for content validation.
 */
export function computeContentHash(content: string): string {
  return crypto.createHash('sha256').update(content.trim(), 'utf8').digest('hex');
}

/**
 * Default production legal documents baseline (version 1.0).
 */
export const DEFAULT_LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    documentId: 'TERMS',
    type: 'TERMS',
    version: '1.0',
    title: 'Kullanım Koşulları ve Üyelik Sözleşmesi',
    url: 'https://www.pagapp.com.tr/terms',
    contentHash: computeContentHash('PAG_TERMS_V1.0_20260817_PRODUCTION_ALAF_TEKNOLOJI'),
    isRequired: true,
    isActive: true,
    requiresReacceptance: false
  },
  {
    documentId: 'KVKK_NOTICE',
    type: 'KVKK_NOTICE',
    version: '1.0',
    title: 'Kullanıcı Gizliliği ve KVKK Aydınlatma Metni',
    url: 'https://www.pagapp.com.tr/user-privacy',
    contentHash: computeContentHash('PAG_KVKK_NOTICE_V1.0_20260817_PRODUCTION_ALAF_TEKNOLOJI'),
    isRequired: true,
    isActive: true,
    requiresReacceptance: false
  },
  {
    documentId: 'REWARD_TERMS',
    type: 'REWARD_TERMS',
    version: '1.0',
    title: 'Ödül ve Kampanya Katılım Koşulları',
    url: 'https://www.pagapp.com.tr/reward-terms',
    contentHash: computeContentHash('PAG_REWARD_TERMS_V1.0_20260817_PRODUCTION_ALAF_TEKNOLOJI'),
    isRequired: true,
    isActive: true,
    requiresReacceptance: false
  },
  {
    documentId: 'EXPLICIT_CONSENT',
    type: 'EXPLICIT_CONSENT',
    version: '1.0',
    title: 'Açık Rıza Metni',
    url: 'https://www.pagapp.com.tr/explicit-consent',
    contentHash: computeContentHash('PAG_EXPLICIT_CONSENT_V1.0_20260817_PRODUCTION_ALAF_TEKNOLOJI'),
    isRequired: false,
    isActive: true,
    requiresReacceptance: false
  },
  {
    documentId: 'COMMERCIAL_COMMUNICATION',
    type: 'COMMERCIAL_COMMUNICATION',
    version: '1.0',
    title: 'Ticari Elektronik İleti İzni',
    url: 'https://www.pagapp.com.tr/commercial-communication',
    contentHash: computeContentHash('PAG_COMMERCIAL_COMMUNICATION_V1.0_20260817_PRODUCTION_ALAF_TEKNOLOJI'),
    isRequired: false,
    isActive: true,
    requiresReacceptance: false
  },
  {
    documentId: 'PRIVACY_POLICY',
    type: 'PRIVACY_POLICY',
    version: '1.0',
    title: 'PAG Gizlilik Politikası',
    url: 'https://www.pagapp.com.tr/privacy',
    contentHash: computeContentHash('PAG_PRIVACY_POLICY_V1.0_20260817_PRODUCTION_ALAF_TEKNOLOJI'),
    isRequired: false,
    isActive: true,
    requiresReacceptance: false
  },
  {
    documentId: 'AGE_SUITABILITY',
    type: 'AGE_SUITABILITY',
    version: '1.0',
    title: 'Yaş Uygunluğu Bildirimi (18+)',
    url: 'https://www.pagapp.com.tr/age-suitability',
    contentHash: computeContentHash('PAG_AGE_SUITABILITY_V1.0_20260817_PRODUCTION_ALAF_TEKNOLOJI'),
    isRequired: false,
    isActive: true,
    requiresReacceptance: false
  }
];

/**
 * Retrieves all active legal documents from the Firestore registry.
 * Falls back to default definitions if collection is unpopulated.
 */
export async function getActiveLegalDocuments(db: admin.firestore.Firestore): Promise<LegalDocument[]> {
  try {
    const snap = await db.collection('legalDocuments').where('isActive', '==', true).get();
    if (!snap.empty) {
      return snap.docs.map(d => ({ documentId: d.id, ...d.data() } as LegalDocument));
    }
  } catch (err) {
    functions.logger.warn('Failed to query legalDocuments collection, using defaults:', err);
  }
  return DEFAULT_LEGAL_DOCUMENTS;
}

/**
 * Evaluates whether the user must complete legal agreement onboarding / re-acceptance.
 */
export async function evaluateUserLegalConsentStatus(
  userId: string,
  db: admin.firestore.Firestore
): Promise<{
  consentRequired: boolean;
  activeDocuments: LegalDocument[];
  requiredDocuments: LegalDocument[];
  acceptedDocumentIds: string[];
  missingDocumentIds: string[];
  missingDocuments: LegalDocument[];
  communicationPreferences: CommunicationPreferences;
}> {
  const activeDocs = await getActiveLegalDocuments(db);
  const requiredDocs = activeDocs.filter(d => d.isRequired);

  // Read user legal acceptances
  const acceptancesSnap = await db
    .collection('users')
    .doc(userId)
    .collection('legalAcceptances')
    .get();

  const acceptedMap = new Map<string, { version: string; contentHash: string; accepted: boolean }>();
  acceptancesSnap.docs.forEach(doc => {
    const data = doc.data();
    if (data.accepted) {
      acceptedMap.set(data.documentId, {
        version: data.version,
        contentHash: data.contentHash,
        accepted: true
      });
    }
  });

  const missingDocs: LegalDocument[] = [];
  const missingDocIds: string[] = [];
  const acceptedDocIds: string[] = [];

  for (const doc of requiredDocs) {
    const userAcceptance = acceptedMap.get(doc.documentId);
    if (!userAcceptance) {
      missingDocs.push(doc);
      missingDocIds.push(doc.documentId);
    } else {
      // Check version requirements
      if (doc.requiresReacceptance && userAcceptance.version !== doc.version) {
        missingDocs.push(doc);
        missingDocIds.push(doc.documentId);
      } else {
        acceptedDocIds.push(doc.documentId);
      }
    }
  }

  // Read communication preferences
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data() || {};
  const commPrefs: CommunicationPreferences = userData.communicationPreferences || {
    pushMarketing: false,
    smsMarketing: false,
    emailMarketing: false,
    phoneMarketing: false
  };

  return {
    consentRequired: missingDocs.length > 0,
    activeDocuments: activeDocs,
    requiredDocuments: requiredDocs,
    acceptedDocumentIds: acceptedDocIds,
    missingDocumentIds: missingDocIds,
    missingDocuments: missingDocs,
    communicationPreferences: commPrefs
  };
}

// --------------------------------------------------
// CALLABLE HANDLERS
// --------------------------------------------------

/**
 * 1. GET ACTIVE LEGAL DOCUMENTS
 */
export const getActiveLegalDocumentsHandler = async (
  data: any,
  context: functions.https.CallableContext
) => {
  if (!admin.apps.length) admin.initializeApp();
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Kullanıcı oturumu gereklidir.');
  }

  const db = admin.firestore();
  const docs = await getActiveLegalDocuments(db);

  return {
    success: true,
    data: docs
  };
};

/**
 * 2. RECORD LEGAL ACCEPTANCES & COMMUNICATION PREFERENCES
 */
export const recordLegalAcceptancesHandler = async (
  data: RecordLegalAcceptancesPayload,
  context: functions.https.CallableContext
) => {
  if (!admin.apps.length) admin.initializeApp();
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Kullanıcı oturumu gereklidir.');
  }

  const uid = context.auth.uid;
  const db = admin.firestore();
  const serverNow = admin.firestore.FieldValue.serverTimestamp();

  if (!data?.acceptances || !Array.isArray(data.acceptances) || data.acceptances.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Kabul edilecek sözleşmeler listesi boş olamaz.');
  }

  const activeDocs = await getActiveLegalDocuments(db);
  const activeDocMap = new Map(activeDocs.map(d => [d.documentId, d]));

  const source = data.source || 'IOS';
  const batch = db.batch();

  // 1. Record each acceptance in user subcollection
  for (const acc of data.acceptances) {
    const docDef = activeDocMap.get(acc.documentId);
    if (!docDef) {
      throw new functions.https.HttpsError('not-found', `Belirtilen sözleşme bulunamadı: ${acc.documentId}`);
    }

    const version = acc.version || docDef.version;
    const contentHash = acc.contentHash || docDef.contentHash;
    const recordId = `${acc.documentId}_${version}`;
    const acceptanceRef = db
      .collection('users')
      .doc(uid)
      .collection('legalAcceptances')
      .doc(recordId);

    batch.set(acceptanceRef, {
      documentId: acc.documentId,
      documentType: docDef.type,
      version: version,
      contentHash: contentHash,
      accepted: true,
      acceptedAt: serverNow,
      source: source
    }, { merge: true });
  }

  // 2. Persist communication preferences on user doc (default all false)
  const incomingPrefs = data.communicationPreferences || {};
  const commPrefsPayload: CommunicationPreferences = {
    pushMarketing: !!incomingPrefs.pushMarketing,
    smsMarketing: !!incomingPrefs.smsMarketing,
    emailMarketing: !!incomingPrefs.emailMarketing,
    phoneMarketing: !!incomingPrefs.phoneMarketing,
    updatedAt: serverNow
  };

  const userRef = db.collection('users').doc(uid);
  batch.set(userRef, {
    communicationPreferences: commPrefsPayload,
    legalConsentCompleted: true,
    updatedAt: serverNow
  }, { merge: true });

  await batch.commit();

  functions.logger.info(`LEGAL_ACCEPTANCES_RECORDED: userId=${uid}, docsCount=${data.acceptances.length}, pushMarketing=${commPrefsPayload.pushMarketing}`);

  return {
    success: true,
    data: {
      recordedCount: data.acceptances.length,
      communicationPreferences: {
        pushMarketing: commPrefsPayload.pushMarketing,
        smsMarketing: commPrefsPayload.smsMarketing,
        emailMarketing: commPrefsPayload.emailMarketing,
        phoneMarketing: commPrefsPayload.phoneMarketing
      }
    }
  };
};

/**
 * 3. UPDATE COMMUNICATION PREFERENCES (from Settings)
 */
export const updateCommunicationPreferencesHandler = async (
  data: {
    pushMarketing?: boolean;
    smsMarketing?: boolean;
    emailMarketing?: boolean;
    phoneMarketing?: boolean;
  },
  context: functions.https.CallableContext
) => {
  if (!admin.apps.length) admin.initializeApp();
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Kullanıcı oturumu gereklidir.');
  }

  const uid = context.auth.uid;
  const db = admin.firestore();
  const serverNow = admin.firestore.FieldValue.serverTimestamp();

  const userRef = db.collection('users').doc(uid);
  const userSnap = await userRef.get();
  const existingPrefs = userSnap.data()?.communicationPreferences || {};

  const updatedPrefs: CommunicationPreferences = {
    pushMarketing: typeof data.pushMarketing === 'boolean' ? data.pushMarketing : !!existingPrefs.pushMarketing,
    smsMarketing: typeof data.smsMarketing === 'boolean' ? data.smsMarketing : !!existingPrefs.smsMarketing,
    emailMarketing: typeof data.emailMarketing === 'boolean' ? data.emailMarketing : !!existingPrefs.emailMarketing,
    phoneMarketing: typeof data.phoneMarketing === 'boolean' ? data.phoneMarketing : !!existingPrefs.phoneMarketing,
    updatedAt: serverNow
  };

  await userRef.set({
    communicationPreferences: updatedPrefs,
    updatedAt: serverNow
  }, { merge: true });

  functions.logger.info(`COMMUNICATION_PREFERENCES_UPDATED: userId=${uid}, prefs=`, updatedPrefs);

  return {
    success: true,
    data: {
      pushMarketing: updatedPrefs.pushMarketing,
      smsMarketing: updatedPrefs.smsMarketing,
      emailMarketing: updatedPrefs.emailMarketing,
      phoneMarketing: updatedPrefs.phoneMarketing
    }
  };
};

/**
 * 4. SEED LEGAL DOCUMENTS (Admin / Setup)
 */
export const seedLegalDocumentsAdminHandler = async (
  data: any,
  context: functions.https.CallableContext
) => {
  if (!admin.apps.length) admin.initializeApp();
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Yetkilendirme gereklidir.');
  }

  const db = admin.firestore();
  const serverNow = admin.firestore.FieldValue.serverTimestamp();
  const batch = db.batch();

  for (const doc of DEFAULT_LEGAL_DOCUMENTS) {
    const docRef = db.collection('legalDocuments').doc(doc.documentId);
    batch.set(docRef, {
      ...doc,
      publishedAt: serverNow,
      updatedAt: serverNow
    }, { merge: true });
  }

  await batch.commit();

  return {
    success: true,
    message: `${DEFAULT_LEGAL_DOCUMENTS.length} yasal belge kaydı başarıyla oluşturuldu/güncellendi.`
  };
};
