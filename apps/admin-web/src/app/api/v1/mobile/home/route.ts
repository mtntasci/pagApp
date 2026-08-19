import { NextRequest } from 'next/server';
import { authenticateRequest, apiUnauthorized, apiSuccess, apiError } from '@/lib/serverAuth';
import { db, surveys, questions, surveyResponses, profileScoreLedger } from '@/db';
import { eq, and, notInArray, desc, or } from 'drizzle-orm';

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
      .limit(30);

    // Filter out profile surveys from main campaign feed
    activeSurveys = activeSurveys.filter(s => s.surveyType !== 'PROFILE' && !s.id.startsWith('pq_'));

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

    // 4. Fetch questions for the top eligible surveys
    const topSurveyIds = eligibleSurveys.slice(0, 10).map(s => s.id);
    let allQuestions: any[] = [];
    if (topSurveyIds.length > 0) {
      allQuestions = await db
        .select()
        .from(questions)
        .where(
          topSurveyIds.length === 1
            ? eq(questions.surveyId, topSurveyIds[0])
            : notInArray(questions.surveyId, ['dummy_non_existent']) // or inArray if available
        );
      
      allQuestions = allQuestions.filter(q => topSurveyIds.includes(q.surveyId));
    }

    // Attach questions to surveys
    const surveysWithQuestions = eligibleSurveys.map(s => {
      const sQuestions = allQuestions
        .filter(q => q.surveyId === s.id)
        .sort((a, b) => a.questionOrder - b.questionOrder)
        .map(q => ({
          questionId: q.id,
          text: q.text,
          order: q.questionOrder,
          type: q.questionType,
          options: q.options,
          isRequired: q.isRequired
        }));

      const rDef = (s.rewardDefinition as any) || {};
      return {
        ...s,
        surveyId: s.id,
        questions: sQuestions,
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
