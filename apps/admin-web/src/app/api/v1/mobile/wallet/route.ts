import { NextRequest } from 'next/server';
import { authenticateRequest, apiUnauthorized, apiSuccess, apiError } from '@/lib/serverAuth';
import { db, profileScoreLedger, rewardLedger, vouchers, withdrawalRequests } from '@/db';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth || !auth.user) {
    return apiUnauthorized();
  }

  const user = auth.user;
  const userId = user.id;

  try {
    // 1. Fetch recent score history
    const scoreHistory = await db
      .select()
      .from(profileScoreLedger)
      .where(eq(profileScoreLedger.userId, userId))
      .orderBy(desc(profileScoreLedger.createdAt))
      .limit(50);

    // 2. Fetch reward earnings
    const rewardHistory = await db
      .select()
      .from(rewardLedger)
      .where(eq(rewardLedger.userId, userId))
      .orderBy(desc(rewardLedger.createdAt))
      .limit(50);

    // 3. Fetch assigned vouchers
    const userVouchers = await db
      .select()
      .from(vouchers)
      .where(eq(vouchers.assignedUserId, userId))
      .orderBy(desc(vouchers.assignedAt))
      .limit(50);

    // 4. Fetch withdrawal requests
    const withdrawals = await db
      .select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.userId, userId))
      .orderBy(desc(withdrawalRequests.createdAt))
      .limit(20);

    return apiSuccess({
      profileScore: user.profileScore,
      rewardBalance: user.rewardBalance,
      scoreHistory,
      rewardHistory,
      vouchers: userVouchers,
      withdrawals
    });
  } catch (err: any) {
    console.error('Wallet API Error:', err);
    return apiError('Cüzdan bilgileri alınırken hata: ' + (err.message || 'Bilinmeyen hata'));
  }
}
