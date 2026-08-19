import { NextRequest } from 'next/server';
import { authenticateRequest, apiUnauthorized, apiSuccess, apiError } from '@/lib/serverAuth';
import { db, verificationAssignments, verificationCampaigns, surveys, users } from '@/db';
import { eq, and, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return apiUnauthorized();
  }

  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get('campaignId');

  try {
    const conditions: any[] = [];
    if (campaignId) {
      conditions.push(eq(verificationAssignments.campaignId, campaignId));
    }

    const assignments = await db
      .select({
        id: verificationAssignments.id,
        campaignId: verificationAssignments.campaignId,
        masterSurveyId: verificationAssignments.masterSurveyId,
        masterSurveyTitle: surveys.title,
        status: verificationAssignments.status,
        callResult: verificationAssignments.callResult,
        customerSelected: verificationAssignments.customerSelected,
        notes: verificationAssignments.notes,
        calledAt: verificationAssignments.calledAt,
        completedAt: verificationAssignments.completedAt,
        userId: users.id,
        userDisplayName: users.displayName,
        phone: users.phone,
        city: users.city,
        gender: users.gender,
        age: users.age
      })
      .from(verificationAssignments)
      .innerJoin(surveys, eq(verificationAssignments.masterSurveyId, surveys.id))
      .innerJoin(users, eq(verificationAssignments.respondentUserId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(verificationAssignments.createdAt))
      .limit(200);

    const formatted = assignments.map(a => {
      const rawName = a.userDisplayName || 'Katılımcı';
      const parts = rawName.split(' ');
      const maskedName = parts.map((p, idx) => {
        if (p.length <= 1) return p;
        if (idx === 0) return p.charAt(0) + '*'.repeat(Math.min(p.length - 1, 4));
        return p.charAt(0) + '.***';
      }).join(' ');

      const rawPhone = a.phone || '05300000000';
      const maskedPhone = rawPhone.length >= 10
        ? `${rawPhone.slice(0, 4)} *** ** ${rawPhone.slice(-2)}`
        : '053x xxx xx 00';

      return {
        assignmentId: a.id,
        campaignId: a.campaignId,
        surveyId: a.masterSurveyId,
        surveyTitle: a.masterSurveyTitle,
        status: a.status,
        callResult: a.callResult,
        customerSelected: a.customerSelected,
        notes: a.notes,
        userDisplayName: maskedName,
        maskedPhone,
        realPhone: a.phone, // accessible for call agent click-to-call
        city: a.city || 'İstanbul',
        gender: a.gender || 'Belirtilmedi',
        age: a.age || 25,
        calledAt: a.calledAt ? a.calledAt.toISOString() : null,
        completedAt: a.completedAt ? a.completedAt.toISOString() : null
      };
    });

    return apiSuccess({ assignments: formatted });
  } catch (err: any) {
    console.error('List Assignments Error:', err);
    return apiError('Çağrı görevleri listelenirken hata: ' + (err.message || 'Bilinmeyen hata'));
  }
}
