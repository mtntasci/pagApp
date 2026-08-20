import { NextRequest } from 'next/server';
import { authenticateRequest, apiUnauthorized, apiSuccess, apiError } from '@/lib/serverAuth';
import { db, surveyResponses, surveys } from '@/db';
import { eq, desc, and, inArray } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth || !auth.user) {
    return apiUnauthorized();
  }

  const userId = auth.user.id;

  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get('ids');
    const specificIds = idsParam ? idsParam.split(',').map(s => s.trim()).filter(Boolean) : [];

    const whereConditions = [eq(surveyResponses.userId, userId)];
    if (specificIds.length > 0) {
      whereConditions.push(inArray(surveyResponses.surveyId, specificIds));
    }

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
      .where(and(...whereConditions))
      .orderBy(desc(surveyResponses.completedAt))
      .limit(100);

    const formatted = list.map(s => ({
      ...s,
      id: s.surveyId,
      status: 'COMPLETED',
      isCompleted: true,
      questionCount: 3,
      completedAt: s.completedAt.toISOString()
    }));

    return apiSuccess({
      surveys: formatted,
      completedSurveys: formatted,
      count: formatted.length
    });
  } catch (err: any) {
    console.error('Completed Surveys Error:', err);
    return apiError('Tamamlanan anketler alınırken hata: ' + (err.message || 'Bilinmeyen hata'));
  }
}
