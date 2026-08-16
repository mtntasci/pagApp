import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { evaluateUserLegalConsentStatus, LegalDocument, CommunicationPreferences } from './legal';
import { calculateAgeFromBirthDate } from './profile';

export interface BootstrapDeviceInput {
  deviceId: string;
  platform: 'IOS' | 'ANDROID';
  appVersion?: string;
}

export interface PAGUserResponse {
  userId: string;
  email: string | null;
  phone: string | null;
  displayName: string | null;
  firstName?: string | null;
  lastName?: string | null;
  photoUrl: string | null;
  authProviders: string[];
  status: string;
  profileScore: number;
  profileCompleted: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  kycStatus: string;
  iban?: string | null;
  tckn?: string | null;
  ibanVerified?: boolean;
  activeDeviceId: string | null;
  registeredAt?: string;
  // Legal Consent & Preferences
  legalConsentRequired: boolean;
  missingDocumentIds: string[];
  missingDocuments: LegalDocument[];
  communicationPreferences: CommunicationPreferences;
  isUnderage: boolean;
  underageBlocked: boolean;
}

function parseSignInProvider(providerId?: string): string {
  if (!providerId) return 'UNKNOWN';
  if (providerId.includes('google')) return 'GOOGLE';
  if (providerId.includes('apple')) return 'APPLE';
  if (providerId.includes('password') || providerId.includes('email')) return 'EMAIL';
  return providerId.toUpperCase();
}

export const bootstrapCurrentUserHandler = async (
  data: BootstrapDeviceInput,
  context: functions.https.CallableContext
) => {
  // 1. Authenticated User Check
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const uid = context.auth.uid;
  const token = context.auth.token;
  const email = token.email || null;
  const displayName = token.name || null;
  const photoUrl = token.picture || null;
  const emailVerified = !!token.email_verified;
  const phone = token.phone_number || null;
  const phoneVerified = !!token.phone_number;
  
  const rawProvider = token.firebase?.sign_in_provider;
  const provider = parseSignInProvider(rawProvider);

  const deviceId = data?.deviceId;
  const platform = data?.platform || 'IOS';
  const appVersion = data?.appVersion || '1.0.0';

  if (!deviceId || typeof deviceId !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function requires a valid deviceId.'
    );
  }

  const db = admin.firestore();
  const userRef = db.collection('users').doc(uid);
  const deviceRef = db.collection('devices').doc(deviceId);

  const now = admin.firestore.FieldValue.serverTimestamp();

  let userSummary: PAGUserResponse = {
    userId: uid,
    email: email,
    phone: phone,
    displayName: displayName,
    photoUrl: photoUrl,
    authProviders: [provider],
    status: 'ACTIVE',
    profileScore: 0,
    profileCompleted: false,
    phoneVerified: phoneVerified,
    emailVerified: emailVerified,
    kycStatus: 'NOT_STARTED',
    activeDeviceId: deviceId,
    legalConsentRequired: true,
    missingDocumentIds: [],
    missingDocuments: [],
    communicationPreferences: {
      pushMarketing: false,
      smsMarketing: false,
      emailMarketing: false,
      phoneMarketing: false
    },
    isUnderage: false,
    underageBlocked: false
  };

  await db.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    const deviceDoc = await transaction.get(deviceRef);

    if (!userDoc.exists) {
      // Create server-authoritative User Document
      const initialProviders = [provider];

      const newUserData = {
        userId: uid,
        email: email,
        phone: phone,
        displayName: displayName,
        photoUrl: photoUrl,
        authProviders: initialProviders,
        status: 'ACTIVE',
        registeredAt: now,
        updatedAt: now,
        createdAt: now,
        profileScore: 0,
        profileCompleted: false,
        phoneVerified: phoneVerified,
        emailVerified: emailVerified,
        kycStatus: 'NOT_STARTED',
        activeDeviceId: deviceId,
        communicationPreferences: {
          pushMarketing: false,
          smsMarketing: false,
          emailMarketing: false,
          phoneMarketing: false,
          updatedAt: now
        }
      };

      transaction.set(userRef, newUserData);

      userSummary = {
        userId: uid,
        email: email,
        phone: phone,
        displayName: displayName,
        photoUrl: photoUrl,
        authProviders: initialProviders,
        status: 'ACTIVE',
        profileScore: 0,
        profileCompleted: false,
        phoneVerified: phoneVerified,
        emailVerified: emailVerified,
        kycStatus: 'NOT_STARTED',
        activeDeviceId: deviceId,
        legalConsentRequired: true,
        missingDocumentIds: [],
        missingDocuments: [],
        communicationPreferences: {
          pushMarketing: false,
          smsMarketing: false,
          emailMarketing: false,
          phoneMarketing: false
        },
        isUnderage: false,
        underageBlocked: false
      };
    } else {
      // Existing User Document: Protect registeredAt, profileScore, status, kycStatus
      const existing = userDoc.data()!;
      
      const existingProviders: string[] = existing.authProviders || [];
      const updatedProviders = Array.from(new Set([...existingProviders, provider]));

      const updatedFields: Record<string, any> = {
        updatedAt: now,
        activeDeviceId: deviceId,
        authProviders: updatedProviders
      };

      if (displayName && displayName !== existing.displayName) {
        updatedFields.displayName = displayName;
      }
      if (photoUrl && photoUrl !== existing.photoUrl) {
        updatedFields.photoUrl = photoUrl;
      }
      if (email && email !== existing.email) {
        updatedFields.email = email;
      }
      if (emailVerified !== existing.emailVerified) {
        updatedFields.emailVerified = emailVerified;
      }

      transaction.update(userRef, updatedFields);

      userSummary = {
        userId: uid,
        email: updatedFields.email ?? existing.email ?? null,
        phone: existing.phone ?? null,
        displayName: updatedFields.displayName ?? existing.displayName ?? null,
        photoUrl: updatedFields.photoUrl ?? existing.photoUrl ?? null,
        authProviders: updatedProviders,
        status: existing.status || 'ACTIVE',
        profileScore: existing.profileScore ?? 0,
        profileCompleted: existing.profileCompleted ?? false,
        phoneVerified: existing.phoneVerified ?? false,
        emailVerified: updatedFields.emailVerified ?? existing.emailVerified ?? false,
        kycStatus: existing.kycStatus || 'NOT_STARTED',
        iban: existing.iban ?? null,
        tckn: existing.tckn ?? null,
        ibanVerified: existing.ibanVerified ?? false,
        activeDeviceId: deviceId,
        legalConsentRequired: true,
        missingDocumentIds: [],
        missingDocuments: [],
        communicationPreferences: existing.communicationPreferences || {
          pushMarketing: false,
          smsMarketing: false,
          emailMarketing: false,
          phoneMarketing: false
        },
        isUnderage: existing.status === 'UNDERAGE' || existing.status === 'SUSPENDED_UNDERAGE',
        underageBlocked: existing.status === 'UNDERAGE' || existing.status === 'SUSPENDED_UNDERAGE'
      };
    }

    // Upsert Active Device Record
    if (!deviceDoc.exists) {
      transaction.set(deviceRef, {
        deviceId: deviceId,
        userId: uid,
        platform: platform,
        fcmToken: null,
        notificationPermission: false,
        isActive: true,
        tokenStatus: 'ACTIVE',
        appVersion: appVersion,
        lastSeenAt: now,
        createdAt: now,
        updatedAt: now
      });
    } else {
      transaction.update(deviceRef, {
        userId: uid,
        platform: platform,
        isActive: true,
        tokenStatus: 'ACTIVE',
        appVersion: appVersion,
        lastSeenAt: now,
        updatedAt: now
      });
    }
  });

  functions.logger.info(`USER_BOOTSTRAPPED: userId=${uid}, deviceId=${deviceId}`);

  // Read Basic Profile for firstName/lastName and 18+ check
  try {
    const basicProfileSnap = await db.collection('users').doc(uid).collection('profile').doc('basic').get();
    if (basicProfileSnap.exists) {
      const bData = basicProfileSnap.data();
      if (bData?.firstName) userSummary.firstName = bData.firstName;
      if (bData?.lastName) userSummary.lastName = bData.lastName;
      if (bData?.birthDetails?.birthDate) {
        const computedAge = calculateAgeFromBirthDate(bData.birthDetails.birthDate);
        if (computedAge !== null && computedAge < 18) {
          userSummary.isUnderage = true;
          userSummary.underageBlocked = true;
          // Suspend underage account
          await db.collection('users').doc(uid).update({
            status: 'SUSPENDED_UNDERAGE',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          userSummary.status = 'SUSPENDED_UNDERAGE';
        }
      }
    }
  } catch (bpErr) {
    functions.logger.warn(`Failed to read basic profile during bootstrap:`, bpErr);
  }

  // Evaluate Legal Consent Status
  try {
    const consentStatus = await evaluateUserLegalConsentStatus(uid, db);
    userSummary.legalConsentRequired = consentStatus.consentRequired;
    userSummary.missingDocumentIds = consentStatus.missingDocumentIds;
    userSummary.missingDocuments = consentStatus.missingDocuments;
    userSummary.communicationPreferences = consentStatus.communicationPreferences;
  } catch (cErr) {
    functions.logger.error('Failed to evaluate legal consent status:', cErr);
  }

  return {
    success: true,
    data: userSummary!
  };
};
