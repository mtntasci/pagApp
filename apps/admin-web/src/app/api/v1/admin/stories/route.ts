import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/serverAuth';
import { db, surveys } from '@/db';
import { eq, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const allSurveys = await db.select().from(surveys);
    
    // Stories that have storyConfig and showInStory/isStory enabled
    const storyList = allSurveys
      .filter(s => {
        const sc = s.storyConfig as any;
        return sc && (sc.showInStory !== false || sc.isStory);
      })
      .map(s => {
        const sc = (s.storyConfig as any) || {};
        const pos = Number(sc.position !== undefined ? sc.position : (sc.sortOrder !== undefined ? sc.sortOrder : 999)) || 999;
        return {
          id: s.id,
          storyId: s.id,
          surveyId: s.id,
          title: sc.label || sc.shortLabel || sc.storyLabel || s.title,
          label: sc.label || sc.shortLabel || sc.storyLabel || s.title,
          shortLabel: sc.label || sc.shortLabel || sc.storyLabel || s.title,
          storyLabel: sc.storyLabel || sc.label || sc.shortLabel || s.title,
          imageCategory: sc.imageCategory || sc.category || s.category || 'Genel',
          imageUrl: sc.imageUrl || null,
          position: pos,
          sortOrder: pos,
          isActive: sc.isActive !== false,
          surveyTitle: s.title,
          status: s.status,
          startAt: s.startAt,
          endAt: s.endAt
        };
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);

    // Also return list of available surveys for dropdown
    const availableSurveys = allSurveys.map(s => ({
      id: s.id,
      title: s.title,
      category: s.category || 'Genel',
      status: s.status,
      hasStory: Boolean(s.storyConfig && ((s.storyConfig as any).showInStory || (s.storyConfig as any).isStory))
    }));

    return apiSuccess({ stories: storyList, availableSurveys });
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

    const resolvedLabel = body.shortLabel || body.label || body.storyLabel || body.title || 'Anket';
    const resolvedPos = Number(body.sortOrder !== undefined ? body.sortOrder : (body.position !== undefined ? body.position : 999)) || 999;
    const resolvedActive = body.isActive !== false;

    const existingSurvey = await db.select().from(surveys).where(eq(surveys.id, surveyId)).limit(1);
    if (existingSurvey.length === 0) {
      return apiError('Belirtilen ID ile anket bulunamadı: ' + surveyId);
    }

    const prevConfig = (existingSurvey[0].storyConfig as any) || {};

    const storyConfig = {
      showInStory: resolvedActive,
      label: resolvedLabel,
      shortLabel: resolvedLabel,
      storyLabel: resolvedLabel,
      imageCategory: body.imageCategory || prevConfig.imageCategory || 'Genel',
      imageUrl: body.imageUrl !== undefined ? (body.imageUrl || null) : (prevConfig.imageUrl || null),
      position: resolvedPos,
      sortOrder: resolvedPos,
      isActive: resolvedActive
    };

    await db.update(surveys).set({
      storyConfig
    }).where(eq(surveys.id, surveyId));

    return apiSuccess({ success: true, message: 'Story başarıyla kaydedildi.', storyConfig });
  } catch (err: any) {
    console.error('Save Admin Story Error:', err);
    return apiError('Story kaydedilirken hata: ' + (err.message || 'Bilinmeyen hata'));
  }
}
