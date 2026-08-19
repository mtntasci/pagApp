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

    return apiSuccess({
      userId: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      phone: user.phone,
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
      communicationPreferences: {
        pushMarketing: true,
        smsMarketing: false,
        emailMarketing: false,
        phoneMarketing: false
      },
      missingDocuments: []
    });
  } catch (err: any) {
    console.error('Bootstrap API Error:', err);
    return apiError('Kullanıcı oturumu başlatılırken hata: ' + (err.message || 'Bilinmeyen hata'));
  }
}
