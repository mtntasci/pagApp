import { NextRequest } from 'next/server';
import { authenticateRequest, apiUnauthorized, apiSuccess, apiError } from '@/lib/serverAuth';
import { db, verificationAssignments, users, profileScoreLedger, vouchers, surveys } from '@/db';
import { eq, sql, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return apiUnauthorized();
  }

  try {
    const body = await req.json();
    const assignmentId = body.assignmentId;
    const callResult = body.callResult; // 'ACCEPTED', 'DECLINED', 'NO_ANSWER', 'WRONG_PERSON', 'CALL_BACK_LATER'
    const verificationAnswers = body.verificationAnswers || null;
    const notes = body.notes || '';

    if (!assignmentId || !callResult) {
      return apiError('assignmentId ve callResult zorunludur.');
    }

    const assignmentRows = await db
      .select()
      .from(verificationAssignments)
      .where(eq(verificationAssignments.id, assignmentId))
      .limit(1);

    const assignment = assignmentRows[0];
    if (!assignment) {
      return apiError('Çağrı kaydı bulunamadı.', 404);
    }

    const now = new Date();
    const isCompleted = callResult === 'ACCEPTED' || callResult === 'COMPLETED';

    // 1. Update assignment record
    await db
      .update(verificationAssignments)
      .set({
        status: isCompleted ? 'COMPLETED' : 'CALLED',
        callResult,
        verificationAnswers,
        notes,
        callAgentUserId: auth.portalUser?.id || null,
        calledAt: now,
        completedAt: isCompleted ? now : null,
        updatedAt: now
      })
      .where(eq(verificationAssignments.id, assignmentId));

    // 2. If call accepted & verified, award verification reward (Score & Voucher)
    let rewardGranted = false;
    if (isCompleted) {
      const surveyRows = await db.select().from(surveys).where(eq(surveys.id, assignment.masterSurveyId)).limit(1);
      const survey = surveyRows[0];
      const vConfig = (survey?.verificationConfig as any) || {};
      const scoreDelta = typeof vConfig.profileScoreReward === 'number' ? vConfig.profileScoreReward : 25;

      // Award Profile Score
      await db.insert(profileScoreLedger).values({
        id: `psl_ver_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: assignment.respondentUserId,
        sourceType: 'VERIFICATION_COMPLETED',
        sourceId: assignment.masterSurveyId,
        scoreDelta,
        idempotencyKey: `ver_score_${assignmentId}`,
        metadata: { assignmentId, callResult }
      });

      await db
        .update(users)
        .set({
          profileScore: sql`${users.profileScore} + ${scoreDelta}`
        })
        .where(eq(users.id, assignment.respondentUserId));

      // Assign Voucher if available
      const availableVouchers = await db
        .select()
        .from(vouchers)
        .where(and(eq(vouchers.surveyId, assignment.masterSurveyId), eq(vouchers.status, 'AVAILABLE')))
        .limit(1);

      if (availableVouchers.length > 0) {
        await db
          .update(vouchers)
          .set({
            status: 'ASSIGNED',
            assignedUserId: assignment.respondentUserId,
            assignedAt: now
          })
          .where(eq(vouchers.id, availableVouchers[0].id));
      }

      rewardGranted = true;
    }

    return apiSuccess({
      assignmentId,
      status: isCompleted ? 'COMPLETED' : 'CALLED',
      callResult,
      rewardGranted,
      message: 'Çağrı sonucu başarıyla kaydedildi.'
    });
  } catch (err: any) {
    console.error('Record Call Result Error:', err);
    return apiError('Çağrı kaydedilirken hata: ' + (err.message || 'Bilinmeyen hata'));
  }
}
