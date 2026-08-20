import { NextRequest } from 'next/server';
import { authenticateRequest, apiUnauthorized, apiSuccess, apiError } from '@/lib/serverAuth';
import { db, surveys, questions, surveyResponses, organizations } from '@/db';
import { eq, ne, desc, count, sql, asc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return apiUnauthorized();
  }

  try {
    const { searchParams } = new URL(req.url);
    const filterType = searchParams.get('type') || searchParams.get('surveyType');

    let allSurveys = await db
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

    if (filterType === 'PROFILE') {
      allSurveys = allSurveys.filter(s => s.surveyType === 'PROFILE' || s.id.startsWith('pq_'));
    } else if (filterType === 'CAMPAIGN' || filterType === 'GENERAL') {
      allSurveys = allSurveys.filter(s => s.surveyType !== 'PROFILE' && !s.id.startsWith('pq_'));
    }

    // Fetch all questions to attach with options
    const allQuestions = await db
      .select()
      .from(questions)
      .orderBy(asc(questions.questionOrder));

    const questionsBySurvey: Record<string, any[]> = {};
    for (const q of allQuestions) {
      if (!questionsBySurvey[q.surveyId]) {
        questionsBySurvey[q.surveyId] = [];
      }
      questionsBySurvey[q.surveyId].push({
        id: q.id,
        questionId: q.id,
        order: q.questionOrder,
        text: q.text,
        type: q.questionType,
        options: q.options,
        isRequired: q.isRequired
      });
    }

    const surveyList = allSurveys.map((s) => {
      const sQuestions = questionsBySurvey[s.id] || [];
      const firstQ = sQuestions[0];
      return {
        ...s,
        surveyId: s.id,
        questions: sQuestions,
        questionCount: sQuestions.length,
        options: firstQ ? firstQ.options : [],
        completedCount: 0
      };
    });

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

    const existingRows = await db.select().from(surveys).where(eq(surveys.id, surveyId)).limit(1);
    const isExisting = existingRows.length > 0;

    // Handle partial updates (such as Approve / Archive / Status change)
    if (isExisting && (!title || !title.trim())) {
      const updateData: any = {
        updatedAt: new Date()
      };
      if (body.status !== undefined) {
        updateData.status = body.status;
        if (body.status === 'ACTIVE') {
          updateData.isArchived = false;
        }
      }
      if (body.startAt !== undefined) {
        updateData.startAt = body.startAt ? new Date(body.startAt) : null;
      }
      if (body.endAt !== undefined) {
        updateData.endAt = body.endAt ? new Date(body.endAt) : null;
      }
      if (body.isArchived !== undefined) {
        updateData.isArchived = Boolean(body.isArchived);
        if (body.isArchived) updateData.status = 'ARCHIVED';
      }
      if (body.isHighlighted !== undefined) {
        updateData.isHighlighted = Boolean(body.isHighlighted);
      }

      await db.update(surveys).set(updateData).where(eq(surveys.id, surveyId));
      return apiSuccess({ surveyId, status: updateData.status || existingRows[0].status }, 'Anket durumu başarıyla güncellendi.');
    }

    let questionsList: any[] = [];
    if (Array.isArray(body.questions)) {
      questionsList = body.questions;
    } else if (Array.isArray(body.sorular)) {
      questionsList = body.sorular;
    } else if (Array.isArray(body.items)) {
      questionsList = body.items;
    } else if (Array.isArray(body.questionList)) {
      questionsList = body.questionList;
    } else if (body.questionText || body.question || body.soru || body.options || body.choices || body.secenekler) {
      questionsList = [
        {
          id: `q_${surveyId}_1`,
          text: body.questionText || body.question || body.soru || body.title,
          options: body.options || body.choices || body.secenekler || body.answers || ['Seçenek 1', 'Seçenek 2']
        }
      ];
    }

    if (!title || !title.trim()) {
      return apiError('Anket başlığı zorunludur.');
    }

    if (questionsList.length > 3 && body.surveyType !== 'PROFILE') {
      return apiError('PAG Kampanya Anketleri maksimum 3 soru içerebilir.');
    }

    const surveyData = {
      id: surveyId,
      title: title.trim(),
      description: body.description || '',
      ownerType: body.ownerType || 'PAG',
      organizationId: body.organizationId || null,
      surveyType: body.surveyType || 'PAG',
      category: body.category || 'Genel',
      status: body.status || (isExisting ? existingRows[0].status : 'DRAFT'),
      isHighlighted: Boolean(body.isHighlighted),
      isArchived: Boolean(body.isArchived),
      profileScoreReward: Number(body.profileScoreReward) || 50,
      targetingConfig: body.targetingConfig || body.targeting || { type: 'ALL' },
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
      const qRows = questionsList.map((q, idx) => {
        let rawOpts = Array.isArray(q.options)
          ? q.options
          : (Array.isArray(q.choices)
              ? q.choices
              : (Array.isArray(q.answers)
                  ? q.answers
                  : (Array.isArray(q.secenekler)
                      ? q.secenekler
                      : (Array.isArray(q.cevaplar) ? q.cevaplar : []))));

        // If string was passed as comma-separated or raw string
        if (typeof rawOpts === 'string') {
          rawOpts = (rawOpts as string).split(',').map(s => s.trim()).filter(Boolean);
        }

        if (!Array.isArray(rawOpts) || rawOpts.length === 0) {
          rawOpts = ['Seçenek 1', 'Seçenek 2'];
        }

        const formattedOpts = rawOpts.map((opt: any, oIdx: number) => {
          if (typeof opt === 'string') {
            const cleanText = opt.trim();
            return {
              optionId: `opt_${oIdx + 1}`,
              label: cleanText || `Seçenek ${oIdx + 1}`,
              order: oIdx + 1
            };
          }
          const label = opt?.label || opt?.text || opt?.title || opt?.name || opt?.value || opt?.optionText || opt?.secenek || `Seçenek ${oIdx + 1}`;
          return {
            optionId: opt?.optionId || opt?.id || opt?.key || `opt_${oIdx + 1}`,
            label: String(label).trim() || `Seçenek ${oIdx + 1}`,
            order: typeof opt?.order === 'number' ? opt.order : oIdx + 1
          };
        });

        const questionText = q.text || q.questionText || q.question || q.title || q.soru || q.prompt || `${idx + 1}. Soru`;
        const questionUniqueId = q.id && q.id.startsWith(surveyId)
          ? q.id
          : `${surveyId}_${q.id || q.questionId || `q${idx + 1}`}`;

        return {
          id: questionUniqueId,
          surveyId,
          questionOrder: typeof q.order === 'number' ? q.order : (idx + 1),
          text: String(questionText).trim(),
          questionType: q.type || q.questionType || 'SINGLE_SELECT',
          options: formattedOpts,
          isRequired: q.isRequired !== undefined ? Boolean(q.isRequired) : true
        };
      });

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

export async function DELETE(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return apiUnauthorized();
  }

  try {
    const { searchParams } = new URL(req.url);
    const surveyId = searchParams.get('id') || searchParams.get('surveyId');
    const surveyType = searchParams.get('type') || searchParams.get('surveyType');

    if (surveyType === 'PROFILE') {
      await db.delete(surveys).where(eq(surveys.surveyType, 'PROFILE'));
      return apiSuccess({}, 'Tüm profil anketleri başarıyla silindi.');
    }

    if (surveyType === 'GENERAL' || surveyType === 'CAMPAIGN') {
      await db.delete(surveys).where(ne(surveys.surveyType, 'PROFILE'));
      return apiSuccess({}, 'Tüm genel anketler başarıyla silindi.');
    }

    if (!surveyId) {
      return apiError('Silinecek anket ID si belirtilmedi.');
    }

    await db.delete(surveys).where(eq(surveys.id, surveyId));
    return apiSuccess({ surveyId }, 'Anket başarıyla silindi.');
  } catch (err: any) {
    console.error('Delete Survey Error:', err);
    return apiError('Anket silinirken hata: ' + (err.message || 'Bilinmeyen hata'));
  }
}
