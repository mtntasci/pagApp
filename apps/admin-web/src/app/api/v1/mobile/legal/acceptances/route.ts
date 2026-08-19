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
    const birthYear = body.birthYear ? Number(body.birthYear) : null;

    const updatePayload: any = {
      updatedAt: new Date()
    };

    if (birthYear && birthYear >= 1920 && birthYear <= 2008) {
      updatePayload.age = new Date().getFullYear() - birthYear;
    }

    // Update user status and age in PostgreSQL
    await db.update(users).set(updatePayload).where(eq(users.id, userId));

    return apiSuccess({
      acceptedCount: acceptances.length,
      communicationPreferences: commPrefs,
      birthYear: birthYear,
      recordedAt: new Date().toISOString()
    }, 'Sözleşmeler ve 18+ yaş teyidi başarıyla onaylandı.');
  } catch (err: any) {
    console.error('Record Legal Acceptances Error:', err);
    return apiError('Sözleşmeler onaylanırken hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
  }
}
