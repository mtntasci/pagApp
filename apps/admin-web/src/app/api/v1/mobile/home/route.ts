import { NextRequest } from 'next/server';
import { authenticateRequest, apiUnauthorized, apiSuccess, apiError } from '@/lib/serverAuth';
import { db, surveys, questions, surveyResponses, profileScoreLedger } from '@/db';
import { eq, and, inArray, desc, or } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth || !auth.user) {
    return apiUnauthorized();
  }

  const user = auth.user;
  const userId = user.id;

  try {
    // 1. Get IDs of surveys user already completed
    const completedResponses = await db
      .select({ surveyId: surveyResponses.surveyId })
      .from(surveyResponses)
      .where(eq(surveyResponses.userId, userId));
    
    const completedSurveyIds = completedResponses.map(r => r.surveyId);

    const now = new Date();

    // 2. Fetch active surveys
    let activeSurveys = await db
      .select()
      .from(surveys)
      .where(
        and(
          eq(surveys.isArchived, false),
          or(eq(surveys.status, 'ACTIVE'), eq(surveys.status, 'APPROVED'))
        )
      )
      .orderBy(desc(surveys.isHighlighted), desc(surveys.createdAt))
      .limit(100);

    // Filter out profile surveys from main campaign feed
    activeSurveys = activeSurveys.filter(s => s.surveyType !== 'PROFILE' && !s.id.startsWith('pq_'));

    // Filter out surveys that have NOT started yet (startAt in future) or have expired (endAt in past)
    activeSurveys = activeSurveys.filter(s => {
      if (s.startAt) {
        const start = new Date(s.startAt);
        if (!isNaN(start.getTime()) && start.getTime() > now.getTime()) {
          return false; // Başlama tarihi henüz gelmemiş, mobilde gösterme!
        }
      }
      if (s.endAt) {
        const end = new Date(s.endAt);
        if (!isNaN(end.getTime()) && end.getTime() < now.getTime()) {
          return false; // Bitiş tarihi geçmiş, mobilde gösterme!
        }
      }
      return true;
    });

    // Filter out already completed
    if (completedSurveyIds.length > 0) {
      activeSurveys = activeSurveys.filter(s => !completedSurveyIds.includes(s.id));
    }

    // 3. Demographics targeting filter
    const userCity = user.city?.trim().toLowerCase();
    const userGender = user.gender?.trim().toLowerCase();
    const userAge = user.age || 25;

    const eligibleSurveys = activeSurveys.filter(s => {
      const targeting: any = s.targetingConfig || {};
      if (!targeting.type || targeting.type === 'ALL') return true;

      // Gender filter
      if (targeting.gender && targeting.gender !== 'ALL') {
        const targetGender = String(targeting.gender).toLowerCase();
        if (userGender && targetGender !== userGender) return false;
      }

      // Age filter
      const minAge = targeting.profileFilters?.minAge || targeting.minAge;
      const maxAge = targeting.profileFilters?.maxAge || targeting.maxAge;
      if (minAge && userAge < minAge) return false;
      if (maxAge && userAge > maxAge) return false;

      // City filter
      const targetCities: string[] = targeting.cities || targeting.profileFilters?.cities || [];
      if (Array.isArray(targetCities) && targetCities.length > 0 && !targetCities.includes('ALL')) {
        const lowerCities = targetCities.map(c => String(c).toLowerCase());
        if (userCity && !lowerCities.includes(userCity)) return false;
      }

      return true;
    });

    // 4. Fetch questions for all eligible surveys
    const eligibleSurveyIds = eligibleSurveys.map(s => s.id);
    let allQuestions: any[] = [];
    if (eligibleSurveyIds.length > 0) {
      allQuestions = await db
        .select()
        .from(questions)
        .where(inArray(questions.surveyId, eligibleSurveyIds));
    }

    // Attach questions to surveys
    const surveysWithQuestions = eligibleSurveys.map(s => {
      let sQuestions = allQuestions
        .filter(q => q.surveyId === s.id)
        .sort((a, b) => a.questionOrder - b.questionOrder)
        .map(q => {
          let rawOpts = Array.isArray(q.options) ? q.options : [];
          if (typeof rawOpts === 'string') {
            rawOpts = (rawOpts as string).split(',').map(str => str.trim()).filter(Boolean);
          }
          const formattedOpts = rawOpts.map((opt: any, index: number) => {
            if (typeof opt === 'string') {
              return { optionId: `opt_${index + 1}`, label: opt.trim(), order: index + 1 };
            }
            return {
              optionId: opt.optionId || opt.id || `opt_${index + 1}`,
              label: opt.label || opt.text || opt.title || `Seçenek ${index + 1}`,
              order: typeof opt.order === 'number' ? opt.order : index + 1
            };
          });

          return {
            questionId: q.id,
            text: q.text,
            order: q.questionOrder,
            type: q.questionType || 'SINGLE_SELECT',
            options: formattedOpts.length > 0 ? formattedOpts : [
              { optionId: 'opt_1', label: 'Evet / Katılıyorum', order: 1 },
              { optionId: 'opt_2', label: 'Hayır / Katılmıyorum', order: 2 }
            ],
            isRequired: q.isRequired !== undefined ? q.isRequired : true
          };
        });

      // Fallback if no questions exist in DB
      if (sQuestions.length === 0) {
        sQuestions = [
          {
            questionId: `q_${s.id}_1`,
            text: s.title || 'Bu konu hakkındaki genel görüşünüz nedir?',
            order: 1,
            type: 'SINGLE_SELECT',
            options: [
              { optionId: 'opt_1', label: 'Çok Olumlu / Katılıyorum', order: 1 },
              { optionId: 'opt_2', label: 'Olumlu / Kısmen Katılıyorum', order: 2 },
              { optionId: 'opt_3', label: 'Kararsızım / Fikrim Yok', order: 3 },
              { optionId: 'opt_4', label: 'Olumsuz / Katılmıyorum', order: 4 }
            ],
            isRequired: true
          }
        ];
      }

      const rDef = (s.rewardDefinition as any) || {};
      return {
        ...s,
        surveyId: s.id,
        questions: sQuestions,
        questionCount: sQuestions.length,
        rewardSummary: rDef.totalBudget ? `${rDef.totalBudget} TL Havuz` : (rDef.voucherPoolName || null)
      };
    });

    // 5. Extract Stories
    const stories = activeSurveys
      .filter(s => s.storyConfig && ((s.storyConfig as any).showInStory || (s.storyConfig as any).isStory))
      .map(s => ({
        surveyId: s.id,
        title: s.title,
        label: (s.storyConfig as any).label || (s.storyConfig as any).storyLabel || s.category || 'Öne Çıkan',
        category: (s.storyConfig as any).category || (s.storyConfig as any).imageCategory || 'story_tech',
        profileScoreReward: s.profileScoreReward,
        isCompleted: completedSurveyIds.includes(s.id)
      }));

    return apiSuccess({
      user: {
        id: user.id,
        displayName: user.displayName,
        phone: user.phone,
        city: user.city,
        profileScore: user.profileScore,
        rewardBalance: user.rewardBalance,
        kycStatus: user.kycStatus
      },
      stories,
      surveys: surveysWithQuestions,
      stats: {
        completedCount: completedSurveyIds.length,
        availableCount: surveysWithQuestions.length
      }
    });
  } catch (err: any) {
    console.error('Mobile Home API Error:', err);
    return apiError('Ana sayfa verileri alınırken hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
  }
}
