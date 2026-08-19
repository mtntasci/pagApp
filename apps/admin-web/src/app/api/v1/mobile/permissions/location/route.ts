import { NextRequest } from 'next/server';
import { authenticateRequest, apiUnauthorized, apiSuccess, apiError } from '@/lib/serverAuth';
import { db, profileScoreLedger, users } from '@/db';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/mobile/permissions/location
 * Awards 100 Profile Score once for enabling location permission.
 */
export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth || !auth.user) {
    return apiUnauthorized();
  }

  const user = auth.user;

  try {
    const body = await req.json().catch(() => ({}));
    const city = body.city || user.city;
    const district = body.district || user.district;

    // Check if user already claimed location reward
    const existingAward = await db
      .select()
      .from(profileScoreLedger)
      .where(
        and(
          eq(profileScoreLedger.userId, user.id),
          eq(profileScoreLedger.sourceType, 'LOCATION_PERMISSION_GRANTED')
        )
      )
      .limit(1);

    if (existingAward.length > 0) {
      return apiSuccess({
        alreadyAwarded: true,
        scoreAwarded: 0,
        currentProfileScore: user.profileScore || 0,
        message: 'Konum izni puanı daha önce tanımlanmış.'
      });
    }

    const rewardScore = 100;
    const newScore = (user.profileScore || 0) + rewardScore;
    const now = new Date();

    const ledgerId = `psl_loc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await db.insert(profileScoreLedger).values({
      id: ledgerId,
      userId: user.id,
      sourceType: 'LOCATION_PERMISSION_GRANTED',
      sourceId: 'location_onboarding',
      scoreDelta: rewardScore,
      idempotencyKey: `loc_${user.id}`,
      metadata: { city, district, reason: 'İlk Konum İzni Bonusu' },
      createdAt: now
    });

    const updateFields: any = {
      profileScore: newScore,
      updatedAt: now
    };
    if (city) updateFields.city = city;
    if (district) updateFields.district = district;

    await db
      .update(users)
      .set(updateFields)
      .where(eq(users.id, user.id));

    return apiSuccess({
      alreadyAwarded: false,
      scoreAwarded: rewardScore,
      currentProfileScore: newScore,
      message: 'Tebrikler! Konum izniniz için 100 Profil Puanı hesabınıza tanımlandı.'
    });
  } catch (err: any) {
    console.error('Location Permission Award Error:', err);
    return apiError('Konum puanı tanımlanırken hata: ' + (err.message || 'Bilinmeyen hata'));
  }
}
