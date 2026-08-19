import { NextRequest } from 'next/server';
import { authenticateRequest, apiUnauthorized, apiSuccess, apiError } from '@/lib/serverAuth';
import { db, portalUsers, organizations } from '@/db';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return apiUnauthorized();
  }

  try {
    const list = await db
      .select({
        id: portalUsers.id,
        uid: portalUsers.firebaseUid,
        email: portalUsers.email,
        displayName: portalUsers.displayName,
        role: portalUsers.role,
        organizationId: portalUsers.organizationId,
        isActive: portalUsers.isActive,
        createdAt: portalUsers.createdAt,
        orgName: organizations.name
      })
      .from(portalUsers)
      .leftJoin(organizations, eq(portalUsers.organizationId, organizations.id))
      .orderBy(desc(portalUsers.createdAt))
      .limit(100);

    const formatted = list.map(u => ({
      uid: u.uid || u.id,
      email: u.email,
      displayName: u.displayName,
      role: u.role,
      organizationId: u.organizationId,
      status: u.isActive ? 'ACTIVE' : 'PASSIVE',
      createdAt: u.createdAt ? u.createdAt.toISOString() : null,
      organizationName: u.orgName || null
    }));

    return apiSuccess({ users: formatted });
  } catch (err: any) {
    console.error('List Portal Users Error:', err);
    return apiError('Kullanıcılar listelenirken hata: ' + (err.message || 'Bilinmeyen hata'));
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return apiUnauthorized();
  }

  try {
    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    const role = body.role || 'CALL_AGENT';
    const organizationId = body.organizationId || null;
    const displayName = body.displayName || (email ? email.split('@')[0] : 'Portal Kullanıcısı');
    const firebaseUid = body.uid || `puid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (!email) {
      return apiError('E-posta adresi zorunludur.');
    }

    const existing = await db.select().from(portalUsers).where(eq(portalUsers.email, email)).limit(1);

    if (existing.length > 0) {
      await db.update(portalUsers).set({
        role,
        organizationId,
        displayName,
        isActive: true
      }).where(eq(portalUsers.id, existing[0].id));
    } else {
      await db.insert(portalUsers).values({
        id: `pusr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        firebaseUid,
        email,
        displayName,
        role,
        organizationId,
        isActive: true
      });
    }

    return apiSuccess({ message: 'Portal kullanıcısı başarıyla kaydedildi.' });
  } catch (err: any) {
    console.error('Save Portal User Error:', err);
    return apiError('Kullanıcı kaydedilirken hata: ' + (err.message || 'Bilinmeyen hata'));
  }
}
