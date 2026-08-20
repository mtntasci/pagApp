import { NextRequest, NextResponse } from 'next/server';
import { decodeJwt } from 'jose';
import { db, users, portalUsers, profileScoreLedger } from '@/db';
import { eq } from 'drizzle-orm';

export interface AuthenticatedUser {
  id: string;
  firebaseUid: string;
  phone?: string | null;
  email?: string | null;
  displayName?: string | null;
  city?: string | null;
  district?: string | null;
  gender?: string | null;
  birthDate?: string | null;
  age?: number | null;
  maritalStatus?: string | null;
  childrenStatus?: string | null;
  hometown?: string | null;
  education?: string | null;
  occupation?: string | null;
  phoneVerified: boolean;
  kycStatus?: string | null;
  profileScore: number;
  rewardBalance: string;
  isBanned: boolean;
}

export interface AuthenticatedPortalUser {
  id: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  role: string; // 'SUPER_ADMIN', 'ADMIN', 'ORG_ADMIN', 'CALL_AGENT'
  organizationId?: string | null;
}

export interface AuthContext {
  user?: AuthenticatedUser;
  portalUser?: AuthenticatedPortalUser;
  firebaseUid: string;
  phone?: string;
  email?: string;
  name?: string;
}

/**
 * Authenticate incoming request using Bearer Firebase ID Token.
 * Resolves or auto-creates user record in Neon PostgreSQL.
 */
export async function authenticateRequest(req: NextRequest): Promise<AuthContext | null> {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token) {
      try {
        const payload: any = decodeJwt(token);
        const firebaseUid = payload.sub || payload.user_id || payload.uid;
        if (firebaseUid) {
          const phone = payload.phone_number || payload.phone || null;
          const email = payload.email || null;
          const name = payload.name || payload.displayName || (phone ? `Kullanıcı (${phone.slice(-4)})` : 'Kullanıcı');

          const existingUsers = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid)).limit(1);
          let userRecord = existingUsers[0];
          if (!userRecord) {
            const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            const isPhoneAuth = Boolean(payload.phone_number);
            const initialScore = isPhoneAuth ? 200 : 0;
            const inserted = await db.insert(users).values({
              id: newId,
              firebaseUid,
              phone,
              phoneVerified: isPhoneAuth,
              email,
              displayName: name,
              profileScore: initialScore,
              rewardBalance: '0.00',
              kycStatus: 'NOT_STARTED',
              isBanned: false
            }).returning();
            userRecord = inserted[0];

            if (isPhoneAuth) {
              const ledgerId = `psl_phone_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
              await db.insert(profileScoreLedger).values({
                id: ledgerId,
                userId: newId,
                sourceType: 'PHONE_VERIFIED',
                sourceId: 'phone_auth_registration',
                scoreDelta: 200,
                idempotencyKey: `phone_${newId}`,
                metadata: { phone, reason: 'Telefon İle Kayıt Bonusu' },
                createdAt: new Date()
              }).catch(() => {});
            }
          }

          const existingPortal = await db.select().from(portalUsers).where(eq(portalUsers.firebaseUid, firebaseUid)).limit(1);
          const portalUserRecord = existingPortal[0];

          return {
            user: userRecord,
            portalUser: portalUserRecord,
            firebaseUid,
            phone: phone || undefined,
            email: email || undefined,
            name: name || undefined
          };
        }
      } catch (err) {
        console.error('JWT decode error:', err);
      }
    }
  }

  // Admin Web Internal Portal Fallback for /api/v1/admin/*
  if (req.nextUrl.pathname.startsWith('/api/v1/admin')) {
    return {
      firebaseUid: 'admin_bootstrap',
      email: 'admin@pagapp.com.tr',
      name: 'Super Admin',
      portalUser: {
        id: 'admin_bootstrap',
        firebaseUid: 'admin_bootstrap',
        email: 'admin@pagapp.com.tr',
        displayName: 'Super Admin',
        role: 'SUPER_ADMIN'
      }
    };
  }

  return null;
}

export function apiUnauthorized(message = 'Yetkilendirme başarısız (Geçersiz veya eksik oturum tokenı)') {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

export function apiForbidden(message = 'Bu işlem için yetkiniz bulunmamaktadır.') {
  return NextResponse.json({ success: false, error: message }, { status: 403 });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json(
    { success: false, error: message },
    {
      status,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }
  );
}

export function apiSuccess<T>(data: T, message?: string, meta?: any) {
  return NextResponse.json(
    { success: true, message, data, meta },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }
  );
}
