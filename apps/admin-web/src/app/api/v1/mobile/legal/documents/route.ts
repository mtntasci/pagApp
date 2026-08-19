import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

const ACTIVE_DOCUMENTS = [
  {
    documentId: 'TERMS',
    type: 'TERMS',
    version: '1.0',
    title: 'Kullanım Koşulları ve Üyelik Sözleşmesi',
    url: 'https://www.pagapp.com.tr/terms',
    contentHash: 'PAG_TERMS_V1.0',
    isRequired: true,
    isActive: true,
    requiresReacceptance: false
  },
  {
    documentId: 'KVKK_NOTICE',
    type: 'KVKK_NOTICE',
    version: '1.0',
    title: 'Kullanıcı Gizliliği ve KVKK Aydınlatma Metni',
    url: 'https://www.pagapp.com.tr/user-privacy',
    contentHash: 'PAG_KVKK_NOTICE_V1.0',
    isRequired: true,
    isActive: true,
    requiresReacceptance: false
  },
  {
    documentId: 'REWARD_TERMS',
    type: 'REWARD_TERMS',
    version: '1.0',
    title: 'Ödül ve Kampanya Katılım Koşulları',
    url: 'https://www.pagapp.com.tr/reward-terms',
    contentHash: 'PAG_REWARD_TERMS_V1.0',
    isRequired: true,
    isActive: true,
    requiresReacceptance: false
  }
];

export async function GET(req: NextRequest) {
  return apiSuccess(ACTIVE_DOCUMENTS);
}
