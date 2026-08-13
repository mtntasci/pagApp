import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export interface ChildInfoInput {
  gender: 'MALE' | 'FEMALE';
  birthDate: string; // YYYY-MM-DD
}

export interface LocationPair {
  cityId: string;
  cityName: string;
  districtId: string;
  districtName: string;
  neighborhoodId?: string;
  neighborhoodName?: string;
  fullAddress?: string;
}

export interface BasicProfileInput {
  gender?: 'MALE' | 'FEMALE' | 'PREFER_NOT_TO_SAY';
  birthDetails?: {
    birthDate?: string;
    cityId?: string;
    cityName?: string;
    districtId?: string;
    districtName?: string;
  };
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  childrenInfo?: {
    hasChildren: boolean;
    childrenCount: number;
    children: ChildInfoInput[];
  };
  residenceAddress?: LocationPair;
  hometown?: {
    cityId: string;
    cityName: string;
    districtId: string;
    districtName: string;
  };
}

export const BASIC_PROFILE_REWARD_AMOUNT = 100; // Profile score awarded upon 100% basic profile completion

/**
 * Normalizes DD.MM.YYYY or YYYY-MM-DD date strings into standard YYYY-MM-DD.
 */
export function normalizeDateStringToISO(dateStr?: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split('.');
    return `${year}-${month}-${day}`;
  }
  return trimmed;
}

/**
 * Dynamically computes age in years from a birthDate string (YYYY-MM-DD or DD.MM.YYYY).
 */
export function calculateAgeFromBirthDate(birthDateStr?: string): number | null {
  if (!birthDateStr) return null;
  const isoStr = normalizeDateStringToISO(birthDateStr);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoStr)) {
    return null;
  }
  const birth = new Date(isoStr);
  if (isNaN(birth.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

/**
 * Calculates basic profile progress percentage across 5 core categories.
 */
export function calculateBasicProfileCompletion(profile: BasicProfileInput): {
  percentage: number;
  completedCategories: string[];
} {
  const categories: { key: string; isComplete: boolean }[] = [];

  // 1. Birth Details (Date & Place)
  const b = profile.birthDetails;
  const isBirthComplete = !!(b?.birthDate && /^\d{4}-\d{2}-\d{2}$/.test(b.birthDate) && b?.cityId && b?.districtId);
  categories.push({ key: 'birthDetails', isComplete: isBirthComplete });

  // 2. Marital Status
  const isMaritalComplete = !!(profile.maritalStatus && ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'OTHER'].includes(profile.maritalStatus));
  categories.push({ key: 'maritalStatus', isComplete: isMaritalComplete });

  // 3. Children Info
  const c = profile.childrenInfo;
  let isChildrenComplete = false;
  if (c !== undefined && typeof c.hasChildren === 'boolean') {
    if (!c.hasChildren) {
      isChildrenComplete = true;
    } else {
      isChildrenComplete = c.childrenCount > 0 && Array.isArray(c.children) && c.children.length === c.childrenCount;
    }
  }
  categories.push({ key: 'childrenInfo', isComplete: isChildrenComplete });

  // 4. Residence Address (City -> District -> Neighborhood)
  const addr = profile.residenceAddress;
  const isAddressComplete = !!(addr?.cityId && addr?.districtId && addr?.neighborhoodId);
  categories.push({ key: 'residenceAddress', isComplete: isAddressComplete });

  // 5. Hometown (City -> District)
  const ht = profile.hometown;
  const isHometownComplete = !!(ht?.cityId && ht?.districtId);
  categories.push({ key: 'hometown', isComplete: isHometownComplete });

  const completedCount = categories.filter(c => c.isComplete).length;
  const percentage = Math.round((completedCount / categories.length) * 100);
  const completedCategories = categories.filter(c => c.isComplete).map(c => c.key);

  return { percentage, completedCategories };
}

// --------------------------------------------------
// 1. GET BASIC PROFILE
// --------------------------------------------------
export const getBasicProfileHandler = async (
  data: any,
  context: functions.https.CallableContext
) => {
  if (!admin.apps.length) {
    admin.initializeApp();
  }

  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const uid = context.auth.uid;
  const db = admin.firestore();
  const profileRef = db.collection('users').doc(uid).collection('profile').doc('basic');

  const profileSnap = await profileRef.get();
  if (!profileSnap.exists) {
    return {
      success: true,
      data: {
        profile: null,
        computedUserAge: null,
        completionPercentage: 0,
        completedCategories: [],
        scoreAwarded: false
      }
    };
  }

  const pData = profileSnap.data() || {};
  const { percentage, completedCategories } = calculateBasicProfileCompletion(pData as BasicProfileInput);
  const computedUserAge = calculateAgeFromBirthDate(pData.birthDetails?.birthDate);

  // Compute children ages on-the-fly without saving as fixed field
  if (pData.childrenInfo?.children && Array.isArray(pData.childrenInfo.children)) {
    pData.childrenInfo.children = pData.childrenInfo.children.map((child: any) => ({
      ...child,
      computedAge: calculateAgeFromBirthDate(child.birthDate)
    }));
  }

  return {
    success: true,
    data: {
      profile: pData,
      computedUserAge,
      completionPercentage: percentage,
      completedCategories,
      scoreAwarded: !!pData.scoreAwarded
    }
  };
};

// --------------------------------------------------
// 2. UPDATE BASIC PROFILE & AWARD PROFILE SCORE
// --------------------------------------------------
export const updateBasicProfileHandler = async (
  data: BasicProfileInput,
  context: functions.https.CallableContext
) => {
  if (!admin.apps.length) {
    admin.initializeApp();
  }

  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const uid = context.auth.uid;
  const db = admin.firestore();
  const serverNow = admin.firestore.FieldValue.serverTimestamp();

  // Normalize & Validate Birth Date if provided
  if (data.birthDetails?.birthDate && data.birthDetails.birthDate.trim() !== '') {
    data.birthDetails.birthDate = normalizeDateStringToISO(data.birthDetails.birthDate);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.birthDetails.birthDate)) {
      throw new functions.https.HttpsError('invalid-argument', 'birthDate must be in YYYY-MM-DD or DD.MM.YYYY format.');
    }
  }

  // Validate Gender if provided
  if (data.gender) {
    const validGenders = ['MALE', 'FEMALE', 'PREFER_NOT_TO_SAY'];
    if (!validGenders.includes(data.gender)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid gender value.');
    }
  }

  // Validate Marital Status if provided
  if (data.maritalStatus) {
    const validStatuses = ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'OTHER', 'PREFER_NOT_TO_SAY'];
    if (!validStatuses.includes(data.maritalStatus)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid maritalStatus value.');
    }
  }

  // Normalize & Validate Children Array matching count
  if (data.childrenInfo) {
    if (data.childrenInfo.hasChildren) {
      if (!Array.isArray(data.childrenInfo.children) || data.childrenInfo.children.length !== data.childrenInfo.childrenCount) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'children array length must equal childrenCount when hasChildren is true.'
        );
      }
      for (const child of data.childrenInfo.children) {
        if (child.birthDate) {
          child.birthDate = normalizeDateStringToISO(child.birthDate);
        }
        if (!child.birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(child.birthDate)) {
          throw new functions.https.HttpsError('invalid-argument', 'Child birthDate must be in YYYY-MM-DD or DD.MM.YYYY format.');
        }
      }
    }
  }

  const { percentage, completedCategories } = calculateBasicProfileCompletion(data);
  const is100Percent = percentage === 100;

  const profileRef = db.collection('users').doc(uid).collection('profile').doc('basic');
  const userRef = db.collection('users').doc(uid);
  const ledgerId = `BASIC_PROFILE_${uid}`;
  const ledgerRef = db.collection('profileScoreLedgers').doc(ledgerId);

  let scoreAwardedNow = 0;
  let alreadyAwarded = false;

  try {
    await db.runTransaction(async (transaction) => {
      const existingProfileDoc = await transaction.get(profileRef);
      const existingProfileData = existingProfileDoc.data() || {};
      alreadyAwarded = !!existingProfileData.scoreAwarded;

      const payload: Record<string, any> = {
        ...data,
        completionPercentage: percentage,
        completedCategories,
        updatedAt: serverNow
      };

      if (!existingProfileDoc.exists) {
        payload.createdAt = serverNow;
      }

      // Award Profile Score ONCE upon 100% completion
      if (is100Percent && !alreadyAwarded) {
        const ledgerDoc = await transaction.get(ledgerRef);
        if (!ledgerDoc.exists) {
          scoreAwardedNow = BASIC_PROFILE_REWARD_AMOUNT;
          payload.scoreAwarded = true;
          payload.scoreAwardedAt = serverNow;

          // 1. Create audit ledger document
          transaction.set(ledgerRef, {
            ledgerId: ledgerId,
            userId: uid,
            sourceType: 'PROFILE_BASIC',
            sourceId: 'basic_profile',
            amount: BASIC_PROFILE_REWARD_AMOUNT,
            reason: 'Temel Profil Tamamlama Ödülü',
            createdAt: serverNow
          });

          // 2. Increment materialized profile score on user document
          transaction.set(userRef, {
            profileScore: admin.firestore.FieldValue.increment(BASIC_PROFILE_REWARD_AMOUNT),
            profileCompleted: true,
            updatedAt: serverNow
          }, { merge: true });
        }
      } else if (alreadyAwarded) {
        payload.scoreAwarded = true;
        if (is100Percent) {
          transaction.set(userRef, {
            profileCompleted: true,
            updatedAt: serverNow
          }, { merge: true });
        }
      }

      transaction.set(profileRef, payload, { merge: true });
    });
  } catch (err: any) {
    functions.logger.error(`Basic Profile transaction failed:`, err);
    if (err instanceof functions.https.HttpsError) {
      throw err;
    }
    throw new functions.https.HttpsError('internal', err?.message || 'Basic profile save transaction failed.');
  }

  functions.logger.info(`BASIC_PROFILE_UPDATED: userId=${uid}, progress=${percentage}%, scoreAwarded=${scoreAwardedNow}`);

  return {
    success: true,
    data: {
      profile: data,
      completionPercentage: percentage,
      completedCategories,
      scoreAwarded: scoreAwardedNow > 0,
      scoreAmount: scoreAwardedNow
    }
  };
};
