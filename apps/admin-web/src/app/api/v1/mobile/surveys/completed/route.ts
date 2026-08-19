import { NextRequest } from 'next/server';
import { authenticateRequest, apiUnauthorized, apiSuccess, apiError } from '@/lib/serverAuth';
import { db, surveyResponses, surveys } from '@/db';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth || !auth.user) {
    return apiUnauthorized();
  }

  const userId = auth.user.id;

  try {
    const list = await db
      .select({
        surveyId: surveys.id,
        title: surveys.title,
        description: surveys.description,
        ownerType: surveys.ownerType,
        organizationId: surveys.organizationId,
        surveyType: surveys.surveyType,
        profileScoreReward: surveys.profileScoreReward,
        completedAt: surveyResponses.completedAt
      })
      .from(surveyResponses)
      .innerJoin(surveys, eq(surveyResponses.surveyId, surveys.id))
      .where(eq(surveyResponses.userId, userId))
      .orderBy(desc(surveyResponses.completedAt))
      .limit(100);

    const formatted = list.map(s => ({
      ...s,
      status: 'COMPLETED',
      isCompleted: true,
      questionCount: 3,
      completedAt: s.completedAt.toISOString()
    }));

    return apiSuccess({ surveys: formatted });
  } catch (err: any) {
    console.error('Completed Surveys Error:', err);
    return apiError('Tamamlanan anketler alınırken hata: ' + (err.message || 'Bilinmeyen hata'));
  }
}
