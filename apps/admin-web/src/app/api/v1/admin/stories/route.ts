import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/serverAuth';
import { db, surveys } from '@/db';
import { eq, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const allSurveys = await db.select().from(surveys);
    const storyList = allSurveys
      .filter(s => {
        const sc = s.storyConfig as any;
        return sc && sc.showInStory;
      })
      .map(s => {
        const sc = s.storyConfig as any;
        return {
          id: s.id,
          storyId: s.id,
          surveyId: s.id,
          title: sc.label || s.title,
          shortLabel: sc.label || s.title,
          imageCategory: sc.imageCategory || s.category || 'Genel',
          imageUrl: sc.imageUrl || null,
          position: sc.position || 1,
          isActive: sc.isActive !== false,
          surveyTitle: s.title
        };
      });

    return apiSuccess({ stories: storyList });
  } catch (err: any) {
    console.error('List Admin Stories Error:', err);
    return apiError('Story listesi alınırken hata: ' + (err.message || 'Bilinmeyen hata'));
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const surveyId = body.surveyId;
    if (!surveyId) {
      return apiError('Survey ID zorunludur.');
    }

    const storyConfig = {
      showInStory: true,
      label: body.shortLabel || body.title || 'Anket',
      imageCategory: body.imageCategory || 'Genel',
      imageUrl: body.imageUrl || null,
      position: Number(body.position) || 1,
      isActive: body.isActive !== false
    };

    await db.update(surveys).set({
      storyConfig
    }).where(eq(surveys.id, surveyId));

    return apiSuccess({ success: true, message: 'Story başarıyla kaydedildi.' });
  } catch (err: any) {
    console.error('Save Admin Story Error:', err);
    return apiError('Story kaydedilirken hata: ' + (err.message || 'Bilinmeyen hata'));
  }
}
