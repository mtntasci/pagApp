import { NextRequest } from 'next/server';
import { authenticateRequest, apiUnauthorized, apiSuccess, apiError } from '@/lib/serverAuth';
import { db, users, profileScoreLedger } from '@/db';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth || !auth.user) {
    return apiUnauthorized();
  }

  const user = auth.user;
  try {
    const body = await req.json().catch(() => ({}));
    const rawPhone = body.phone || '';
    const cleanPhone = rawPhone.replace(/[^\d+]/g, '');

    if (!cleanPhone || cleanPhone.length < 10) {
      return apiError('Geçerli bir telefon numarası giriniz.');
    }

    const now = new Date();
    const rewardScore = 200;

    // Check if user already got PHONE_VERIFIED bonus
    const existingLedger = await db
      .select()
      .from(profileScoreLedger)
      .where(eq(profileScoreLedger.idempotencyKey, `phone_${user.id}`))
      .limit(1);

    let scoreAwarded = 0;
    let newScore = Number(user.profileScore) || 0;

    if (existingLedger.length === 0) {
      scoreAwarded = rewardScore;
      newScore += scoreAwarded;

      const ledgerId = `psl_phone_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await db.insert(profileScoreLedger).values({
        id: ledgerId,
        userId: user.id,
        sourceType: 'PHONE_VERIFIED',
        sourceId: 'phone_verification',
        scoreDelta: rewardScore,
        idempotencyKey: `phone_${user.id}`,
        metadata: { phone: cleanPhone, reason: 'Telefon Doğrulama Bonusu' },
        createdAt: now
      });
    }

    await db
      .update(users)
      .set({
        phone: cleanPhone,
        phoneVerified: true,
        profileScore: newScore,
        updatedAt: now
      })
      .where(eq(users.id, user.id));

    return apiSuccess({
      phoneVerified: true,
      phone: cleanPhone,
      scoreAwarded,
      currentProfileScore: newScore,
      message: scoreAwarded > 0
        ? `Telefon numaranız başarıyla doğrulandı ve +${scoreAwarded} Profil Puanı hesabınıza tanımlandı!`
        : 'Telefon numaranız başarıyla doğrulandı.'
    });
  } catch (err: any) {
    console.error('Verify Phone Error:', err);
    return apiError('Telefon doğrulanırken hata: ' + (err.message || 'Bilinmeyen hata'));
  }
}
