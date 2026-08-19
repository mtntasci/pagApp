import { NextRequest } from 'next/server';
import { authenticateRequest, apiUnauthorized, apiSuccess, apiError } from '@/lib/serverAuth';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth || !auth.user) {
    return apiUnauthorized();
  }

  const userId = auth.user.id;

  try {
    const body = await req.json();
    const acceptances = body.acceptances || [];
    const commPrefs = body.communicationPreferences || {};

    // Update user status or metadata in PostgreSQL
    await db.update(users).set({
      updatedAt: new Date()
    }).where(eq(users.id, userId));

    return apiSuccess({
      acceptedCount: acceptances.length,
      communicationPreferences: commPrefs,
      recordedAt: new Date().toISOString()
    }, 'Sözleşmeler başarıyla onaylandı.');
  } catch (err: any) {
    console.error('Record Legal Acceptances Error:', err);
    return apiError('Sözleşmeler onaylanırken hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
  }
}
