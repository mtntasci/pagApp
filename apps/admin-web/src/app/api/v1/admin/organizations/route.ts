import { NextRequest } from 'next/server';
import { authenticateRequest, apiUnauthorized, apiSuccess, apiError } from '@/lib/serverAuth';
import { db, organizations, portalUsers, surveys } from '@/db';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return apiUnauthorized();
  }

  try {
    const [list, usersList, surveyList] = await Promise.all([
      db.select().from(organizations).orderBy(desc(organizations.createdAt)).limit(100),
      db.select({ organizationId: portalUsers.organizationId }).from(portalUsers),
      db.select({ organizationId: surveys.organizationId }).from(surveys)
    ]);

    const formatted = list.map(o => ({
      organizationId: o.id,
      id: o.id,
      name: o.name,
      slug: o.slug,
      logoUrl: o.logoUrl,
      description: o.description,
      isActive: o.isActive,
      portalUserCount: usersList.filter(u => u.organizationId === o.id).length,
      surveyCount: surveyList.filter(s => s.organizationId === o.id).length,
      createdAt: o.createdAt.toISOString()
    }));

    return apiSuccess({ organizations: formatted });
  } catch (err: any) {
    console.error('List Organizations Error:', err);
    return apiError('Kurumlar listelenirken hata: ' + (err.message || 'Bilinmeyen hata'));
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return apiUnauthorized();
  }

  try {
    const body = await req.json();
    const name = String(body.name || '').trim();
    const slug = String(body.slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-')).trim();
    const logoUrl = body.logoUrl || null;
    const description = body.description || null;
    const orgId = body.organizationId || body.id || `org_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (!name) {
      return apiError('Kurum adı zorunludur.');
    }

    const existing = await db.select().from(organizations).where(eq(organizations.id, orgId)).limit(1);

    if (existing.length > 0) {
      await db.update(organizations).set({
        name,
        slug,
        logoUrl,
        description,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true
      }).where(eq(organizations.id, orgId));
    } else {
      await db.insert(organizations).values({
        id: orgId,
        name,
        slug,
        logoUrl,
        description,
        isActive: true
      });
    }

    return apiSuccess({ organizationId: orgId, message: 'Kurum başarıyla kaydedildi.' });
  } catch (err: any) {
    console.error('Save Organization Error:', err);
    return apiError('Kurum kaydedilirken hata: ' + (err.message || 'Bilinmeyen hata'));
  }
}
