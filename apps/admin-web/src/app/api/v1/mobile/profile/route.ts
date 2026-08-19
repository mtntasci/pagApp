import { NextRequest } from 'next/server';
import { authenticateRequest, apiUnauthorized, apiSuccess, apiError } from '@/lib/serverAuth';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth || !auth.user) {
    return apiUnauthorized();
  }

  const user = auth.user;
  return apiSuccess({
    id: user.id,
    firebaseUid: user.firebaseUid,
    displayName: user.displayName,
    phone: user.phone,
    email: user.email,
    gender: user.gender,
    city: user.city,
    district: user.district,
    birthDate: user.birthDate,
    age: user.age,
    maritalStatus: user.maritalStatus,
    childrenStatus: user.childrenStatus,
    hometown: user.hometown,
    education: user.education,
    occupation: user.occupation,
    kycStatus: user.kycStatus,
    profileScore: user.profileScore,
    rewardBalance: user.rewardBalance
  });
}

export async function PUT(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth || !auth.user) {
    return apiUnauthorized();
  }

  const user = auth.user;
  try {
    const body = await req.json();

    const updateData: any = {};
    if (body.displayName !== undefined) updateData.displayName = body.displayName;
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.district !== undefined) updateData.district = body.district;
    if (body.birthDate !== undefined) updateData.birthDate = body.birthDate;
    if (body.age !== undefined) updateData.age = Number(body.age) || 25;
    if (body.maritalStatus !== undefined) updateData.maritalStatus = body.maritalStatus;
    if (body.childrenStatus !== undefined) updateData.childrenStatus = body.childrenStatus;
    if (body.hometown !== undefined) updateData.hometown = body.hometown;
    if (body.education !== undefined) updateData.education = body.education;
    if (body.occupation !== undefined) updateData.occupation = body.occupation;
    updateData.updatedAt = new Date();

    const updated = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, user.id))
      .returning();

    return apiSuccess(updated[0], 'Profil bilgileri başarıyla güncellendi.');
  } catch (err: any) {
    console.error('Update Profile Error:', err);
    return apiError('Profil güncellenirken hata: ' + (err.message || 'Bilinmeyen hata'));
  }
}
