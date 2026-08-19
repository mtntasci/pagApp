import { NextRequest } from 'next/server';
import { authenticateRequest, apiUnauthorized, apiSuccess, apiError } from '@/lib/serverAuth';
import { db, surveys, surveyResponses, users, profileScoreLedger, rewardLedger, vouchers } from '@/db';
import { eq, and, sql, count } from 'drizzle-orm';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authenticateRequest(req);
  if (!auth || !auth.user) {
    return apiUnauthorized();
  }

  const user = auth.user;
  const userId = user.id;
  const surveyId = params.id;

  try {
    const body = await req.json();
    const answers = body.answers || []; // [{ questionId, optionId, answerText }]

    if (!Array.isArray(answers) || answers.length === 0) {
      return apiError('Lütfen anket sorularını cevaplayınız.');
    }

    // 1. Fetch survey
    const surveyRows = await db.select().from(surveys).where(eq(surveys.id, surveyId)).limit(1);
    const survey = surveyRows[0];
    if (!survey) {
      return apiError('Anket bulunamadı.', 404);
    }

    // 2. Check duplicate submission
    const existing = await db
      .select({ id: surveyResponses.id })
      .from(surveyResponses)
      .where(and(eq(surveyResponses.surveyId, surveyId), eq(surveyResponses.userId, userId)))
      .limit(1);

    if (existing.length > 0) {
      return apiError('Bu anketi daha önce tamamladınız. Tekrar katılım sağlanamaz.', 409);
    }

    const completedAt = new Date();
    const responseId = `resp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 3. Insert Survey Response
    await db.insert(surveyResponses).values({
      id: responseId,
      surveyId,
      userId,
      answers,
      isVerified: false,
      completedAt
    });

    // 4. Calculate Profile Score
    const scoreReward = survey.profileScoreReward || 50;
    const idempotencyKey = `score_${surveyId}_${userId}`;

    await db.insert(profileScoreLedger).values({
      id: `psl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      sourceType: 'SURVEY_COMPLETED',
      sourceId: surveyId,
      scoreDelta: scoreReward,
      idempotencyKey,
      metadata: { surveyTitle: survey.title }
    });

    // Update user profile score
    const updatedUsers = await db
      .update(users)
      .set({
        profileScore: sql`${users.profileScore} + ${scoreReward}`,
        updatedAt: completedAt
      })
      .where(eq(users.id, userId))
      .returning();

    let earnedReward: any = null;

    // 5. Calculate Ranked Financial Reward (if configured)
    const rewardDef: any = survey.rewardDefinition;
    if (rewardDef && rewardDef.rewardType === 'MONEY') {
      // Find completion rank
      const [{ count: currentCount }] = await db
        .select({ count: count() })
        .from(surveyResponses)
        .where(eq(surveyResponses.surveyId, surveyId));
      
      const userRank = Number(currentCount); // 1-indexed completion rank

      let prizeAmount = 0;
      if (Array.isArray(rewardDef.rankedRules)) {
        const matchingRule = rewardDef.rankedRules.find((r: any) => Number(r.rank) === userRank);
        if (matchingRule) {
          prizeAmount = Number(matchingRule.amount) || 0;
        }
      }

      if (prizeAmount > 0) {
        const rewardLedgerId = `rw_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await db.insert(rewardLedger).values({
          id: rewardLedgerId,
          userId,
          surveyId,
          rewardType: 'MONEY',
          amount: prizeAmount.toFixed(2),
          currency: 'TL',
          status: 'CREDITED',
          idempotencyKey: `reward_${surveyId}_${userId}`
        });

        await db
          .update(users)
          .set({
            rewardBalance: sql`${users.rewardBalance} + ${prizeAmount}`
          })
          .where(eq(users.id, userId));

        earnedReward = {
          type: 'MONEY',
          amount: prizeAmount,
          currency: 'TL',
          rank: userRank
        };
      }
    } else if (rewardDef && rewardDef.rewardType === 'VOUCHER') {
      // Assign voucher from available pool
      const availableVoucher = await db
        .select()
        .from(vouchers)
        .where(and(eq(vouchers.surveyId, surveyId), eq(vouchers.status, 'AVAILABLE')))
        .limit(1);

      if (availableVoucher.length > 0) {
        const v = availableVoucher[0];
        await db
          .update(vouchers)
          .set({
            status: 'ASSIGNED',
            assignedUserId: userId,
            assignedAt: completedAt
          })
          .where(eq(vouchers.id, v.id));

        earnedReward = {
          type: 'VOUCHER',
          poolName: v.poolName,
          code: v.code,
          amount: v.amount
        };
      }
    }

    const finalUser = updatedUsers[0] || user;

    return apiSuccess({
      message: 'Anket başarıyla tamamlandı! Tebrikler.',
      earnedScore: scoreReward,
      earnedReward,
      profileScore: finalUser.profileScore,
      rewardBalance: finalUser.rewardBalance
    });
  } catch (err: any) {
    console.error('Survey Submit Error:', err);
    return apiError('Anket gönderilirken hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
  }
}
