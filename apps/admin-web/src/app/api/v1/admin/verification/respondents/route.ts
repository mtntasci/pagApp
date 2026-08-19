import { NextRequest } from 'next/server';
import { authenticateRequest, apiUnauthorized, apiSuccess, apiError } from '@/lib/serverAuth';
import { db, surveys, surveyResponses, users } from '@/db';
import { eq, and, gte, lte, ilike, desc, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return apiUnauthorized();
  }

  const { searchParams } = new URL(req.url);
  const surveyId = searchParams.get('surveyId');
  const city = searchParams.get('city');
  const gender = searchParams.get('gender');
  const minAge = searchParams.get('minAge') ? parseInt(searchParams.get('minAge')!, 10) : undefined;
  const maxAge = searchParams.get('maxAge') ? parseInt(searchParams.get('maxAge')!, 10) : undefined;
  const search = searchParams.get('search')?.trim();

  if (!surveyId) {
    return apiError('surveyId parametresi gereklidir.');
  }

  try {
    // 1. Fetch survey metadata
    const surveyRows = await db.select().from(surveys).where(eq(surveys.id, surveyId)).limit(1);
    const survey = surveyRows[0];
    if (!survey) {
      return apiError('Anket bulunamadı.', 404);
    }

    const vConfig = (survey.verificationConfig as any) || {};
    const pagTargetCount = survey.verificationTargetCount || vConfig.pagTargetCount || 50;
    const orgSelectionQuota = survey.verificationOrgQuota || vConfig.orgSelectionQuota || 20;
    const verificationRewardSummary = vConfig.rewardDefinition?.voucherPoolName || vConfig.verificationRewardSummary || '250 TL Hediye Çeki';

    // 2. Perform fast relational join query
    const conditions: any[] = [eq(surveyResponses.surveyId, surveyId)];

    if (city && city !== 'ALL') {
      conditions.push(ilike(users.city, `%${city}%`));
    }
    if (gender && gender !== 'ALL') {
      const gTerm = gender === 'MALE' ? 'Erkek' : (gender === 'FEMALE' ? 'Kadın' : gender);
      conditions.push(eq(users.gender, gTerm));
    }
    if (minAge !== undefined && !isNaN(minAge)) {
      conditions.push(gte(users.age, minAge));
    }
    if (maxAge !== undefined && !isNaN(maxAge)) {
      conditions.push(lte(users.age, maxAge));
    }
    if (search) {
      conditions.push(
        sql`(${users.displayName} ILIKE ${`%${search}%`} OR ${users.id} ILIKE ${`%${search}%`})`
      );
    }

    const results = await db
      .select({
        userId: users.id,
        userDisplayName: users.displayName,
        phone: users.phone,
        city: users.city,
        gender: users.gender,
        age: users.age,
        completedAt: surveyResponses.completedAt
      })
      .from(surveyResponses)
      .innerJoin(users, eq(surveyResponses.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(surveyResponses.completedAt))
      .limit(500);

    // 3. Mask personal sensitive data
    const maskedRespondents = results.map(r => {
      const rawName = r.userDisplayName || 'Katılımcı';
      const parts = rawName.split(' ');
      const maskedName = parts.map((p, idx) => {
        if (p.length <= 1) return p;
        if (idx === 0) return p.charAt(0) + '*'.repeat(Math.min(p.length - 1, 4));
        return p.charAt(0) + '.***';
      }).join(' ');

      const rawPhone = r.phone || '05300000000';
      const maskedPhone = rawPhone.length >= 10
        ? `${rawPhone.slice(0, 4)} *** ** ${rawPhone.slice(-2)}`
        : '053x xxx xx 00';

      return {
        userId: r.userId,
        anonymousRef: `KAT-${r.userId.slice(-6).toUpperCase()}`,
        userDisplayName: maskedName,
        maskedPhone,
        city: r.city || 'İstanbul',
        gender: r.gender || 'Belirtilmedi',
        age: r.age || 25,
        completedAt: r.completedAt ? r.completedAt.toISOString() : null
      };
    });

    return apiSuccess({
      surveyId,
      surveyTitle: survey.title,
      pagTargetCount,
      orgSelectionQuota,
      verificationRewardSummary,
      totalFound: maskedRespondents.length,
      respondents: maskedRespondents
    });
  } catch (err: any) {
    console.error('Fetch Verification Respondents Error:', err);
    return apiError('Katılımcı listesi alınırken hata: ' + (err.message || 'Bilinmeyen hata'));
  }
}
