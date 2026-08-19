import { NextRequest } from 'next/server';
import { authenticateRequest, apiUnauthorized, apiSuccess, apiError } from '@/lib/serverAuth';
import { db, surveys, verificationCampaigns, verificationAssignments, surveyResponses } from '@/db';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return apiUnauthorized();
  }

  try {
    const campaigns = await db
      .select({
        id: verificationCampaigns.id,
        masterSurveyId: verificationCampaigns.masterSurveyId,
        masterSurveyTitle: surveys.title,
        organizationId: verificationCampaigns.organizationId,
        status: verificationCampaigns.status,
        requestedCount: verificationCampaigns.requestedCount,
        customerSelectedCount: verificationCampaigns.customerSelectedCount,
        randomSelectedCount: verificationCampaigns.randomSelectedCount,
        verificationSurveyId: verificationCampaigns.verificationSurveyId,
        verificationRewardSummary: verificationCampaigns.verificationRewardSummary,
        createdAt: verificationCampaigns.createdAt
      })
      .from(verificationCampaigns)
      .innerJoin(surveys, eq(verificationCampaigns.masterSurveyId, surveys.id))
      .orderBy(desc(verificationCampaigns.createdAt))
      .limit(100);

    return apiSuccess({ campaigns });
  } catch (err: any) {
    console.error('List Campaigns Error:', err);
    return apiError('Kampanyalar listelenirken hata: ' + (err.message || 'Bilinmeyen hata'));
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return apiUnauthorized();
  }

  try {
    const body = await req.json();
    const masterSurveyId = body.masterSurveyId;
    const customerSelectedUserIds: string[] = Array.isArray(body.customerSelectedUserIds) ? body.customerSelectedUserIds : [];
    const randomSelectedCount: number = Number(body.randomSelectedCount) || 0;
    const verificationRewardSummary: string = body.verificationRewardSummary || '250 TL Hediye Çeki';

    if (!masterSurveyId) {
      return apiError('masterSurveyId gereklidir.');
    }

    // 1. Fetch survey
    const surveyRows = await db.select().from(surveys).where(eq(surveys.id, masterSurveyId)).limit(1);
    const survey = surveyRows[0];
    if (!survey) {
      return apiError('Anket bulunamadı.', 404);
    }

    // 2. Fetch respondents
    const allRespondents = await db
      .select({ userId: surveyResponses.userId })
      .from(surveyResponses)
      .where(eq(surveyResponses.surveyId, masterSurveyId));

    const allRespondentUserIds = allRespondents.map(r => r.userId);

    // 3. Resolve Random selection
    const remainingPool = allRespondentUserIds.filter(uid => !customerSelectedUserIds.includes(uid));
    // Shuffle remaining pool
    for (let i = remainingPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remainingPool[i], remainingPool[j]] = [remainingPool[j], remainingPool[i]];
    }
    const finalRandomUserIds = remainingPool.slice(0, randomSelectedCount);

    const campaignId = `vc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const totalCount = customerSelectedUserIds.length + finalRandomUserIds.length;

    // 4. Create Campaign
    await db.insert(verificationCampaigns).values({
      id: campaignId,
      masterSurveyId,
      organizationId: survey.organizationId,
      status: 'ACTIVE',
      requestedCount: totalCount,
      customerSelectedCount: customerSelectedUserIds.length,
      randomSelectedCount: finalRandomUserIds.length,
      verificationSurveyId: `vsrv_${masterSurveyId}`,
      verificationRewardSummary
    });

    // 5. Create Assignments for Call Center
    const assignmentRows: any[] = [];

    // Add customer selected
    customerSelectedUserIds.forEach(uid => {
      assignmentRows.push({
        id: `va_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        campaignId,
        masterSurveyId,
        respondentUserId: uid,
        status: 'PENDING',
        customerSelected: true
      });
    });

    // Add random selected
    finalRandomUserIds.forEach(uid => {
      assignmentRows.push({
        id: `va_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        campaignId,
        masterSurveyId,
        respondentUserId: uid,
        status: 'PENDING',
        customerSelected: false
      });
    });

    if (assignmentRows.length > 0) {
      await db.insert(verificationAssignments).values(assignmentRows);
    }

    return apiSuccess({
      campaignId,
      requestedCount: totalCount,
      customerSelectedCount: customerSelectedUserIds.length,
      randomSelectedCount: finalRandomUserIds.length,
      message: 'Kalite doğrulama kampanyası ve çağrı havuzu başarıyla oluşturuldu.'
    });
  } catch (err: any) {
    console.error('Create Campaign Error:', err);
    return apiError('Kampanya oluşturulurken hata: ' + (err.message || 'Bilinmeyen hata'));
  }
}
