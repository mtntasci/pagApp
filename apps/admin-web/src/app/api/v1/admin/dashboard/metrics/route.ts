import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/serverAuth';
import { db, users, surveys, surveyResponses, devices } from '@/db';
import { eq, sql, count } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // 1. Total & categorized users from Neon
    const [{ totalUsers }] = await db.select({ totalUsers: count() }).from(users);
    
    // Demographics & verifications breakdown
    const userList = await db.select({
      id: users.id,
      city: users.city,
      gender: users.gender,
      phone: users.phone,
      kycStatus: users.kycStatus
    }).from(users);

    let basicProfileCount = 0;
    let phoneCount = 0;
    let kycCount = 0;
    let ibanCount = 0;

    userList.forEach(u => {
      if (u.city && u.gender && u.gender !== 'Belirtilmedi') basicProfileCount++;
      if (u.phone) phoneCount++;
      if (u.kycStatus === 'VERIFIED') kycCount++;
    });

    // 2. Active devices for push
    const [{ activePushUsers }] = await db.select({ activePushUsers: count() }).from(devices).where(eq(devices.isActive, true));

    // 3. Surveys and their response counts
    const surveyList = await db.select().from(surveys);
    const activeSurveys = surveyList.filter(s => s.status === 'ACTIVE');
    const activeProfileSurveys = surveyList.filter(s => s.status === 'ACTIVE' && (s.surveyType === 'PROFILE' || s.id.includes('profile')));

    // Get response count for each survey
    const responsesGrouped = await db
      .select({
        surveyId: surveyResponses.surveyId,
        count: count()
      })
      .from(surveyResponses)
      .groupBy(surveyResponses.surveyId);

    const responseMap = new Map<string, number>();
    let totalResponses = 0;
    responsesGrouped.forEach(r => {
      const c = Number(r.count);
      responseMap.set(r.surveyId, c);
      totalResponses += c;
    });

    const activeSurveysList = surveyList.map(s => ({
      surveyId: s.id,
      title: s.title,
      responseCount: responseMap.get(s.id) || 0,
      status: s.status,
      ownerType: s.ownerType,
      organizationId: s.organizationId
    })).sort((a, b) => b.responseCount - a.responseCount);

    return apiSuccess({
      activeSurveys: activeSurveys.length,
      activeProfileSurveys: activeProfileSurveys.length,
      totalUsers: Number(totalUsers) || 0,
      activePushUsers: Math.max(Number(activePushUsers) || 0, Number(totalUsers) || 0),
      totalResponses,
      basicProfileCompletedCount: basicProfileCount,
      phoneVerifiedCount: phoneCount,
      kycVerifiedCount: kycCount,
      ibanSubmittedCount: ibanCount,
      activeSurveysList
    });
  } catch (err: any) {
    console.error('Dashboard Metrics API Error:', err);
    return apiError('Dashboard metrikleri alınırken hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
  }
}
