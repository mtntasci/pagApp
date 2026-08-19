import { NextRequest } from 'next/server';
import { authenticateRequest, apiUnauthorized, apiSuccess, apiError } from '@/lib/serverAuth';
import { db, surveys, questions, surveyResponses, profileScoreLedger, users } from '@/db';
import { eq, and, desc, asc, inArray } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/mobile/profile-questions
 * Fetches all profile questions partitioned into unanswered and answered for the mobile user.
 */
export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth || !auth.user) {
    return apiUnauthorized();
  }

  const user = auth.user;

  try {
    // 1. Fetch all active profile surveys
    const profileSurveys = await db
      .select({
        id: surveys.id,
        title: surveys.title,
        description: surveys.description,
        category: surveys.category,
        profileScoreReward: surveys.profileScoreReward,
        status: surveys.status
      })
      .from(surveys)
      .where(
        and(
          eq(surveys.isArchived, false),
          eq(surveys.surveyType, 'PROFILE')
        )
      )
      .orderBy(desc(surveys.createdAt));

    if (profileSurveys.length === 0) {
      return apiSuccess({
        unansweredQuestions: [],
        answeredQuestions: [],
        availableScoreX: 0,
        totalCount: 0,
        answeredCount: 0
      });
    }

    const surveyIds = profileSurveys.map((s) => s.id);

    // 2. Fetch all questions for these surveys
    const allQuestions = await db
      .select()
      .from(questions)
      .where(inArray(questions.surveyId, surveyIds))
      .orderBy(asc(questions.questionOrder));

    const questionsMap = new Map<string, any>();
    for (const q of allQuestions) {
      questionsMap.set(q.surveyId, q);
    }

    // 3. Fetch user's previous responses for these surveys
    const userResponses = await db
      .select()
      .from(surveyResponses)
      .where(
        and(
          eq(surveyResponses.userId, user.id),
          inArray(surveyResponses.surveyId, surveyIds)
        )
      );

    const responsesMap = new Map<string, any>();
    for (const resp of userResponses) {
      responsesMap.set(resp.surveyId, resp);
    }

    // 4. Partition questions into unanswered and answered
    const unansweredQuestions: any[] = [];
    const answeredQuestions: any[] = [];
    let availableScoreX = 0;

    for (const srv of profileSurveys) {
      const q = questionsMap.get(srv.id);
      if (!q) continue;

      const rawOptions = Array.isArray(q.options) ? q.options : [];
      const formattedOptions = rawOptions.map((opt: any, index: number) => {
        if (typeof opt === 'string') {
          return { optionId: `opt_${index + 1}`, label: opt, order: index + 1 };
        }
        return {
          optionId: opt.optionId || opt.id || `opt_${index + 1}`,
          label: opt.label || opt.text || opt.title || `Seçenek ${index + 1}`,
          order: opt.order ?? index + 1
        };
      });

      const response = responsesMap.get(srv.id);

      if (response && response.answers) {
        // Answered
        const answersObj = response.answers as any;
        const selectedOptId = answersObj[q.id] || answersObj.selectedOptionId || (typeof answersObj === 'string' ? answersObj : '');
        const matchingOpt = formattedOptions.find((o: any) => o.optionId === selectedOptId);

        answeredQuestions.push({
          questionId: q.id,
          surveyId: srv.id,
          questionText: q.text || srv.title,
          categoryId: srv.category || 'Genel',
          categoryName: srv.category || 'Genel',
          options: formattedOptions,
          selectedOptionId: selectedOptId,
          selectedOptionLabel: matchingOpt ? matchingOpt.label : (selectedOptId || 'Seçildi'),
          updatedAt: response.completedAt?.toISOString() || new Date().toISOString()
        });
      } else {
        // Unanswered
        availableScoreX += (srv.profileScoreReward || 10);
        unansweredQuestions.push({
          id: q.id,
          surveyId: srv.id,
          questionText: q.text || srv.title,
          categoryId: srv.category || 'Genel',
          categoryName: srv.category || 'Genel',
          targetingGender: 'ALL',
          options: formattedOptions,
          profileScoreReward: srv.profileScoreReward || 10,
          status: 'ACTIVE',
          showOnHome: false
        });
      }
    }

    return apiSuccess({
      unansweredQuestions,
      answeredQuestions,
      availableScoreX,
      totalCount: profileSurveys.length,
      answeredCount: answeredQuestions.length
    });
  } catch (err: any) {
    console.error('Fetch Profile Questions Error:', err);
    return apiError('Profil soruları alınırken hata: ' + (err.message || 'Bilinmeyen hata'));
  }
}

/**
 * POST /api/v1/mobile/profile-questions
 * Submits batch or single answers for profile questions and awards Profile Score.
 */
export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth || !auth.user) {
    return apiUnauthorized();
  }

  const user = auth.user;

  try {
    const body = await req.json();
    const answersList: { questionId: string; optionId: string; surveyId?: string }[] =
      Array.isArray(body.answers) ? body.answers : (body.questionId ? [{ questionId: body.questionId, optionId: body.optionId, surveyId: body.surveyId }] : []);

    if (answersList.length === 0) {
      return apiError('En az bir soru cevabı gereklidir.');
    }

    let totalScoreAwarded = 0;
    const now = new Date();

    for (const item of answersList) {
      // Find question to get its surveyId
      let surveyId = item.surveyId;
      let qRecord: any = null;

      if (!surveyId) {
        const foundQ = await db.select().from(questions).where(eq(questions.id, item.questionId)).limit(1);
        if (foundQ.length > 0) {
          qRecord = foundQ[0];
          surveyId = qRecord.surveyId;
        }
      }

      if (!surveyId) continue;

      // Find survey for score reward
      const foundSrv = await db.select().from(surveys).where(eq(surveys.id, surveyId)).limit(1);
      const scoreReward = foundSrv.length > 0 ? (foundSrv[0].profileScoreReward || 10) : 10;

      // Check if already responded
      const existingResp = await db
        .select()
        .from(surveyResponses)
        .where(
          and(
            eq(surveyResponses.userId, user.id),
            eq(surveyResponses.surveyId, surveyId)
          )
        )
        .limit(1);

      const answerPayload = {
        [item.questionId]: item.optionId,
        selectedOptionId: item.optionId,
        updatedAt: now.toISOString()
      };

      if (existingResp.length > 0) {
        // Update response without adding new score (answers are editable per Rule 11)
        await db
          .update(surveyResponses)
          .set({
            answers: answerPayload,
            completedAt: now
          })
          .where(eq(surveyResponses.id, existingResp[0].id));
      } else {
        // Insert new response and award score
        const respId = `resp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await db.insert(surveyResponses).values({
          id: respId,
          surveyId,
          userId: user.id,
          answers: answerPayload,
          completedAt: now
        });

        // Award score
        totalScoreAwarded += scoreReward;

        const ledgerId = `psl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await db.insert(profileScoreLedger).values({
          id: ledgerId,
          userId: user.id,
          sourceType: 'PROFILE_SURVEY_COMPLETED',
          sourceId: surveyId,
          scoreDelta: scoreReward,
          idempotencyKey: `ps_${user.id}_${surveyId}`,
          metadata: { questionId: item.questionId, optionId: item.optionId }
        });
      }
    }

    // Update user's profileScore
    let newScore = user.profileScore || 0;
    if (totalScoreAwarded > 0) {
      newScore += totalScoreAwarded;
      await db
        .update(users)
        .set({
          profileScore: newScore,
          updatedAt: now
        })
        .where(eq(users.id, user.id));
    }

    return apiSuccess({
      batchScoreAwarded: totalScoreAwarded,
      currentProfileScore: newScore,
      message: `${answersList.length} profil cevabı başarıyla kaydedildi.`
    });
  } catch (err: any) {
    console.error('Submit Profile Answers Error:', err);
    return apiError('Cevaplar kaydedilirken hata: ' + (err.message || 'Bilinmeyen hata'));
  }
}
