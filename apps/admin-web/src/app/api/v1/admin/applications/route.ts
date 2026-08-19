import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

let applicationsList: any[] = [];

export async function GET(req: NextRequest) {
  return apiSuccess({ applications: applicationsList });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.applicationId && body.status) {
      const idx = applicationsList.findIndex(a => a.applicationId === body.applicationId);
      if (idx >= 0) {
        applicationsList[idx].status = body.status;
      }
    } else if (body.companyName) {
      applicationsList.push({
        applicationId: `app_${Date.now()}`,
        ...body,
        status: body.status || 'PENDING',
        createdAt: new Date().toISOString()
      });
    }
    return apiSuccess({ success: true, applications: applicationsList });
  } catch (err: any) {
    return apiError('Başvuru işlem hatası: ' + (err.message || 'Bilinmeyen hata'));
  }
}
