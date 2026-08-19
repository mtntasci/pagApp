import { NextRequest } from 'next/server';
import { authenticateRequest, apiUnauthorized, apiSuccess, apiError } from '@/lib/serverAuth';
import { db, users, withdrawalRequests } from '@/db';
import { eq, sql } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth || !auth.user) {
    return apiUnauthorized();
  }

  const user = auth.user;
  const userId = user.id;

  try {
    const body = await req.json();
    const amount = Number(body.amount);
    const iban = String(body.iban || '').trim();
    const accountHolderName = String(body.accountHolderName || '').trim();

    if (!amount || amount <= 0) {
      return apiError('Geçerli bir çekim tutarı giriniz.');
    }

    if (!iban || iban.length < 15) {
      return apiError('Geçerli bir IBAN numarası giriniz.');
    }

    if (!accountHolderName) {
      return apiError('Hesap sahibi ad ve soyadı gereklidir.');
    }

    const currentBalance = Number(user.rewardBalance) || 0;
    if (currentBalance < amount) {
      return apiError(`Yetersiz bakiye. Mevcut bakiyeniz: ${currentBalance.toFixed(2)} TL`);
    }

    const withdrawalId = `wdr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Create withdrawal request
    await db.insert(withdrawalRequests).values({
      id: withdrawalId,
      userId,
      amount: amount.toFixed(2),
      currency: 'TL',
      iban,
      accountHolderName,
      status: 'PENDING'
    });

    // 2. Deduct from balance
    const updatedUsers = await db
      .update(users)
      .set({
        rewardBalance: sql`${users.rewardBalance} - ${amount}`,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();

    return apiSuccess({
      message: `${amount.toFixed(2)} TL tutarındaki para çekme talebiniz alındı ve işleme koyuldu.`,
      newBalance: updatedUsers[0]?.rewardBalance || '0.00'
    });
  } catch (err: any) {
    console.error('Withdraw API Error:', err);
    return apiError('Para çekme talebi oluşturulurken hata: ' + (err.message || 'Bilinmeyen hata'));
  }
}
