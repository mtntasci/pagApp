import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/serverAuth';
import { db, surveys } from '@/db';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const now = new Date();
  const sList = await db.select().from(surveys).where(eq(surveys.id, 'srv_yeni_urunlere_acklk_2026'));
  const s = sList[0];

  let isStartFuture = false;
  let isEndPast = false;

  if (s && s.startAt) {
    const start = new Date(s.startAt);
    isStartFuture = start.getTime() > now.getTime();
  }
  if (s && s.endAt) {
    const end = new Date(s.endAt);
    isEndPast = end.getTime() < now.getTime();
  }

  return apiSuccess({
    now: now.toISOString(),
    nowTime: now.getTime(),
    survey: s ? {
      id: s.id,
      status: s.status,
      startAt: s.startAt,
      startAtTime: s.startAt ? new Date(s.startAt).getTime() : null,
      endAt: s.endAt,
      endAtTime: s.endAt ? new Date(s.endAt).getTime() : null,
      isStartFuture,
      isEndPast,
      isArchived: s.isArchived,
      surveyType: s.surveyType
    } : null
  });
}
