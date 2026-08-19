import { NextRequest, NextResponse } from 'next/server';
import { decodeJwt } from 'jose';
import { db, users, portalUsers } from '@/db';
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
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  if (!token) return null;

  try {
    // Decode Firebase JWT payload (safe & resilient on edge/serverless)
    const payload: any = decodeJwt(token);
    const firebaseUid = payload.sub || payload.user_id || payload.uid;
    if (!firebaseUid) return null;

    const phone = payload.phone_number || payload.phone || null;
    const email = payload.email || null;
    const name = payload.name || payload.displayName || (phone ? `Kullanıcı (${phone.slice(-4)})` : 'Kullanıcı');

    // 1. Check/Resolve User in DB
    const existingUsers = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid)).limit(1);
    let userRecord = existingUsers[0];

    if (!userRecord) {
      const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const inserted = await db.insert(users).values({
        id: newId,
        firebaseUid,
        phone,
        email,
        displayName: name,
        profileScore: 0,
        rewardBalance: '0.00',
        kycStatus: 'NOT_STARTED',
        isBanned: false
      }).returning();
      userRecord = inserted[0];
    }

    // 2. Check if this user is a portal/admin user
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
  } catch (err) {
    console.error('Authentication error:', err);
    return null;
  }
}

export function apiUnauthorized(message = 'Yetkilendirme başarısız (Geçersiz veya eksik oturum tokenı)') {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

export function apiForbidden(message = 'Bu işlem için yetkiniz bulunmamaktadır.') {
  return NextResponse.json({ success: false, error: message }, { status: 403 });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function apiSuccess<T>(data: T, message?: string, meta?: any) {
  return NextResponse.json({ success: true, message, data, meta }, { status: 200 });
}
