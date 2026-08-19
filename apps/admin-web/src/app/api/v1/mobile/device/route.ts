import { NextRequest } from 'next/server';
import { authenticateRequest, apiUnauthorized, apiSuccess, apiError } from '@/lib/serverAuth';
import { db, devices } from '@/db';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth || !auth.user) {
    return apiUnauthorized();
  }

  const user = auth.user;
  try {
    const body = await req.json();
    const fcmToken = body.fcmToken;
    const platform = body.platform || 'android';
    const appVersion = body.appVersion || '1.0.0';

    if (!fcmToken) {
      return apiError('fcmToken gereklidir.');
    }

    const existing = await db.select().from(devices).where(eq(devices.fcmToken, fcmToken)).limit(1);

    if (existing.length > 0) {
      await db
        .update(devices)
        .set({
          userId: user.id,
          platform,
          appVersion,
          isActive: true,
          lastActiveAt: new Date()
        })
        .where(eq(devices.id, existing[0].id));
    } else {
      const deviceId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await db.insert(devices).values({
        id: deviceId,
        userId: user.id,
        fcmToken,
        platform,
        appVersion,
        isActive: true,
        lastActiveAt: new Date()
      });
    }

    return apiSuccess({ message: 'Cihaz ve bildirim tokenı başarıyla kaydedildi.' });
  } catch (err: any) {
    console.error('Device Register Error:', err);
    return apiError('Cihaz kaydedilirken hata: ' + (err.message || 'Bilinmeyen hata'));
  }
}
