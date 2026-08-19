import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

const DEFAULT_CATEGORIES = [
  { id: 'cat_genel', name: 'Genel', isVisible: true, sortOrder: 1 },
  { id: 'cat_yasam', name: 'Yaşam', isVisible: true, sortOrder: 2 },
  { id: 'cat_alisveris', name: 'Alışveriş & Tüketim', isVisible: true, sortOrder: 3 },
  { id: 'cat_yeme_icme', name: 'Yeme & İçme', isVisible: true, sortOrder: 4 },
  { id: 'cat_teknoloji', name: 'Teknoloji', isVisible: true, sortOrder: 5 },
  { id: 'cat_otomotiv', name: 'Otomotiv & Ulaşım', isVisible: true, sortOrder: 6 },
  { id: 'cat_spor', name: 'Spor & Sağlıklı Yaşam', isVisible: true, sortOrder: 7 },
  { id: 'cat_seyahat', name: 'Seyahat & Eğlence', isVisible: true, sortOrder: 8 },
  { id: 'cat_finans', name: 'Finans', isVisible: true, sortOrder: 9 }
];

let currentCategories = [...DEFAULT_CATEGORIES];

export async function GET(req: NextRequest) {
  return apiSuccess({ categories: currentCategories });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (Array.isArray(body.categories)) {
      currentCategories = body.categories;
    }
    return apiSuccess({ categories: currentCategories, message: 'Kategoriler güncellendi.' });
  } catch (err: any) {
    return apiError('Kategoriler kaydedilirken hata: ' + (err.message || 'Bilinmeyen hata'));
  }
}
