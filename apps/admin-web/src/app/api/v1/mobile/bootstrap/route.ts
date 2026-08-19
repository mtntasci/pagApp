import { NextRequest } from 'next/server';
import { authenticateRequest, apiUnauthorized, apiSuccess, apiError } from '@/lib/serverAuth';
import { db, users, devices, surveyResponses } from '@/db';
import { eq, count } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth || !auth.user) {
    return apiUnauthorized();
  }

  const user = auth.user;
  const userId = user.id;

  try {
    const body = await req.json().catch(() => ({}));
    const deviceId = body.deviceId;
    const platform = body.platform || 'android';
    const appVersion = body.appVersion || '1.0.0';

    if (deviceId) {
      const existingDev = await db.select().from(devices).where(eq(devices.id, deviceId)).limit(1);
      if (existingDev.length > 0) {
        await db.update(devices).set({
          userId,
          platform,
          appVersion,
          isActive: true,
          lastActiveAt: new Date()
        }).where(eq(devices.id, deviceId));
      }
    }

    // Completed surveys count
    const [{ count: compCount }] = await db
      .select({ count: count() })
      .from(surveyResponses)
      .where(eq(surveyResponses.userId, userId));

    const rawName = user.displayName || 'Kullanıcı';
    const parts = rawName.split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    const isProfileCompleted = Boolean(user.city && user.gender && user.gender !== 'Belirtilmedi');

    const missingDocs = [
      {
        documentId: 'TERMS',
        type: 'TERMS',
        version: '1.0',
        title: 'Kullanım Koşulları ve Üyelik Sözleşmesi',
        url: 'https://www.pagapp.com.tr/terms',
        contentHash: 'PAG_TERMS_V1.0',
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
        contentHash: 'PAG_KVKK_NOTICE_V1.0',
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
        contentHash: 'PAG_REWARD_TERMS_V1.0',
        isRequired: true,
        isActive: true,
        requiresReacceptance: false
      }
    ];

    return apiSuccess({
      userId: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      phone: user.phone,
      phoneVerified: Boolean(user.phoneVerified),
      displayName: rawName,
      firstName,
      lastName,
      city: user.city || null,
      district: user.district || null,
      gender: user.gender || null,
      birthDate: user.birthDate || null,
      age: user.age || 25,
      maritalStatus: user.maritalStatus || null,
      childrenStatus: user.childrenStatus || null,
      hometown: user.hometown || null,
      education: user.education || null,
      occupation: user.occupation || null,
      kycStatus: user.kycStatus || 'NOT_STARTED',
      profileScore: Number(user.profileScore) || 0,
      rewardBalance: Number(user.rewardBalance) || 0,
      profileCompleted: isProfileCompleted,
      completedSurveysCount: Number(compCount),
      status: user.isBanned ? 'BANNED' : 'ACTIVE',
      legalConsentRequired: true,
      missingDocumentIds: ['TERMS', 'KVKK_NOTICE', 'REWARD_TERMS'],
      missingDocuments: missingDocs,
      communicationPreferences: {
        pushMarketing: false,
        smsMarketing: false,
        emailMarketing: false,
        phoneMarketing: false
      }
    });
  } catch (err: any) {
    console.error('Bootstrap API Error:', err);
    return apiError('Kullanıcı oturumu başlatılırken hata: ' + (err.message || 'Bilinmeyen hata'));
  }
}
