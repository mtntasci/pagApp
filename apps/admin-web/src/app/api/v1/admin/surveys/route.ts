import { NextRequest } from 'next/server';
import { authenticateRequest, apiUnauthorized, apiSuccess, apiError } from '@/lib/serverAuth';
import { db, surveys, questions, surveyResponses, organizations } from '@/db';
import { eq, desc, count, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return apiUnauthorized();
  }

  try {
    const allSurveys = await db
      .select({
        id: surveys.id,
        title: surveys.title,
        description: surveys.description,
        ownerType: surveys.ownerType,
        organizationId: surveys.organizationId,
        surveyType: surveys.surveyType,
        category: surveys.category,
        status: surveys.status,
        isHighlighted: surveys.isHighlighted,
        isArchived: surveys.isArchived,
        profileScoreReward: surveys.profileScoreReward,
        targetingConfig: surveys.targetingConfig,
        rewardDefinition: surveys.rewardDefinition,
        storyConfig: surveys.storyConfig,
        hasVerification: surveys.hasVerification,
        verificationConfig: surveys.verificationConfig,
        verificationTargetCount: surveys.verificationTargetCount,
        verificationOrgQuota: surveys.verificationOrgQuota,
        startAt: surveys.startAt,
        endAt: surveys.endAt,
        createdAt: surveys.createdAt,
        updatedAt: surveys.updatedAt
      })
      .from(surveys)
      .orderBy(desc(surveys.isHighlighted), desc(surveys.createdAt))
      .limit(2000);

    // Get counts in parallel
    const surveyList = await Promise.all(
      allSurveys.map(async (s) => {
        const [{ count: respCount }] = await db
          .select({ count: count() })
          .from(surveyResponses)
          .where(eq(surveyResponses.surveyId, s.id));

        const [{ count: qCount }] = await db
          .select({ count: count() })
          .from(questions)
          .where(eq(questions.surveyId, s.id));

        return {
          ...s,
          surveyId: s.id,
          completedCount: Number(respCount),
          questionCount: Number(qCount)
        };
      })
    );

    return apiSuccess({ surveys: surveyList });
  } catch (err: any) {
    console.error('List Admin Surveys Error:', err);
    return apiError('Anketler listelenirken hata: ' + (err.message || 'Bilinmeyen hata'));
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return apiUnauthorized();
  }

  try {
    const body = await req.json();
    const surveyId = body.surveyId || `srv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const title = body.title;
    const questionsList: any[] = Array.isArray(body.questions) ? body.questions : [];

    if (!title || !title.trim()) {
      return apiError('Anket başlığı zorunludur.');
    }

    if (questionsList.length > 3 && body.surveyType !== 'PROFILE') {
      return apiError('PAG Kampanya Anketleri maksimum 3 soru içerebilir.');
    }

    const isExisting = (await db.select({ id: surveys.id }).from(surveys).where(eq(surveys.id, surveyId)).limit(1)).length > 0;

    const surveyData = {
      id: surveyId,
      title: title.trim(),
      description: body.description || '',
      ownerType: body.ownerType || 'PAG',
      organizationId: body.organizationId || null,
      surveyType: body.surveyType || 'PAG',
      category: body.category || 'Genel',
      status: body.status || 'DRAFT',
      isHighlighted: Boolean(body.isHighlighted),
      isArchived: Boolean(body.isArchived),
      profileScoreReward: Number(body.profileScoreReward) || 50,
      targetingConfig: body.targetingConfig || { type: 'ALL' },
      rewardDefinition: body.rewardDefinition || { rewardType: 'NONE' },
      storyConfig: body.storyConfig || null,
      hasVerification: Boolean(body.hasVerification),
      verificationConfig: body.verificationConfig || null,
      verificationTargetCount: Number(body.verificationTargetCount) || 0,
      verificationOrgQuota: Number(body.verificationOrgQuota) || 0,
      startAt: body.startAt ? new Date(body.startAt) : null,
      endAt: body.endAt ? new Date(body.endAt) : null,
      updatedAt: new Date()
    };

    if (isExisting) {
      await db.update(surveys).set(surveyData).where(eq(surveys.id, surveyId));
    } else {
      await db.insert(surveys).values(surveyData);
    }

    // Replace questions
    if (questionsList.length > 0) {
      await db.delete(questions).where(eq(questions.surveyId, surveyId));
      const qRows = questionsList.map((q, idx) => ({
        id: q.id || `q_${surveyId}_${idx + 1}`,
        surveyId,
        questionOrder: idx + 1,
        text: q.text || `${idx + 1}. Soru`,
        questionType: q.type || 'SINGLE_SELECT',
        options: q.options || ['Seçenek 1', 'Seçenek 2'],
        isRequired: q.isRequired !== undefined ? Boolean(q.isRequired) : true
      }));

      await db.insert(questions).values(qRows);
    }

    return apiSuccess({
      surveyId,
      message: 'Anket başarıyla kaydedildi.'
    });
  } catch (err: any) {
    console.error('Save Survey Error:', err);
    return apiError('Anket kaydedilirken hata: ' + (err.message || 'Bilinmeyen hata'));
  }
}
