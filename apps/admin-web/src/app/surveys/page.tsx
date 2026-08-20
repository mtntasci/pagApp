'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

function removeUndefinedFields<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(item => removeUndefinedFields(item)) as unknown as T;
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      const val = (obj as any)[key];
      if (val !== undefined) {
        cleaned[key] = removeUndefinedFields(val);
      }
    }
    return cleaned as T;
  }
  return obj;
}

const STORY_CATEGORY_IMAGES: Record<string, { id: string; name: string; images: { id: string; label: string; file: string; color: string }[] }> = {
  'Yaşam': {
    id: 'lifestyle',
    name: 'Yaşam',
    images: [
      { id: 'story_lifestyle_1', label: 'Resim 1 (Şehir Yaşamı)', file: '/story_lifestyle_1.jpg', color: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' },
      { id: 'story_lifestyle_2', label: 'Resim 2 (Sosyal Yaşam)', file: '/story_lifestyle_2.jpg', color: 'linear-gradient(135deg, #60A5FA, #2563EB)' },
      { id: 'story_lifestyle_3', label: 'Resim 3 (Açık Hava & Doğa)', file: '/story_lifestyle_3.jpg', color: 'linear-gradient(135deg, #93C5FD, #1E40AF)' },
      { id: 'story_lifestyle_4', label: 'Resim 4 (Kişisel Gelişim)', file: '/story_lifestyle_4.jpg', color: 'linear-gradient(135deg, #BFDBFE, #1E3A8A)' },
    ]
  },
  'Alışveriş & Tüketim': {
    id: 'shopping',
    name: 'Alışveriş & Tüketim',
    images: [
      { id: 'story_shopping_1', label: 'Resim 1 (E-Ticaret & İndirim)', file: '/story_shopping_1.jpg', color: 'linear-gradient(135deg, #EC4899, #BE185D)' },
      { id: 'story_shopping_2', label: 'Resim 2 (Giyim & Moda)', file: '/story_shopping_2.jpg', color: 'linear-gradient(135deg, #F472B6, #9D174D)' },
      { id: 'story_shopping_3', label: 'Resim 3 (Süpermarket)', file: '/story_shopping_3.jpg', color: 'linear-gradient(135deg, #FBCFE8, #831843)' },
      { id: 'story_shopping_4', label: 'Resim 4 (Kupon & Fırsat)', file: '/story_shopping_4.jpg', color: 'linear-gradient(135deg, #FCE7F3, #500724)' },
    ]
  },
  'Yeme & İçme': {
    id: 'food_beverage',
    name: 'Yeme & İçme',
    images: [
      { id: 'story_food_beverage_1', label: 'Resim 1 (Kahve & Kafe)', file: '/story_food_beverage_1.jpg', color: 'linear-gradient(135deg, #F59E0B, #B45309)' },
      { id: 'story_food_beverage_2', label: 'Resim 2 (Restoran & Fast Food)', file: '/story_food_beverage_2.jpg', color: 'linear-gradient(135deg, #FBBF24, #92400E)' },
      { id: 'story_food_beverage_3', label: 'Resim 3 (Organik & Gurme)', file: '/story_food_beverage_3.jpg', color: 'linear-gradient(135deg, #FDE68A, #78350F)' },
      { id: 'story_food_beverage_4', label: 'Resim 4 (İçecekler & Tatlılar)', file: '/story_food_beverage_4.jpg', color: 'linear-gradient(135deg, #FEF3C7, #451A03)' },
    ]
  },
  'Teknoloji': {
    id: 'technology',
    name: 'Teknoloji',
    images: [
      { id: 'story_technology_1', label: 'Resim 1 (Dijital Trendler)', file: '/story_technology_1.jpg', color: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' },
      { id: 'story_technology_2', label: 'Resim 2 (Yazılım & Yapay Zeka)', file: '/story_technology_2.jpg', color: 'linear-gradient(135deg, #A78BFA, #5B21B6)' },
      { id: 'story_technology_3', label: 'Resim 3 (Mobil & Donanım)', file: '/story_technology_3.jpg', color: 'linear-gradient(135deg, #C4B5FD, #4C1D95)' },
      { id: 'story_technology_4', label: 'Resim 4 (Geleceğin Teknolojisi)', file: '/story_technology_4.jpg', color: 'linear-gradient(135deg, #DDD6FE, #3B0764)' },
    ]
  },
  'Otomotiv & Ulaşım': {
    id: 'automotive',
    name: 'Otomotiv & Ulaşım',
    images: [
      { id: 'story_automotive_1', label: 'Resim 1 (Elektrikli Araçlar)', file: '/story_automotive_1.jpg', color: 'linear-gradient(135deg, #EF4444, #B91C1C)' },
      { id: 'story_automotive_2', label: 'Resim 2 (Konsept Otomobil)', file: '/story_automotive_2.jpg', color: 'linear-gradient(135deg, #F87171, #991B1B)' },
      { id: 'story_automotive_3', label: 'Resim 3 (Sürüş Teknoloji)', file: '/story_automotive_3.jpg', color: 'linear-gradient(135deg, #FCA5A5, #7F1D1D)' },
      { id: 'story_automotive_4', label: 'Resim 4 (Araç Bakım & Servis)', file: '/story_automotive_4.jpg', color: 'linear-gradient(135deg, #FECACA, #450A0A)' },
    ]
  },
  'Spor & Sağlıklı Yaşam': {
    id: 'sports',
    name: 'Spor & Sağlıklı Yaşam',
    images: [
      { id: 'story_sports_1', label: 'Resim 1 (Futbol & Takım)', file: '/story_sports_1.jpg', color: 'linear-gradient(135deg, #059669, #047857)' },
      { id: 'story_sports_2', label: 'Resim 2 (Fitness & Salon)', file: '/story_sports_2.jpg', color: 'linear-gradient(135deg, #10B981, #065F46)' },
      { id: 'story_sports_3', label: 'Resim 3 (Beslenme & Fit)', file: '/story_sports_3.jpg', color: 'linear-gradient(135deg, #34D399, #064E3B)' },
      { id: 'story_sports_4', label: 'Resim 4 (Extreme & Açık Hava)', file: '/story_sports_4.jpg', color: 'linear-gradient(135deg, #6EE7B7, #022C22)' },
    ]
  },
  'Seyahat & Eğlence': {
    id: 'travel',
    name: 'Seyahat & Eğlence',
    images: [
      { id: 'story_travel_1', label: 'Resim 1 (Tatil & Otel)', file: '/story_travel_1.jpg', color: 'linear-gradient(135deg, #0284C7, #0369A1)' },
      { id: 'story_travel_2', label: 'Resim 2 (Uçak & Bilet)', file: '/story_travel_2.jpg', color: 'linear-gradient(135deg, #0EA5E9, #075985)' },
      { id: 'story_travel_3', label: 'Resim 3 (Sinema & Müzik)', file: '/story_travel_3.jpg', color: 'linear-gradient(135deg, #38BDF8, #0C4A6E)' },
      { id: 'story_travel_4', label: 'Resim 4 (Kültür & Şehir)', file: '/story_travel_4.jpg', color: 'linear-gradient(135deg, #7DD3FC, #082F49)' },
    ]
  },
  'Finans': {
    id: 'finance',
    name: 'Finans',
    images: [
      { id: 'story_finance_1', label: 'Resim 1 (Yatırım & Borsa)', file: '/story_finance_1.jpg', color: 'linear-gradient(135deg, #10B981, #047857)' },
      { id: 'story_finance_2', label: 'Resim 2 (Dijital Bankacılık)', file: '/story_finance_2.jpg', color: 'linear-gradient(135deg, #34D399, #065F46)' },
      { id: 'story_finance_3', label: 'Resim 3 (Kredi & Kartlar)', file: '/story_finance_3.jpg', color: 'linear-gradient(135deg, #6EE7B7, #064E3B)' },
      { id: 'story_finance_4', label: 'Resim 4 (Tasarruf & Bütçe)', file: '/story_finance_4.jpg', color: 'linear-gradient(135deg, #A7F3D0, #022C22)' },
    ]
  },
  'Ev & Yaşam': {
    id: 'home_living',
    name: 'Ev & Yaşam',
    images: [
      { id: 'story_home_living_1', label: 'Resim 1 (Mobilya & Dekor)', file: '/story_home_living_1.jpg', color: 'linear-gradient(135deg, #D97706, #B45309)' },
      { id: 'story_home_living_2', label: 'Resim 2 (Ev Aletleri & Mutfak)', file: '/story_home_living_2.jpg', color: 'linear-gradient(135deg, #F59E0B, #92400E)' },
      { id: 'story_home_living_3', label: 'Resim 3 (Bahçe & Yapı Market)', file: '/story_home_living_3.jpg', color: 'linear-gradient(135deg, #FBBF24, #78350F)' },
      { id: 'story_home_living_4', label: 'Resim 4 (Ev Tekstili)', file: '/story_home_living_4.jpg', color: 'linear-gradient(135deg, #FDE68A, #451A03)' },
    ]
  },
  'Moda & Kişisel Bakım': {
    id: 'fashion',
    name: 'Moda & Kişisel Bakım',
    images: [
      { id: 'story_fashion_1', label: 'Resim 1 (Trend Giyim)', file: '/story_fashion_1.jpg', color: 'linear-gradient(135deg, #F472B6, #BE185D)' },
      { id: 'story_fashion_2', label: 'Resim 2 (Kozmetik & Parfüm)', file: '/story_fashion_2.jpg', color: 'linear-gradient(135deg, #FB7185, #E11D48)' },
      { id: 'story_fashion_3', label: 'Resim 3 (Aksesuar & Takı)', file: '/story_fashion_3.jpg', color: 'linear-gradient(135deg, #FDA4AF, #9F1239)' },
      { id: 'story_fashion_4', label: 'Resim 4 (Saç & Cilt Bakımı)', file: '/story_fashion_4.jpg', color: 'linear-gradient(135deg, #FECDD3, #881337)' },
    ]
  },
  'Medya & Dijital İçerik': {
    id: 'media',
    name: 'Medya & Dijital İçerik',
    images: [
      { id: 'story_media_1', label: 'Resim 1 (Dijital Yayıncılık)', file: '/story_media_1.jpg', color: 'linear-gradient(135deg, #6366F1, #4338CA)' },
      { id: 'story_media_2', label: 'Resim 2 (Sosyal Medya)', file: '/story_media_2.jpg', color: 'linear-gradient(135deg, #818CF8, #3730A3)' },
      { id: 'story_media_3', label: 'Resim 3 (Podcast & İçerik)', file: '/story_media_3.jpg', color: 'linear-gradient(135deg, #A5B4FC, #312E81)' },
      { id: 'story_media_4', label: 'Resim 4 (Haber & Dergi)', file: '/story_media_4.jpg', color: 'linear-gradient(135deg, #C7D2FE, #1E1B4B)' },
    ]
  },
  'Eğitim & Kariyer': {
    id: 'education',
    name: 'Eğitim & Kariyer',
    images: [
      { id: 'story_education_1', label: 'Resim 1 (Online Akademi)', file: '/story_education_1.jpg', color: 'linear-gradient(135deg, #7C3AED, #5B21B6)' },
      { id: 'story_education_2', label: 'Resim 2 (Kariyer & İş)', file: '/story_education_2.jpg', color: 'linear-gradient(135deg, #8B5CF6, #4C1D95)' },
      { id: 'story_education_3', label: 'Resim 3 (Sertifika Programı)', file: '/story_education_3.jpg', color: 'linear-gradient(135deg, #A78BFA, #3B0764)' },
      { id: 'story_education_4', label: 'Resim 4 (Yabancı Dil)', file: '/story_education_4.jpg', color: 'linear-gradient(135deg, #C4B5FD, #2E1065)' },
    ]
  },
  'Genel': {
    id: 'general',
    name: 'Genel',
    images: [
      { id: 'story_general_1', label: 'Resim 1 (Genel Kampanya)', file: '/story_general_1.jpg', color: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' },
      { id: 'story_general_2', label: 'Resim 2 (Genel Duyuru)', file: '/story_general_2.jpg', color: 'linear-gradient(135deg, #60A5FA, #2563EB)' },
      { id: 'story_general_3', label: 'Resim 3 (Genel Anket)', file: '/story_general_3.jpg', color: 'linear-gradient(135deg, #93C5FD, #1E40AF)' },
      { id: 'story_general_4', label: 'Resim 4 (Genel İnceleme)', file: '/story_general_4.jpg', color: 'linear-gradient(135deg, #BFDBFE, #1E3A8A)' },
    ]
  }
};

function toDatetimeLocalString(dateInput: any): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function SurveysPage() {
  const { portalUser, isAdmin } = useAuth();
  const isSuperAdmin = portalUser?.role === 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'PENDING_APPROVAL' | 'DRAFT' | 'SCHEDULED' | 'ENDED' | 'ARCHIVED'>('ACTIVE');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSurveyId, setEditingSurveyId] = useState<string | null>(null);
  const [editingSurveyOriginalStatus, setEditingSurveyOriginalStatus] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<'idle' | 'saved' | 'sent_approval'>('idle');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState(30);

  const [surveys, setSurveys] = useState<any[]>([]);
  const [registeredOrganizations, setRegisteredOrganizations] = useState<{ organizationId: string; name: string }[]>([]);

  // Wizard Form State
  const [formOwnerType, setFormOwnerType] = useState<'PAG' | 'ORGANIZATION'>('PAG');
  const [formOrgId, setFormOrgId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSurveyType, setFormSurveyType] = useState<'PAG' | 'ORGANIZATION' | 'PROFILE'>('PAG');
  const [formCategory, setFormCategory] = useState('Genel');
  const [formTargeting, setFormTargeting] = useState<'ALL' | 'PROFILE' | 'LOCATION'>('ALL');
  const [formProfileMinAge, setFormProfileMinAge] = useState<string>('');
  const [formProfileMaxAge, setFormProfileMaxAge] = useState<string>('');
  const [formProfileMaritalStatus, setFormProfileMaritalStatus] = useState<string>('ALL');
  const [formProfileChildrenStatus, setFormProfileChildrenStatus] = useState<string>('ALL');
  const [formProfileHometown, setFormProfileHometown] = useState<string>('');
  const [formScoreReward, setFormScoreReward] = useState(50);
  const [formFinancialReward, setFormFinancialReward] = useState<'NONE' | 'MONEY' | 'VOUCHER'>('NONE');
  const [formMoneyModel, setFormMoneyModel] = useState<'RANKED' | 'EQUAL'>('RANKED');
  const [formMoneyBudget, setFormMoneyBudget] = useState(1000);
  const [formRank1, setFormRank1] = useState(300);
  const [formRank2, setFormRank2] = useState(200);
  const [formRank3, setFormRank3] = useState(100);
  const [formVoucherName, setFormVoucherName] = useState('');
  const [formVoucherCodesText, setFormVoucherCodesText] = useState('');
  const [formShowStory, setFormShowStory] = useState(false);
  const [formStoryLabel, setFormStoryLabel] = useState('');
  const [formStoryImageCategory, setFormStoryImageCategory] = useState('Genel');
  const [formStoryImageUrl, setFormStoryImageUrl] = useState('');
  const [formStoryPosition, setFormStoryPosition] = useState<number>(999);
  const [formQuestions, setFormQuestions] = useState([
    { id: 'q1', text: '1. Soru Metni', options: ['Seçenek 1', 'Seçenek 2'] }
  ]);
  const [formVerificationEnabled, setFormVerificationEnabled] = useState(false);
  const [formVerificationQuestion, setFormVerificationQuestion] = useState('Geçtiğimiz günlerde katıldığınız anket deneyiminizi nasıl değerlendirirsiniz?');
  const [formVerificationOptionsText, setFormVerificationOptionsText] = useState('Çok Olumlu, Olumlu, Nötr, Olumsuz');
  const [formPagTargetCount, setFormPagTargetCount] = useState(50);
  const [formOrgSelectionQuota, setFormOrgSelectionQuota] = useState(20);
  const [formVerificationScoreReward, setFormVerificationScoreReward] = useState(25);
  const [formVerificationRewardType, setFormVerificationRewardType] = useState<'NONE' | 'MONEY' | 'VOUCHER'>('VOUCHER');
  const [formVerificationMoneyBudget, setFormVerificationMoneyBudget] = useState(500);
  const [formVerificationMoneyPerUser, setFormVerificationMoneyPerUser] = useState(50);
  const [formVerificationVoucherName, setFormVerificationVoucherName] = useState('250 TL Kalite Doğrulama Hediye Çeki');
  const [formVerificationVoucherAmount, setFormVerificationVoucherAmount] = useState(250);
  const [formVerificationVoucherCodesText, setFormVerificationVoucherCodesText] = useState('');
  const [formStartAt, setFormStartAt] = useState(() => toDatetimeLocalString(new Date()));
  const [formEndAt, setFormEndAt] = useState(() => toDatetimeLocalString(new Date(Date.now() + 30 * 24 * 3600 * 1000)));
  const [formIsHighlighted, setFormIsHighlighted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [jsonInputText, setJsonInputText] = useState('');
  const [jsonImportError, setJsonImportError] = useState<string | null>(null);
  const [isJsonImporting, setIsJsonImporting] = useState(false);

  const sampleSurveyJson = JSON.stringify({
    "surveyId": "srv_kahve_tercihleri_2026",
    "title": "Kahve Tüketim Alışkanlıkları Araştırması",
    "description": "Günlük kahve içme tercihlerinizi paylaşın, Profile Score ve ödül kazanın.",
    "ownerType": "PAG",
    "surveyType": "PAG",
    "category": "FOR_YOU",
    "status": "DRAFT",
    "profileScoreReward": 100,
    "startAt": "2026-08-15T09:00:00.000Z",
    "endAt": "2026-08-25T23:59:59.000Z",
    "targeting": {
      "type": "ALL"
    },
    "rewardDefinition": {
      "rewardType": "MONEY",
      "totalBudget": 1000,
      "currency": "TRY",
      "distributionModel": "RANKED",
      "rankedRules": [
        { "rankRangeStart": 1, "rankRangeEnd": 1, "amount": 300 },
        { "rankRangeStart": 2, "rankRangeEnd": 2, "amount": 200 },
        { "rankRangeStart": 3, "rankRangeEnd": 3, "amount": 100 }
      ]
    },
    "questions": [
      {
        "id": "q1",
        "questionText": "Günde ortalama kaç fincan kahve tüketiyorsunuz?",
        "order": 1,
        "options": [
          { "optionId": "o1", "label": "Tüketmiyorum / Nadiren", "order": 1 },
          { "optionId": "o2", "label": "1 - 2 Fincan", "order": 2 },
          { "optionId": "o3", "label": "3 - 4 Fincan", "order": 3 }
        ]
      },
      {
        "id": "q2",
        "questionText": "En çok tercih ettiğiniz kahve türü hangisidir?",
        "order": 2,
        "options": [
          { "optionId": "o1", "label": "Türk Kahvesi", "order": 1 },
          { "optionId": "o2", "label": "Filtre Kahve", "order": 2 },
          { "optionId": "o3", "label": "Espresso / Americano", "order": 3 }
        ]
      }
    ]
  }, null, 2);

  const sampleMultiSurveyJson = JSON.stringify([
    {
      "surveyId": "srv_kahve_tercihleri_2026",
      "title": "Haftalık Kahve Tüketim Alışkanlıkları",
      "description": "Günlük kahve içme tercihlerinizi paylaşın, Profile Score ve ödül kazanın.",
      "ownerType": "PAG",
      "surveyType": "PAG",
      "category": "Genel",
      "status": "ACTIVE",
      "profileScoreReward": 100,
      "startAt": "2026-08-10T09:00:00.000Z",
      "endAt": "2026-08-30T23:59:59.000Z",
      "isHighlighted": true,
      "targeting": { "type": "ALL" },
      "questions": [
        {
          "id": "q1",
          "questionText": "Günde ortalama kaç fincan kahve tüketiyorsunuz?",
          "options": ["Tüketmiyorum", "1 - 2 Fincan", "3+ Fincan"]
        }
      ]
    },
    {
      "surveyId": "srv_teknoloji_alısveris_2026",
      "title": "Dijital Alışveriş Alışkanlıkları Araştırması",
      "description": "Online alışveriş tercihlerinizi paylaşın, Profile Score kazanın.",
      "ownerType": "ORGANIZATION",
      "surveyType": "ORGANIZATION",
      "category": "Teknoloji",
      "status": "ACTIVE",
      "profileScoreReward": 150,
      "startAt": "2026-08-12T10:00:00.000Z",
      "endAt": "2026-09-01T23:59:59.000Z",
      "targeting": { "type": "ALL" },
      "questions": [
        {
          "id": "q1",
          "questionText": "Online alışveriş yaparken en çok hangi kategoriyi tercih ediyorsunuz?",
          "options": ["Giyim / Ayakkabı", "Elektronik", "Market / Gıda", "Kozmetik"]
        }
      ]
    },
    {
      "surveyId": "srv_otomotiv_tercih_2026",
      "title": "Elektrikli Araç Tercih ve Eğilimleri",
      "description": "Geleceğin otomotiv teknolojileri hakkında fikrinizi belirtin.",
      "ownerType": "ORGANIZATION",
      "surveyType": "ORGANIZATION",
      "category": "Otomotiv",
      "status": "SCHEDULED",
      "profileScoreReward": 200,
      "startAt": "2026-08-20T09:00:00.000Z",
      "endAt": "2026-09-10T23:59:59.000Z",
      "targeting": { "type": "ALL" },
      "questions": [
        {
          "id": "q1",
          "questionText": "Önümüzdeki 2 yıl içinde elektrikli araç almayı düşünür müsünüz?",
          "options": ["Kesinlikle Evet", "Kararsızım", "Hayır Düşünmüyorum"]
        }
      ]
    }
  ], null, 2);

  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setJsonInputText(event.target.result as string);
        setJsonImportError(null);
      }
    };
    reader.readAsText(file);
  };

  const handleImportJsonSurvey = async () => {
    setJsonImportError(null);
    if (!jsonInputText.trim()) {
      setJsonImportError('Lütfen bir JSON verisi yapıştırın veya dosya seçin.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonInputText);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      setIsJsonImporting(true);

      for (const surveyObj of items) {
        const title = surveyObj.title || surveyObj.name || surveyObj.baslik || 'Yeni Anket';
        const rawQs = Array.isArray(surveyObj.questions)
          ? surveyObj.questions
          : (Array.isArray(surveyObj.sorular)
              ? surveyObj.sorular
              : (Array.isArray(surveyObj.items) ? surveyObj.items : []));

        if (!title.trim() || rawQs.length === 0) {
          throw new Error('Geçersiz anket formatı. "title" ve en az 1 soru ("questions") gereklidir.');
        }

        const srvId = surveyObj.surveyId || surveyObj.id || `srv_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
        const formattedQuestions = rawQs.slice(0, 3).map((q: any, idx: number) => {
          let rawOpts = Array.isArray(q.options)
            ? q.options
            : (Array.isArray(q.choices)
                ? q.choices
                : (Array.isArray(q.answers)
                    ? q.answers
                    : (Array.isArray(q.secenekler)
                        ? q.secenekler
                        : (Array.isArray(q.cevaplar) ? q.cevaplar : []))));

          if (typeof rawOpts === 'string') {
            rawOpts = (rawOpts as string).split(',').map(s => s.trim()).filter(Boolean);
          }

          if (!Array.isArray(rawOpts) || rawOpts.length === 0) {
            rawOpts = ['Seçenek 1', 'Seçenek 2'];
          }

          const opts = rawOpts.map((opt: any, oIdx: number) => {
            if (typeof opt === 'string') {
              return { optionId: `opt_${oIdx + 1}`, label: opt.trim() || `Seçenek ${oIdx + 1}`, order: oIdx + 1 };
            }
            const label = opt?.label || opt?.text || opt?.title || opt?.name || opt?.value || opt?.optionText || opt?.secenek || `Seçenek ${oIdx + 1}`;
            return {
              optionId: opt?.optionId || opt?.id || opt?.key || `opt_${oIdx + 1}`,
              label: String(label).trim() || `Seçenek ${oIdx + 1}`,
              order: typeof opt?.order === 'number' ? opt.order : oIdx + 1
            };
          });

          const qText = q.text || q.questionText || q.question || q.title || q.soru || q.prompt || `${idx + 1}. Soru`;
          return {
            id: `${srvId}_${q.id || q.questionId || `q${idx + 1}`}`,
            text: String(qText).trim(),
            type: q.type || q.questionType || 'SINGLE_SELECT',
            options: opts
          };
        });

        await fetch('/api/v1/admin/surveys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            surveyId: srvId,
            ownerType: surveyObj.ownerType || 'PAG',
            organizationId: surveyObj.organizationId || null,
            surveyType: surveyObj.surveyType || 'PAG',
            category: surveyObj.category || 'Genel',
            title: title.trim(),
            description: surveyObj.description || '',
            status: surveyObj.status || 'PENDING_APPROVAL',
            startAt: surveyObj.startAt ? new Date(surveyObj.startAt).toISOString() : new Date().toISOString(),
            endAt: surveyObj.endAt ? new Date(surveyObj.endAt).toISOString() : null,
            questions: formattedQuestions,
            profileScoreReward: Number(surveyObj.profileScoreReward) || 50
          })
        });
      }

      setIsJsonModalOpen(false);
      setJsonInputText('');
      alert(`${items.length} adet anket taslağı başarıyla oluşturuldu!`);
      fetchSurveys();
    } catch (err: any) {
      console.error(err);
      setJsonImportError('JSON Yükleme Hatası: ' + (err.message || 'Geçersiz JSON formatı.'));
    } finally {
      setIsJsonImporting(false);
    }
  };

  const fetchSurveys = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/admin/surveys?type=CAMPAIGN');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.surveys)) {
          const campaignSurveys = data.data.surveys.filter((s: any) => s.surveyType !== 'PROFILE' && !s.id.startsWith('pq_'));
          setSurveys(campaignSurveys);
        } else {
          setSurveys([]);
        }
      } else {
        setSurveys([]);
      }
    } catch (neonErr) {
      console.warn('Fetch Surveys error:', neonErr);
      setSurveys([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const [availableCategories, setAvailableCategories] = useState<{ id: string; name: string; isVisible: boolean }[]>([]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/admin/categories');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.categories)) {
          setAvailableCategories(data.data.categories);
          return;
        }
      }
    } catch (err) {
      console.warn('Fetch survey categories error:', err);
    }
  }, []);

  const fetchOrganizations = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/admin/organizations');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.organizations)) {
          setRegisteredOrganizations(data.data.organizations.map((o: any) => ({
            organizationId: o.organizationId || o.id,
            name: o.name
          })));
        }
      }
    } catch (err) {
      console.warn('Fetch registered organizations error:', err);
    }
  }, []);

  useEffect(() => {
    fetchSurveys();
    fetchCategories();
    fetchOrganizations();
  }, [fetchSurveys, fetchCategories, fetchOrganizations]);

  const resetWizardForm = () => {
    setEditingSurveyId(null);
    setFormOwnerType('PAG');
    setFormOrgId('');
    setFormTitle('');
    setFormDesc('');
    setFormSurveyType('PAG');
    setFormCategory('Genel');
    setFormTargeting('ALL');
    setFormProfileMinAge('');
    setFormProfileMaxAge('');
    setFormProfileMaritalStatus('ALL');
    setFormProfileChildrenStatus('ALL');
    setFormProfileHometown('');
    setFormScoreReward(50);
    setFormFinancialReward('NONE');
    setFormMoneyModel('RANKED');
    setFormMoneyBudget(1000);
    setFormRank1(300);
    setFormRank2(200);
    setFormRank3(100);
    setFormVoucherName('');
    setFormVoucherCodesText('');
    setFormShowStory(false);
    setFormStoryLabel('');
    setFormStoryImageCategory('Genel');
    setFormStoryImageUrl('');
    setFormStoryPosition(999);
    setFormQuestions([
      { id: 'q1', text: '1. Soru Metni', options: ['Seçenek 1', 'Seçenek 2'] }
    ]);
    setFormVerificationEnabled(false);
    setFormVerificationQuestion('Geçtiğimiz günlerde katıldığınız anket deneyiminizi nasıl değerlendirirsiniz?');
    setFormVerificationOptionsText('Çok Olumlu, Olumlu, Nötr, Olumsuz');
    setFormPagTargetCount(50);
    setFormOrgSelectionQuota(20);
    setFormVerificationScoreReward(25);
    setFormVerificationRewardType('VOUCHER');
    setFormVerificationMoneyBudget(500);
    setFormVerificationMoneyPerUser(50);
    setFormVerificationVoucherName('250 TL Kalite Doğrulama Hediye Çeki');
    setFormVerificationVoucherAmount(250);
    setFormVerificationVoucherCodesText('');
    setFormStartAt(toDatetimeLocalString(new Date()));
    setFormEndAt(toDatetimeLocalString(new Date(Date.now() + 30 * 24 * 3600 * 1000)));
    setFormIsHighlighted(false);
    setErrorMsg(null);
  };

  const handleOpenNewWizard = () => {
    resetWizardForm();
    setEditingSurveyOriginalStatus(null);
    setSaveFeedback('idle');
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const handleOpenEditWizard = (survey: any) => {
    const isApprovedOrLive = survey.status === 'ACTIVE' || survey.status === 'APPROVED' || survey.status === 'SCHEDULED' || survey.status === 'ENDED';
    if (isApprovedOrLive && !isSuperAdmin) {
      alert('Onaylanmış veya canlı anketleri yalnızca Süper Admin yetkisiyle düzenleyebilirsiniz.');
      return;
    }

    setEditingSurveyId(survey.surveyId || survey.id);
    setEditingSurveyOriginalStatus(survey.status || null);
    setSaveFeedback('idle');
    setFormOwnerType(survey.ownerType || 'PAG');
    setFormOrgId(survey.organizationId || '');
    setFormTitle(survey.title || '');
    setFormDesc(survey.description || '');
    setFormSurveyType(survey.surveyType || 'PAG');
    setFormCategory(survey.category || 'Genel');
    setFormIsHighlighted(Boolean(survey.isHighlighted));

    const tConfig = survey.targetingConfig || survey.targeting || {};
    setFormTargeting(tConfig.type || 'ALL');
    const pFilters = tConfig.profileFilters || {};
    setFormProfileMinAge(pFilters.minAge ? String(pFilters.minAge) : '');
    setFormProfileMaxAge(pFilters.maxAge ? String(pFilters.maxAge) : '');
    setFormProfileMaritalStatus(pFilters.maritalStatus || 'ALL');
    setFormProfileChildrenStatus(pFilters.childrenStatus || 'ALL');
    setFormProfileHometown(pFilters.hometown || '');

    setFormScoreReward(Number(survey.profileScoreReward) || 50);

    const rDef = survey.rewardDefinition || {};
    setFormFinancialReward(rDef.rewardType || 'NONE');
    setFormMoneyModel(rDef.distributionModel || 'RANKED');
    setFormMoneyBudget(Number(rDef.totalBudget) || 1000);
    if (Array.isArray(rDef.rankedRules) && rDef.rankedRules.length > 0) {
      setFormRank1(rDef.rankedRules[0]?.amount || 300);
      setFormRank2(rDef.rankedRules[1]?.amount || 200);
      setFormRank3(rDef.rankedRules[2]?.amount || 100);
    }
    setFormVoucherName(rDef.voucherPoolName || '');
    if (Array.isArray(rDef.inlineVoucherCodes)) {
      setFormVoucherCodesText(rDef.inlineVoucherCodes.join('\n'));
    } else {
      setFormVoucherCodesText('');
    }

    const sStory = survey.storyConfig || {};
    setFormShowStory(Boolean(sStory.showInStory || sStory.isStory));
    setFormStoryLabel(sStory.storyLabel || sStory.label || sStory.shortLabel || '');
    setFormStoryImageCategory(sStory.imageCategory || sStory.category || survey.category || 'Genel');
    setFormStoryImageUrl(sStory.imageUrl || '');
    setFormStoryPosition(Number(sStory.position !== undefined ? sStory.position : (sStory.sortOrder !== undefined ? sStory.sortOrder : 999)) || 999);

    const vConfig = survey.verificationConfig || {};
    const isVerActive = survey.hasVerification === true || survey.isVerificationEnabled === true || vConfig.enabled === true || Boolean(survey.verificationQuestion) || Boolean(vConfig.questionText);
    setFormVerificationEnabled(isVerActive);
    setFormVerificationQuestion(survey.verificationQuestion || vConfig.questionText || 'Geçtiğimiz günlerde katıldığınız anket deneyiminizi nasıl değerlendirirsiniz?');
    
    const rawOptions = survey.verificationOptions || vConfig.options;
    setFormVerificationOptionsText(Array.isArray(rawOptions) ? rawOptions.join(', ') : (typeof rawOptions === 'string' ? rawOptions : 'Çok Olumlu, Olumlu, Nötr, Olumsuz'));
    
    setFormPagTargetCount(survey.verificationTargetCount || vConfig.pagTargetCount || 50);
    setFormOrgSelectionQuota(survey.verificationOrgQuota || vConfig.orgSelectionQuota || 20);
    setFormVerificationScoreReward(typeof survey.verificationProfileScore === 'number' ? survey.verificationProfileScore : (typeof vConfig.profileScoreReward === 'number' ? vConfig.profileScoreReward : 25));

    const vRewardDef = vConfig.rewardDefinition || {};
    const vType = survey.verificationRewardType || vConfig.rewardType || vRewardDef.rewardType || (vConfig.verificationRewardSummary?.includes('Nakit') ? 'MONEY' : (vConfig.verificationRewardSummary ? 'VOUCHER' : 'VOUCHER'));
    setFormVerificationRewardType(vType);
    setFormVerificationMoneyBudget(survey.verificationRewardAmount || vRewardDef.totalBudget || 500);
    setFormVerificationMoneyPerUser(vRewardDef.remainingPoolAmountPerUser || 50);
    setFormVerificationVoucherName(survey.verificationVoucherPoolName || vRewardDef.voucherPoolName || vConfig.verificationRewardSummary || `${survey.title || 'Anket'} Kalite Doğrulama Hediye Çeki`);
    setFormVerificationVoucherAmount(survey.verificationRewardAmount || vRewardDef.voucherValueAmount || 250);

    const rawVCodes = survey.verificationVoucherCodes || vConfig.inlineVoucherCodes;
    if (Array.isArray(rawVCodes)) {
      setFormVerificationVoucherCodesText(rawVCodes.join('\n'));
    } else {
      setFormVerificationVoucherCodesText('');
    }

    if (Array.isArray(survey.questions) && survey.questions.length > 0) {
      setFormQuestions(survey.questions.map((q: any, idx: number) => {
        let rawOpts = Array.isArray(q.options) ? q.options : [];
        if (typeof rawOpts === 'string') {
          rawOpts = (rawOpts as string).split(',').map((s: string) => s.trim()).filter(Boolean);
        }
        const optLabels = rawOpts.map((opt: any, oI: number) => {
          if (typeof opt === 'string') return opt.trim();
          return (opt.label || opt.text || opt.title || opt.name || opt.value || `Seçenek ${oI + 1}`).trim();
        }).filter(Boolean);

        return {
          id: q.id || q.questionId || `q${idx + 1}`,
          text: q.text || q.questionText || '',
          options: optLabels.length > 0 ? optLabels : ['Seçenek 1', 'Seçenek 2']
        };
      }));
    } else {
      setFormQuestions([
        {
          id: 'q1',
          text: survey.title || '1. Soru Metni',
          options: ['Seçenek 1', 'Seçenek 2', 'Seçenek 3', 'Seçenek 4']
        }
      ]);
    }

    const rawStart = survey.startAt || survey.start_at;
    if (rawStart) {
      setFormStartAt(toDatetimeLocalString(rawStart));
    } else {
      setFormStartAt(toDatetimeLocalString(new Date()));
    }

    const rawEnd = survey.endAt || survey.end_at;
    if (rawEnd) {
      setFormEndAt(toDatetimeLocalString(rawEnd));
    } else {
      const defaultEnd = new Date(Date.now() + 30 * 24 * 3600 * 1000);
      setFormEndAt(toDatetimeLocalString(defaultEnd));
    }

    setErrorMsg(null);
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const handleAddQuestion = () => {
    if (formQuestions.length >= 3) {
      setErrorMsg('PAG V1 Kampanya Anketleri maksimum 3 soru içerebilir. 4. soru engellendi.');
      return;
    }
    setErrorMsg(null);
    setFormQuestions([
      ...formQuestions,
      { id: `q${formQuestions.length + 1}`, text: `${formQuestions.length + 1}. Soru Metni`, options: ['Seçenek 1', 'Seçenek 2'] }
    ]);
  };

  const handleSaveSurvey = async (targetStatus: 'DRAFT' | 'PENDING_APPROVAL' = 'DRAFT') => {
    if (!formTitle.trim()) {
      setErrorMsg('Lütfen 2. Adımda anket başlığı giriniz.');
      setWizardStep(2);
      return;
    }

    if (formOwnerType === 'ORGANIZATION' && !formOrgId) {
      setErrorMsg('Lütfen 1. Adımda anketin ait olduğu Firmayı (Kurum) seçiniz.');
      setWizardStep(1);
      return;
    }

    // Onaylanmış anket düzenlenirken taslağa dönmesini engelle
    let finalStatus = targetStatus;
    if (targetStatus === 'DRAFT' && editingSurveyOriginalStatus && editingSurveyOriginalStatus !== 'DRAFT' && editingSurveyOriginalStatus !== 'PENDING_APPROVAL' && editingSurveyOriginalStatus !== 'PENDING_ADMIN_APPROVAL') {
      finalStatus = editingSurveyOriginalStatus as any;
    }

    setIsSaving(true);
    setErrorMsg(null);
    setSaveFeedback('idle');
    const targetSurveyId = editingSurveyId || ('srv_' + Date.now());
    try {
      const formattedQuestions = formQuestions.map((q, idx) => ({
        questionId: q.id || `q${idx + 1}`,
        order: idx + 1,
        type: 'SINGLE_SELECT',
        text: q.text || `${idx + 1}. Soru`,
        options: (q.options && q.options.length > 0)
          ? q.options.map((optText, oIdx) => ({
              optionId: `opt_${oIdx + 1}`,
              label: typeof optText === 'string' ? optText : (optText as any).label || `Seçenek ${oIdx + 1}`,
              order: oIdx + 1
            }))
          : [
              { optionId: 'opt_1', label: 'Seçenek 1', order: 1 },
              { optionId: 'opt_2', label: 'Seçenek 2', order: 2 }
            ]
      }));

      const rewardDef: any = {
        rewardType: formFinancialReward
      };

      if (formFinancialReward === 'MONEY') {
        rewardDef.totalBudget = Number(formMoneyBudget) || 0;
        rewardDef.distributionModel = formMoneyModel;
        if (formMoneyModel === 'RANKED') {
          rewardDef.rankedRules = [
            { rank: 1, amount: Number(formRank1) || 0 },
            { rank: 2, amount: Number(formRank2) || 0 },
            { rank: 3, amount: Number(formRank3) || 0 }
          ];
        }
      } else if (formFinancialReward === 'VOUCHER') {
        if (formVoucherName) rewardDef.voucherPoolName = formVoucherName;
      }

      const inlineVoucherCodes = formFinancialReward === 'VOUCHER' && formVoucherCodesText
        ? formVoucherCodesText.split('\n').map(s => s.trim()).filter(Boolean)
        : undefined;

      const vRewardDef: any = {
        rewardType: formVerificationRewardType
      };
      if (formVerificationRewardType === 'MONEY') {
        vRewardDef.totalBudget = Number(formVerificationMoneyBudget) || 0;
        vRewardDef.distributionModel = 'EQUAL';
        vRewardDef.remainingPoolAmountPerUser = Number(formVerificationMoneyPerUser) || 50;
      } else if (formVerificationRewardType === 'VOUCHER') {
        vRewardDef.voucherPoolName = formVerificationVoucherName || `${formTitle} Kalite Doğrulama Hediye Çeki`;
        vRewardDef.voucherValueAmount = Number(formVerificationVoucherAmount) || 250;
      }

      const verificationInlineVoucherCodes = formVerificationEnabled && formVerificationRewardType === 'VOUCHER' && formVerificationVoucherCodesText
        ? formVerificationVoucherCodesText.split('\n').map(s => s.trim()).filter(Boolean)
        : undefined;

      const verificationRewardSummary = formVerificationRewardType === 'VOUCHER'
        ? `${formVerificationVoucherAmount || 250} TL Hediye Çeki`
        : (formVerificationRewardType === 'MONEY'
            ? `${formVerificationMoneyBudget || 500} TL Nakit Ödül`
            : `${formVerificationScoreReward || 25} Profil Puanı`);

      const vQuestion = formVerificationQuestion.trim() || 'Geçtiğimiz günlerde katıldığınız anket deneyiminizi nasıl değerlendirirsiniz?';
      const vOptions = formVerificationOptionsText.trim()
        ? formVerificationOptionsText.split(',').map(s => s.trim()).filter(Boolean)
        : ['Çok Olumlu', 'Olumlu', 'Nötr', 'Olumsuz'];

      const resolvedSurveyType = formOwnerType === 'ORGANIZATION' ? 'ORGANIZATION' : (formSurveyType || 'PAG');

      const rawPayload = {
        surveyId: targetSurveyId,
        ownerType: formOwnerType,
        organizationId: formOwnerType === 'ORGANIZATION' ? formOrgId : undefined,
        surveyType: resolvedSurveyType,
        category: formCategory,
        title: formTitle,
        description: formDesc || undefined,
        status: finalStatus,
        startAt: formStartAt ? new Date(formStartAt).toISOString() : new Date().toISOString(),
        endAt: formEndAt ? new Date(formEndAt).toISOString() : undefined,
        questions: formattedQuestions,
        targeting: {
          type: formTargeting,
          profileFilters: formTargeting === 'PROFILE' ? {
            minAge: formProfileMinAge ? Number(formProfileMinAge) : undefined,
            maxAge: formProfileMaxAge ? Number(formProfileMaxAge) : undefined,
            maritalStatus: formProfileMaritalStatus !== 'ALL' ? formProfileMaritalStatus : undefined,
            childrenStatus: formProfileChildrenStatus !== 'ALL' ? formProfileChildrenStatus : undefined,
            hometown: formProfileHometown ? formProfileHometown.trim() : undefined
          } : undefined
        },
        profileScoreReward: Number(formScoreReward) || 50,
        rewardDefinition: rewardDef,
        inlineVoucherCodes: inlineVoucherCodes,
        storyConfig: formShowStory ? {
          showInStory: true,
          label: formStoryLabel.trim() || formTitle,
          shortLabel: formStoryLabel.trim() || formTitle,
          storyLabel: formStoryLabel.trim() || formTitle,
          imageCategory: formStoryImageCategory || 'Genel',
          imageUrl: formStoryImageUrl.trim() || null,
          position: Number(formStoryPosition) || 999,
          sortOrder: Number(formStoryPosition) || 999,
          isActive: true
        } : {
          showInStory: false,
          isActive: false
        },
        isHighlighted: formIsHighlighted,
        hasVerification: Boolean(formVerificationEnabled),
        isVerificationEnabled: Boolean(formVerificationEnabled),
        verificationQuestion: formVerificationEnabled ? vQuestion : null,
        verificationOptions: formVerificationEnabled ? vOptions : null,
        verificationTargetCount: formVerificationEnabled ? (Number(formPagTargetCount) || 50) : 0,
        verificationOrgQuota: formVerificationEnabled ? (Number(formOrgSelectionQuota) || 20) : 0,
        verificationProfileScore: formVerificationEnabled ? (Number(formVerificationScoreReward) || 25) : 0,
        verificationRewardType: formVerificationEnabled ? formVerificationRewardType : 'NONE',
        verificationRewardAmount: formVerificationEnabled ? (formVerificationRewardType === 'VOUCHER' ? (Number(formVerificationVoucherAmount) || 250) : (Number(formVerificationMoneyBudget) || 500)) : 0,
        verificationRewardSummary: formVerificationEnabled ? verificationRewardSummary : '',
        verificationVoucherPoolName: formVerificationEnabled ? (formVerificationVoucherName || `${formTitle} Kalite Doğrulama Hediye Çeki`) : '',
        verificationVoucherCodes: formVerificationEnabled ? (verificationInlineVoucherCodes || []) : [],
        verificationConfig: formVerificationEnabled ? {
          enabled: true,
          questionText: vQuestion,
          options: vOptions,
          pagTargetCount: Number(formPagTargetCount) || 50,
          orgSelectionQuota: Number(formOrgSelectionQuota) || 20,
          profileScoreReward: Number(formVerificationScoreReward) || 25,
          rewardType: formVerificationRewardType,
          rewardDefinition: vRewardDef,
          verificationRewardSummary: verificationRewardSummary,
          inlineVoucherCodes: verificationInlineVoucherCodes
        } : {
          enabled: false
        },
        verificationInlineVoucherCodes: verificationInlineVoucherCodes
      };

      // Sanitize payload: guaranteed recursive removal of any undefined properties
      const cleanedPayload = removeUndefinedFields(rawPayload);

      // 1. Neon PostgreSQL API save (~10ms)
      const res = await fetch('/api/v1/admin/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId: targetSurveyId,
          title: formTitle,
          description: formDesc || '',
          ownerType: formOwnerType,
          organizationId: formOrgId || null,
          surveyType: resolvedSurveyType,
          category: formCategory,
          status: finalStatus,
          isHighlighted: formIsHighlighted,
          profileScoreReward: Number(formScoreReward) || 50,
          targetingConfig: cleanedPayload.targeting,
          rewardDefinition: rewardDef,
          storyConfig: cleanedPayload.storyConfig,
          hasVerification: Boolean(formVerificationEnabled),
          verificationConfig: cleanedPayload.verificationConfig,
          verificationTargetCount: formVerificationEnabled ? (Number(formPagTargetCount) || 50) : 0,
          verificationOrgQuota: formVerificationEnabled ? (Number(formOrgSelectionQuota) || 20) : 0,
          startAt: formStartAt && !isNaN(new Date(formStartAt).getTime()) ? new Date(formStartAt).toISOString() : new Date().toISOString(),
          endAt: formEndAt && !isNaN(new Date(formEndAt).getTime()) ? new Date(formEndAt).toISOString() : null,
          questions: formattedQuestions.map(q => ({
            id: q.questionId,
            text: q.text,
            type: q.type,
            options: q.options
          }))
        })
      });

      const resData = await res.json().catch(() => ({}));
      if (res.ok && resData.success) {
        setEditingSurveyId(targetSurveyId);
        setEditingSurveyOriginalStatus(finalStatus);
        await fetchSurveys();
        if (targetStatus === 'PENDING_APPROVAL') {
          setSaveFeedback('sent_approval');
          setTimeout(() => {
            setIsWizardOpen(false);
            resetWizardForm();
            setSaveFeedback('idle');
          }, 1200);
        } else {
          setSaveFeedback('saved');
          setTimeout(() => {
            setSaveFeedback('idle');
          }, 2500);
        }
      } else {
        setErrorMsg(resData.error || 'Anket kaydedilirken bir sorun oluştu.');
      }
    } catch (err: any) {
      console.error('Save Survey Error:', err);
      setErrorMsg(err.message || 'Anket kaydedilirken bir sorun oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchiveSurvey = async (surveyId: string, archive: boolean) => {
    try {
      const res = await fetch('/api/v1/admin/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId,
          status: archive ? 'ARCHIVED' : 'ACTIVE',
          isArchived: archive
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        await fetchSurveys();
      } else {
        alert('Arşivleme hatası: ' + (data.error || 'Bilinmeyen hata'));
      }
    } catch (err: any) {
      console.error('Archive Survey Error:', err);
      alert('Arşivleme hatası: ' + (err.message || 'Bilinmeyen hata'));
    }
  };

  const handleApproveSurvey = async (surveyId: string) => {
    try {
      const res = await fetch('/api/v1/admin/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId,
          status: 'ACTIVE'
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        alert('✅ Anket başarıyla onaylandı ve canlı yayına alındı!');
        await fetchSurveys();
      } else {
        alert('Onaylama hatası: ' + (data.error || 'Bilinmeyen hata'));
      }
    } catch (err: any) {
      console.error('Approve Survey Error:', err);
      alert('Onaylama hatası: ' + (err.message || 'Bilinmeyen hata'));
    }
  };

  const handleFinalApproveSurveyAdmin = async (surveyId: string) => {
    try {
      const res = await fetch('/api/v1/admin/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId,
          status: 'ACTIVE'
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        alert('✅ Anket süper admin onayıyla canlı yayına alındı! 🚀');
        await fetchSurveys();
      } else {
        alert('Onaylama hatası: ' + (data.error || 'Bilinmeyen hata'));
      }
    } catch (err: any) {
      console.error('Final Approve Survey Error:', err);
      alert('Onaylama hatası: ' + (err.message || 'Bilinmeyen hata'));
    }
  };

  const handleApproveSurveyByOrg = async (surveyId: string) => {
    try {
      const res = await fetch('/api/v1/admin/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId,
          status: 'PENDING_APPROVAL'
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        alert('Anket PAG Super Admin onayına gönderildi.');
        await fetchSurveys();
      } else {
        alert('Hata: ' + (data.error || 'Bilinmeyen hata'));
      }
    } catch (err: any) {
      console.error('Org Approve Survey Error:', err);
      alert('Hata: ' + (err.message || 'Bilinmeyen hata'));
    }
  };

  const handleToggleHighlight = async (survey: any) => {
    try {
      await fetch('/api/v1/admin/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId: survey.surveyId || survey.id,
          isHighlighted: !survey.isHighlighted
        })
      });
      await fetchSurveys();
    } catch (err: any) {
      console.error('Toggle Highlight Error:', err);
      alert('Öne çıkarma hatası: ' + (err.message || 'Bilinmeyen hata'));
    }
  };

  const isSurveyMatchingTab = (s: any, tab: string) => {
    if (tab === 'ARCHIVED') {
      return Boolean(s.isArchived) || s.status === 'ARCHIVED';
    }
    if (s.isArchived || s.status === 'ARCHIVED') {
      return false;
    }

    const now = Date.now();
    const hasStartTime = s.startAt && !isNaN(new Date(s.startAt).getTime());
    const hasEndTime = s.endAt && !isNaN(new Date(s.endAt).getTime());
    const startTime = hasStartTime ? new Date(s.startAt).getTime() : null;
    const endTime = hasEndTime ? new Date(s.endAt).getTime() : null;

    if (tab === 'DRAFT') {
      return s.status === 'DRAFT';
    }

    if (tab === 'PENDING_APPROVAL') {
      return s.status === 'PENDING_APPROVAL' || s.status === 'PENDING_ADMIN_APPROVAL';
    }

    if (tab === 'SCHEDULED') {
      // Admin onayı almış ama günü gelmemiş anketler
      if (s.status === 'SCHEDULED') return true;
      if ((s.status === 'APPROVED' || s.status === 'ACTIVE') && startTime && startTime > now) {
        return true;
      }
      return false;
    }

    if (tab === 'ENDED') {
      // Admin onayı almış günü geçmişler
      if (s.status === 'ENDED' || s.status === 'COMPLETED') return true;
      if ((s.status === 'APPROVED' || s.status === 'ACTIVE') && endTime && endTime < now) {
        return true;
      }
      return false;
    }

    if (tab === 'ACTIVE') {
      // Canlı Anketler: ACTIVE olup şu an geçerli tarih aralığında olanlar
      if (s.status !== 'ACTIVE' && s.status !== 'APPROVED') return false;
      if (startTime && startTime > now) return false; // Günü gelmemiş -> SCHEDULED
      if (endTime && endTime < now) return false; // Günü geçmiş -> ENDED
      return true;
    }

    return true;
  };

  const allFilteredSurveys = surveys.filter(s => {
    if (!isSurveyMatchingTab(s, activeTab)) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = (s.title || '').toLowerCase().includes(q);
      const catMatch = (s.category || '').toLowerCase().includes(q);
      const descMatch = (s.description || '').toLowerCase().includes(q);
      const idMatch = (s.surveyId || s.id || '').toLowerCase().includes(q);
      if (!titleMatch && !catMatch && !descMatch && !idMatch) {
        return false;
      }
    }

    return true;
  });

  const getTabCount = (tabKey: string) => {
    return surveys.filter(s => isSurveyMatchingTab(s, tabKey)).length;
  };

  const displayedSurveys = allFilteredSurveys.slice(0, displayLimit);

  const tabsList = [
    { key: 'ACTIVE', label: '🟢 Canlı Anketler' },
    { key: 'PENDING_APPROVAL', label: '👑 Admin Onayı Bekleyenler' },
    { key: 'DRAFT', label: '📝 Taslaklar' },
    { key: 'SCHEDULED', label: '⏰ Planlananlar' },
    { key: 'ENDED', label: '🏁 Tamamlananlar' },
    { key: 'ARCHIVED', label: '📦 Arşiv' }
  ];

  return (
    <div>
      <header style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 className="admin-header-title" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              Anket & Kampanya Yönetimi
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px', fontWeight: 500 }}>
              Uçtan Uca Kampanya Sihirbazı & Onay Döngüsü
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleOpenNewWizard}
              style={{
                padding: '12px 20px',
                backgroundColor: 'var(--brand-navy)',
                color: '#FFFFFF',
                fontWeight: 700,
                borderRadius: '8px',
                fontSize: '14px',
                boxShadow: 'var(--shadow-sm)',
                width: 'auto'
              }}
            >
              + Yeni Kampanya / Anket Oluştur
            </button>

            <button
              onClick={() => { setJsonInputText(''); setJsonImportError(null); setIsJsonModalOpen(true); }}
              style={{
                padding: '12px 20px',
                backgroundColor: '#0F172A',
                color: '#CCFF00',
                fontWeight: 700,
                borderRadius: '8px',
                fontSize: '14px',
                border: '1px solid #CCFF00',
                cursor: 'pointer',
                width: 'auto'
              }}
            >
              📥 JSON İle İçeri Aktar
            </button>
          </div>
        </div>
      </header>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        {tabsList.map(t => {
          const count = getTabCount(t.key);
          const isSelected = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key as any); setDisplayLimit(30); }}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: isSelected ? 800 : 600,
                whiteSpace: 'nowrap',
                backgroundColor: isSelected ? 'var(--brand-navy)' : 'var(--bg-surface)',
                color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                border: isSelected ? '1px solid var(--brand-navy)' : '1px solid var(--border-color)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
            >
              <span>{t.label}</span>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '10px',
                backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-surface-secondary)',
                color: isSelected ? '#FFFFFF' : 'var(--text-muted)'
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar for Title & Category */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: 'var(--text-muted)' }}>🔍</span>
          <input
            type="text"
            placeholder="Anket Başlığı, Kategori veya ID'ye göre ara..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setDisplayLimit(30); }}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: '13.5px',
              outline: 'none'
            }}
          />
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface-secondary)',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Aramayı Temizle
          </button>
        )}
      </div>

      {/* 10-Step Campaign Creator Wizard Modal */}
      {isWizardOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '12px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '900px',
            maxHeight: '92vh',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px 20px',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)' }}>
                  {editingSurveyId ? 'Anket Düzenle' : 'Kampanya Hazırlama Sihirbazı'} (Adım {wizardStep} / 12)
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Uçtan Uca Kampanya & Doğrulama Konfigürasyonu</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => { setIsWizardOpen(false); setIsJsonModalOpen(true); }}
                  style={{
                    padding: '6px 14px',
                    backgroundColor: '#0F172A',
                    color: '#CCFF00',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: '1px solid #CCFF00',
                    cursor: 'pointer'
                  }}
                >
                  📥 JSON İle İçeri Aktar
                </button>
                <button onClick={() => setIsWizardOpen(false)} style={{ color: 'var(--text-muted)', fontSize: '20px', background: 'none', minHeight: 'auto', border: 'none', cursor: 'pointer' }}>✕</button>
              </div>
            </div>

            {/* 12-Step Touch-Scrollable Indicator */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '20px', paddingBottom: '4px' }}>
              {Array.from({ length: 12 }).map((_, i) => {
                const stepNum = i + 1;
                const isCurrent = wizardStep === stepNum;
                const isPast = wizardStep > stepNum;
                return (
                  <button
                    key={stepNum}
                    onClick={() => setWizardStep(stepNum)}
                    style={{
                      flexShrink: 0,
                      minWidth: '34px',
                      height: '34px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: isCurrent ? 'var(--brand-navy)' : isPast ? 'var(--bg-surface-secondary)' : 'var(--bg-primary)',
                      color: isCurrent ? '#FFFFFF' : isPast ? 'var(--brand-navy)' : 'var(--text-muted)',
                      border: isCurrent ? '1px solid var(--brand-navy)' : '1px solid var(--border-color)',
                      cursor: 'pointer'
                    }}
                  >
                    {stepNum}
                  </button>
                );
              })}
            </div>

            {errorMsg && (
              <div style={{ padding: '12px 16px', backgroundColor: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error-color)', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontWeight: 500 }}>
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Step 1: Owner */}
            {wizardStep === 1 && (
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>1. Adım: Anket Sahibi (Owner)</h4>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Sahip Tipi (Owner Type)</label>
                  <select
                    value={formOwnerType}
                    onChange={(e) => setFormOwnerType(e.target.value as any)}
                    style={{ width: '100%', padding: '12px', marginTop: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  >
                    <option value="PAG">PAG (Resmi Genel)</option>
                    <option value="ORGANIZATION">Kurumsal Müşteri (Organization)</option>
                  </select>
                </div>

                {formOwnerType === 'ORGANIZATION' && (
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Kurum Seçin (Organization)</label>
                    <select
                      value={formOrgId}
                      onChange={(e) => setFormOrgId(e.target.value)}
                      style={{ width: '100%', padding: '12px', marginTop: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    >
                      <option value="">Kurum Seçin</option>
                      {registeredOrganizations.map(org => (
                        <option key={org.organizationId} value={org.organizationId}>
                          {org.name} ({org.organizationId})
                        </option>
                      ))}
                      {registeredOrganizations.length === 0 && (
                        <option value="" disabled>Henüz kayıtlı firma bulunamadı (Önce Firmalar menüsünden ekleyin)</option>
                      )}
                    </select>
                  </div>
                )}

                <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formIsHighlighted}
                      onChange={(e) => setFormIsHighlighted(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#FFD700', cursor: 'pointer' }}
                    />
                    ⭐ Öne Çıkarılan Anket (Highlight / Pin to Top)
                  </label>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0 28px' }}>
                    İşaretlenirse bu anket mobil ana sayfada en üst sırada altın rozet ile gösterilir.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Info */}
            {wizardStep === 2 && (
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>2. Adım: Anket Bilgileri</h4>
                <div className="admin-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Başlık</label>
                    <input
                      type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Kampanya Anket Başlığı"
                      style={{ width: '100%', padding: '12px', marginTop: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Kategori</label>
                    <select
                      value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                      style={{ width: '100%', padding: '12px', marginTop: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    >
                      {availableCategories.length > 0 ? (
                        availableCategories
                          .filter((cat) => typeof cat.isVisible !== 'boolean' || cat.isVisible || cat.name === formCategory)
                          .map((cat) => (
                            <option key={cat.id} value={cat.name}>
                              {cat.name}
                            </option>
                          ))
                      ) : (
                        <>
                          <option value="Yaşam">Yaşam</option>
                          <option value="Alışveriş & Tüketim">Alışveriş & Tüketim</option>
                          <option value="Yeme & İçme">Yeme & İçme</option>
                          <option value="Teknoloji">Teknoloji</option>
                          <option value="Otomotiv & Ulaşım">Otomotiv & Ulaşım</option>
                          <option value="Spor & Sağlıklı Yaşam">Spor & Sağlıklı Yaşam</option>
                          <option value="Seyahat & Eğlence">Seyahat & Eğlence</option>
                          <option value="Finans">Finans</option>
                          <option value="Ev & Yaşam">Ev & Yaşam</option>
                          <option value="Moda & Kişisel Bakım">Moda & Kişisel Bakım</option>
                          <option value="Medya & Dijital İçerik">Medya & Dijital İçerik</option>
                          <option value="Eğitim & Kariyer">Eğitim & Kariyer</option>
                          <option value="Genel">Genel</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Açıklama</label>
                  <textarea
                    rows={3} value={formDesc} onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Kampanya hakkında kısa açıklama..."
                    style={{ width: '100%', padding: '12px', marginTop: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Targeting */}
            {wizardStep === 3 && (
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>3. Adım: Hedef Kitle (Targeting)</h4>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Hedefleme Tipi</label>
                  <select
                    value={formTargeting} onChange={(e) => setFormTargeting(e.target.value as any)}
                    style={{ width: '100%', padding: '12px', marginTop: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  >
                    <option value="ALL">Herkese Açık (Tüm PAG Kullanıcıları)</option>
                    <option value="PROFILE">Temel Profil Hedefli (Yaş / Medeni Durum / Çocuk / Adres)</option>
                    <option value="LOCATION">Lokasyon Hedefli (İl / İlçe / Mahalle)</option>
                  </select>
                </div>

                {formTargeting === 'PROFILE' && (
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brand-navy)' }}>Desteklenen Temel Profil Filtreleri</p>
                    
                    <div className="admin-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Yaş Aralığı (Min - Max)</label>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                          <input type="number" value={formProfileMinAge} onChange={(e) => setFormProfileMinAge(e.target.value)} placeholder="Min (18)" style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '6px' }} />
                          <input type="number" value={formProfileMaxAge} onChange={(e) => setFormProfileMaxAge(e.target.value)} placeholder="Max (45)" style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '6px' }} />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Medeni Durum</label>
                        <select value={formProfileMaritalStatus} onChange={(e) => setFormProfileMaritalStatus(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '6px' }}>
                          <option value="ALL">Fark Etmez</option>
                          <option value="SINGLE">Bekar</option>
                          <option value="MARRIED">Evli</option>
                          <option value="DIVORCED">Boşanmış</option>
                        </select>
                      </div>
                    </div>

                    <div className="admin-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Çocuk Durumu</label>
                        <select value={formProfileChildrenStatus} onChange={(e) => setFormProfileChildrenStatus(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '6px' }}>
                          <option value="ALL">Fark Etmez</option>
                          <option value="HAS_CHILDREN">Çocuğu Var</option>
                          <option value="NO_CHILDREN">Çocuğu Yok</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Memleket (İl)</label>
                        <input type="text" value={formProfileHometown} onChange={(e) => setFormProfileHometown(e.target.value)} placeholder="Örn: Ankara" style={{ width: '100%', padding: '10px', marginTop: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '6px' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Main Survey Score & Reward Type */}
            {wizardStep === 4 && (
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>4. Adım: Profil Puanı & Ana Finansal Ödül</h4>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Profil Puanı Ödülü (Profile Score)</label>
                  <input
                    type="number" value={formScoreReward} onChange={(e) => setFormScoreReward(Number(e.target.value))}
                    style={{ width: '100%', padding: '12px', marginTop: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Ana Anket Finansal Ödül Tipi</label>
                  <select
                    value={formFinancialReward} onChange={(e) => setFormFinancialReward(e.target.value as any)}
                    style={{ width: '100%', padding: '12px', marginTop: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  >
                    <option value="NONE">Ödül Yok (Sadece Puan)</option>
                    <option value="MONEY">Nakit TL Ödülü</option>
                    <option value="VOUCHER">Hediye Çeki (Voucher)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 5: Main Survey Reward Detail */}
            {wizardStep === 5 && (
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>5. Adım: Ana Anket Ödül Detay Konfigürasyonu</h4>
                {formFinancialReward === 'MONEY' && (
                  <div>
                    <div className="admin-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Toplam Ödül Bütçesi (TL)</label>
                        <input type="number" value={formMoneyBudget} onChange={(e) => setFormMoneyBudget(Number(e.target.value))} style={{ width: '100%', padding: '12px', marginTop: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Dağıtım Modeli</label>
                        <select value={formMoneyModel} onChange={(e) => setFormMoneyModel(e.target.value as any)} style={{ width: '100%', padding: '12px', marginTop: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px' }}>
                          <option value="RANKED">Kademeli Sıralama (1., 2., 3. + Havuz)</option>
                          <option value="EQUAL">Eşit Dağıtım (Kişi Başı Sabit)</option>
                        </select>
                      </div>
                    </div>
                    {formMoneyModel === 'RANKED' && (
                      <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '12px' }}>Derece Ödülleri (TL)</p>
                        <div className="admin-grid-3col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                          <div><label style={{ fontSize: '12px', fontWeight: 600 }}>1. Sıra</label><input type="number" value={formRank1} onChange={(e) => setFormRank1(Number(e.target.value))} style={{ width: '100%', padding: '8px', marginTop: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '6px' }} /></div>
                          <div><label style={{ fontSize: '12px', fontWeight: 600 }}>2. Sıra</label><input type="number" value={formRank2} onChange={(e) => setFormRank2(Number(e.target.value))} style={{ width: '100%', padding: '8px', marginTop: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '6px' }} /></div>
                          <div><label style={{ fontSize: '12px', fontWeight: 600 }}>3. Sıra</label><input type="number" value={formRank3} onChange={(e) => setFormRank3(Number(e.target.value))} style={{ width: '100%', padding: '8px', marginTop: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '6px' }} /></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {formFinancialReward === 'VOUCHER' && (
                  <div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Kupon Havuzu Adı</label>
                      <input type="text" value={formVoucherName} onChange={(e) => setFormVoucherName(e.target.value)} placeholder="Örn: 250 TL İndirim Kuponu" style={{ width: '100%', padding: '12px', marginTop: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Toplu Kupon Kodları (Her satırda 1 kod)</label>
                      <textarea rows={4} value={formVoucherCodesText} onChange={(e) => setFormVoucherCodesText(e.target.value)} placeholder={"CODE-1001-PAG\nCODE-1002-PAG"} style={{ width: '100%', padding: '12px', marginTop: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px' }} />
                    </div>
                  </div>
                )}
                {formFinancialReward === 'NONE' && <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Bu anket için ek finansal ödül tanımlanmamıştır.</p>}
              </div>
            )}

            {/* Step 6: Story Config */}
            {wizardStep === 6 && (
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>6. Adım: Story / Görsel Konfigürasyonu</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <input type="checkbox" checked={formShowStory} onChange={(e) => setFormShowStory(e.target.checked)} id="storyCheck" style={{ width: '18px', height: '18px' }} />
                  <label htmlFor="storyCheck" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Story Bar'da Göster</label>
                </div>
                {formShowStory && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="admin-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Kısa Story Etiketi (Label)</label>
                        <input
                          type="text"
                          value={formStoryLabel}
                          onChange={(e) => setFormStoryLabel(e.target.value)}
                          placeholder="Örn: Özel Fırsat"
                          style={{ width: '100%', padding: '12px', marginTop: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          ⭐ Sıra Numarası (Sort Order)
                        </label>
                        <input
                          type="number"
                          value={formStoryPosition}
                          onChange={(e) => setFormStoryPosition(Number(e.target.value))}
                          placeholder="999 (Öne almak için 1, 2, 3...)"
                          style={{ width: '100%', padding: '12px', marginTop: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px', fontWeight: 700 }}
                        />
                      </div>
                    </div>

                    <div className="admin-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          Kategoriye Özel Tema Seçimi ({formCategory})
                        </label>
                        <select
                          value={formStoryImageCategory}
                          onChange={(e) => setFormStoryImageCategory(e.target.value)}
                          style={{ width: '100%', padding: '12px', marginTop: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px', color: 'var(--text-primary)' }}
                        >
                          <option value="Genel">Genel / PAG Teması</option>
                          <option value="Teknoloji">Teknoloji</option>
                          <option value="Otomotiv & Ulaşım">Otomotiv & Ulaşım</option>
                          <option value="Yeme & İçme">Yeme & İçme</option>
                          <option value="Alışveriş & Tüketim">Alışveriş & Tüketim</option>
                          <option value="Finans">Finans</option>
                          <option value="Yaşam">Yaşam</option>
                          <option value="Spor & Sağlıklı Yaşam">Spor & Sağlık</option>
                          <option value="Seyahat & Eğlence">Seyahat & Eğlence</option>
                          <option value="Ev & Yaşam">Ev & Yaşam</option>
                          <option value="Moda & Kişisel Bakım">Moda & Kişisel Bakım</option>
                          <option value="Medya & Dijital İçerik">Medya & Dijital İçerik</option>
                          <option value="Eğitim & Kariyer">Eğitim & Kariyer</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          🌐 Özel Story Görsel URL'si (Opsiyonel)
                        </label>
                        <input
                          type="text"
                          value={formStoryImageUrl}
                          onChange={(e) => setFormStoryImageUrl(e.target.value)}
                          placeholder="https://example.com/banner.png"
                          style={{ width: '100%', padding: '12px', marginTop: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px' }}
                        />
                      </div>
                    </div>

                    {/* Live Visual Story Card Preview */}
                    <div style={{ padding: '20px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        background: formStoryImageUrl ? '#0F172A' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        border: '3px solid #84CC16',
                        overflow: 'hidden'
                      }}>
                        {formStoryImageUrl ? (
                          <img src={formStoryImageUrl} alt="Story" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as any).style.display = 'none'; }} />
                        ) : (
                          '⭐'
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: 'var(--brand-navy)', color: 'white', borderRadius: '4px', fontWeight: 700 }}>
                            {formStoryPosition < 999 ? `⭐ Sıra #${formStoryPosition}` : `#${formStoryPosition}`}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            {formStoryImageCategory}
                          </span>
                        </div>
                        <h5 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>
                          {formStoryLabel || formTitle || 'Story Başlığı'}
                        </h5>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 7: Main Survey Questions (Max 3) */}
            {wizardStep === 7 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>7. Adım: Ana Anket Soruları (Max 3 / Mevcut: {formQuestions.length})</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Anket sorularını ve cevap şıklarını aşağıdan ekleyip düzenleyebilirsiniz.</p>
                  </div>
                  <button
                    onClick={handleAddQuestion}
                    disabled={formQuestions.length >= 3}
                    style={{
                      padding: '8px 14px',
                      backgroundColor: formQuestions.length >= 3 ? 'var(--bg-surface-secondary)' : 'var(--brand-navy)',
                      color: formQuestions.length >= 3 ? 'var(--text-muted)' : '#FFFFFF',
                      fontWeight: 700,
                      borderRadius: '6px',
                      fontSize: '12px',
                      border: 'none',
                      cursor: formQuestions.length >= 3 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    + Soru Ekle
                  </button>
                </div>
                {formQuestions.map((q, idx) => {
                  const opts = Array.isArray(q.options)
                    ? q.options.map((o: any) => typeof o === 'string' ? o : (o.label || ''))
                    : [];

                  return (
                    <div key={q.id || idx} style={{ padding: '16px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '10px', marginBottom: '14px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brand-navy)' }}>{idx + 1}. Soru Metni</label>
                        {formQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formQuestions.filter((_, qI) => qI !== idx);
                              setFormQuestions(updated);
                            }}
                            style={{ padding: '4px 8px', backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            🗑️ Soruyu Sil
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={q.text}
                        placeholder="Örn: Günlük kahve tüketim alışkanlığınız nedir?"
                        onChange={(e) => {
                          const updated = [...formQuestions];
                          updated[idx].text = e.target.value;
                          setFormQuestions(updated);
                        }}
                        style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '6px', fontSize: '13px', marginBottom: '12px' }}
                      />

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Cevap Seçenekleri ({opts.length} Şık)</label>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...formQuestions];
                              const currentOpts = Array.isArray(updated[idx].options) ? [...updated[idx].options] : [];
                              currentOpts.push(`Seçenek ${currentOpts.length + 1}`);
                              updated[idx].options = currentOpts;
                              setFormQuestions(updated);
                            }}
                            style={{ padding: '3px 8px', backgroundColor: 'var(--bg-surface)', color: 'var(--brand-navy)', border: '1px solid var(--border-highlight)', borderRadius: '4px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            + Şık Ekle
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {opts.map((optText, oIdx) => (
                            <div key={oIdx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', width: '20px' }}>{String.fromCharCode(65 + oIdx)})</span>
                              <input
                                type="text"
                                value={optText}
                                placeholder={`Seçenek ${oIdx + 1}`}
                                onChange={(e) => {
                                  const updated = [...formQuestions];
                                  const currentOpts = Array.isArray(updated[idx].options) ? [...updated[idx].options] : [];
                                  currentOpts[oIdx] = e.target.value;
                                  updated[idx].options = currentOpts;
                                  setFormQuestions(updated);
                                }}
                                style={{ flex: 1, padding: '8px 10px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '6px', fontSize: '13px' }}
                              />
                              {opts.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...formQuestions];
                                    const currentOpts = Array.isArray(updated[idx].options) ? [...updated[idx].options] : [];
                                    currentOpts.splice(oIdx, 1);
                                    updated[idx].options = currentOpts;
                                    setFormQuestions(updated);
                                  }}
                                  style={{ padding: '6px 10px', backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Step 8 (NEW): Kalite Doğrulama Hizmeti */}
            {wizardStep === 8 && (
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
                  8. Adım: 🛡️ Kalite Doğrulama Hizmeti
                </h4>

                <div style={{ padding: '16px', backgroundColor: formVerificationEnabled ? 'rgba(57, 119, 246, 0.06)' : 'var(--bg-surface-secondary)', border: formVerificationEnabled ? '1.5px solid rgba(57, 119, 246, 0.35)' : '1px solid var(--border-color)', borderRadius: '12px', marginBottom: '18px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: 800, color: 'var(--brand-navy)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      id="enableVerificationToggle"
                      checked={formVerificationEnabled}
                      onChange={(e) => setFormVerificationEnabled(e.target.checked)}
                      style={{ width: '20px', height: '20px', accentColor: 'var(--brand-navy)', cursor: 'pointer' }}
                    />
                    🛡️ Bu Ankette Kalite Doğrulama Hizmeti Uygulansın
                  </label>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '6px 0 0 32px' }}>
                    İşaretlenirse, çağrı merkezi personeli anketi tamamlayan kullanıcıları arayarak tek soruluk doğrulama anketi yönlendirecektir.
                  </p>
                </div>

                {formVerificationEnabled ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Doğrulama Sorusu Metni *</label>
                      <input
                        type="text"
                        value={formVerificationQuestion}
                        onChange={(e) => setFormVerificationQuestion(e.target.value)}
                        placeholder="Örn: Geçtiğimiz günlerde katıldığınız anket deneyiminizi nasıl değerlendirirsiniz?"
                        style={{ width: '100%', padding: '12px', marginTop: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Cevap Seçenekleri (Virgülle ayırın) *</label>
                      <input
                        type="text"
                        value={formVerificationOptionsText}
                        onChange={(e) => setFormVerificationOptionsText(e.target.value)}
                        placeholder="Çok Olumlu, Olumlu, Nötr, Olumsuz"
                        style={{ width: '100%', padding: '12px', marginTop: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px', fontSize: '13px' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                      <div>
                        <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>PAG Toplam Arama Adedi</label>
                        <input
                          type="number"
                          value={formPagTargetCount}
                          onChange={(e) => setFormPagTargetCount(Number(e.target.value))}
                          placeholder="50"
                          style={{ width: '100%', padding: '10px', marginTop: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '6px', fontSize: '13px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>Firma Katılımcı Kotası</label>
                        <input
                          type="number"
                          value={formOrgSelectionQuota}
                          onChange={(e) => setFormOrgSelectionQuota(Number(e.target.value))}
                          placeholder="20"
                          style={{ width: '100%', padding: '10px', marginTop: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '6px', fontSize: '13px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>Doğrulama Profil Puanı</label>
                        <input
                          type="number"
                          value={formVerificationScoreReward}
                          onChange={(e) => setFormVerificationScoreReward(Number(e.target.value))}
                          placeholder="25"
                          style={{ width: '100%', padding: '10px', marginTop: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '6px', fontSize: '13px' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Doğrulama Finansal Ödül Türü</label>
                      <select
                        value={formVerificationRewardType}
                        onChange={(e) => setFormVerificationRewardType(e.target.value as any)}
                        style={{ width: '100%', padding: '12px', marginTop: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px', color: 'var(--text-primary)' }}
                      >
                        <option value="VOUCHER">🎁 Hediye Çeki (Kupon Havuzu)</option>
                        <option value="MONEY">💵 Nakit TL Ödülü</option>
                        <option value="NONE">🚫 Ek Finansal Ödül Yok (Yalnızca Profil Puanı)</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '10px', color: 'var(--text-secondary)' }}>
                    <p style={{ margin: 0, fontSize: '13px' }}>
                      Bu anket için Kalite Doğrulama Hizmeti uygulanmayacaktır. Bir sonraki adıma geçebilirsiniz.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 9 (NEW): Kalite Doğrulama Ödül Konfigürasyonu */}
            {wizardStep === 9 && (
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
                  9. Adım: 🎁 Kalite Doğrulama Ödül Havuzu Konfigürasyonu
                </h4>

                {!formVerificationEnabled ? (
                  <div style={{ padding: '24px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '10px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '13px' }}>
                      Kalite Doğrulama Hizmeti aktif edilmediği için bu adımda ödül konfigürasyonu gerekmemektedir. Sonraki adıma geçebilirsiniz.
                    </p>
                  </div>
                ) : (
                  <div>
                    {formVerificationRewardType === 'VOUCHER' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="admin-grid-2col" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                          <div>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Doğrulama Kupon Havuzu Adı</label>
                            <input
                              type="text"
                              value={formVerificationVoucherName}
                              onChange={(e) => setFormVerificationVoucherName(e.target.value)}
                              placeholder="Örn: 250 TL Hediye Çeki"
                              style={{ width: '100%', padding: '12px', marginTop: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Kupon Başı Değer (TL)</label>
                            <input
                              type="number"
                              value={formVerificationVoucherAmount}
                              onChange={(e) => setFormVerificationVoucherAmount(Number(e.target.value))}
                              placeholder="250"
                              style={{ width: '100%', padding: '12px', marginTop: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px' }}
                            />
                          </div>
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Toplu Doğrulama Kupon Kodları (Her satırda 1 kod)</label>
                            <span style={{ fontSize: '12px', color: 'var(--brand-navy)', fontWeight: 700 }}>
                              {formVerificationVoucherCodesText.split('\n').filter(s => s.trim()).length} Adet Kod Girildi
                            </span>
                          </div>
                          <textarea
                            rows={5}
                            value={formVerificationVoucherCodesText}
                            onChange={(e) => setFormVerificationVoucherCodesText(e.target.value)}
                            placeholder={"DOG-250-CODE-001\nDOG-250-CODE-002\nDOG-250-CODE-003"}
                            style={{ width: '100%', padding: '12px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px' }}
                          />
                          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Doğrulama anketini tamamlayan katılımcılara bu kod havuzundan anında tekil bir kod tahsis edilir.
                          </p>
                        </div>
                      </div>
                    )}

                    {formVerificationRewardType === 'MONEY' && (
                      <div className="admin-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Toplam Doğrulama Nakit Bütçesi (TL)</label>
                          <input
                            type="number"
                            value={formVerificationMoneyBudget}
                            onChange={(e) => setFormVerificationMoneyBudget(Number(e.target.value))}
                            style={{ width: '100%', padding: '12px', marginTop: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Kişi Başı Sabit Nakit Ödülü (TL)</label>
                          <input
                            type="number"
                            value={formVerificationMoneyPerUser}
                            onChange={(e) => setFormVerificationMoneyPerUser(Number(e.target.value))}
                            style={{ width: '100%', padding: '12px', marginTop: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px' }}
                          />
                        </div>
                      </div>
                    )}

                    {formVerificationRewardType === 'NONE' && (
                      <div style={{ padding: '18px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                        <p style={{ margin: 0, fontSize: '13px' }}>
                          Doğrulama anketi için ek finansal ödül tanımlanmamıştır. Katılımcılara yalnızca <strong>+{formVerificationScoreReward} Profil Puanı</strong> verilecektir.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 10: Schedule */}
            {wizardStep === 10 && (
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>10. Adım: Yayın Tarihi & Saat</h4>
                <div className="admin-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Başlangıç Tarihi</label>
                    <input type="datetime-local" value={formStartAt} onChange={(e) => setFormStartAt(e.target.value)} style={{ width: '100%', padding: '12px', marginTop: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Bitiş Tarihi</label>
                    <input type="datetime-local" value={formEndAt} onChange={(e) => setFormEndAt(e.target.value)} style={{ width: '100%', padding: '12px', marginTop: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 11: Preview & Summary */}
            {wizardStep === 11 && (
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>11. Adım: Önizleme & Konfigürasyon Özeti</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Ana Anket Özeti */}
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: 'var(--brand-navy)', fontSize: '14px' }}>📋 Ana Kampanya Anketi</span>
                      {formIsHighlighted && <span style={{ padding: '2px 8px', backgroundColor: '#FEF3C7', color: '#B45309', borderRadius: '4px', fontWeight: 700, fontSize: '11px' }}>⭐ Öne Çıkarılan</span>}
                    </div>
                    <p><strong>Sahip:</strong> {formOwnerType} {formOrgId && `(${formOrgId})`}</p>
                    <p><strong>Başlık:</strong> {formTitle || 'Başlık Girilmedi'}</p>
                    <p><strong>Kategori:</strong> {formCategory}</p>
                    <p><strong>Hedef Kitle:</strong> {formTargeting}</p>
                    <p><strong>Profil Puanı:</strong> +{formScoreReward} Puan</p>
                    <p><strong>Finansal Ödül:</strong> {formFinancialReward} {formFinancialReward === 'MONEY' && `(Bütçe: ${formMoneyBudget} TL)`}</p>
                    <p><strong>Soru Sayısı:</strong> {formQuestions.length} / 3</p>
                  </div>

                  {/* Kalite Doğrulama Alt Anket Özeti */}
                  <div style={{ padding: '16px', backgroundColor: formVerificationEnabled ? 'rgba(57, 119, 246, 0.06)' : 'var(--bg-surface-secondary)', border: formVerificationEnabled ? '1.5px solid rgba(57, 119, 246, 0.3)' : '1px solid var(--border-color)', borderRadius: '10px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: 'var(--brand-navy)', fontSize: '14px' }}>🛡️ Kalite Doğrulama Alt Anketi</span>
                      <span style={{ padding: '2px 8px', backgroundColor: formVerificationEnabled ? '#D1FAE5' : '#F3F4F6', color: formVerificationEnabled ? '#065F46' : '#6B7280', borderRadius: '4px', fontWeight: 700, fontSize: '11px' }}>
                        {formVerificationEnabled ? 'AKTİF' : 'PASİF'}
                      </span>
                    </div>
                    {formVerificationEnabled ? (
                      <>
                        <p><strong>Doğrulama Sorusu:</strong> {formVerificationQuestion}</p>
                        <p><strong>Cevap Seçenekleri:</strong> {formVerificationOptionsText}</p>
                        <p><strong>Arama / Katılımcı Kotası:</strong> PAG: {formPagTargetCount} kişi / Firma Kotası: {formOrgSelectionQuota} kişi</p>
                        <p><strong>Doğrulama Ödülü:</strong> {formVerificationRewardType === 'VOUCHER' ? `${formVerificationVoucherName} (${formVerificationVoucherAmount} TL) — [${formVerificationVoucherCodesText.split('\n').filter(s => s.trim()).length} Kupon Kodu]` : (formVerificationRewardType === 'MONEY' ? `${formVerificationMoneyBudget} TL Nakit Bütçe` : 'Yalnızca Profil Puanı')}</p>
                        <p><strong>Doğrulama Profil Puanı:</strong> +{formVerificationScoreReward} Puan</p>
                      </>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', margin: 0 }}>Bu anket için kalite doğrulama hizmeti uygulanmayacaktır.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 12: Submit & Approve */}
            {wizardStep === 12 && (
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>12. Adım: Onaya Gönder & Yayınla</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Süper Admin onayı alındıktan sonra anket verileri kilitlenecek ve soru snapshot'ı oluşturulacaktır.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <button
                    onClick={() => handleSaveSurvey('DRAFT')}
                    disabled={isSaving}
                    style={{
                      flex: 1,
                      minWidth: '130px',
                      padding: '12px',
                      backgroundColor: saveFeedback === 'saved' ? '#10B981' : 'var(--bg-surface)',
                      color: saveFeedback === 'saved' ? '#FFFFFF' : 'var(--text-primary)',
                      border: saveFeedback === 'saved' ? '1px solid #10B981' : '1px solid var(--border-highlight)',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      opacity: isSaving ? 0.6 : 1
                    }}
                  >
                    {isSaving ? '⏳ Kaydediliyor...' : saveFeedback === 'saved' ? '✓ Kaydedildi' : '💾 Taslak Kaydet'}
                  </button>
                  <button
                    onClick={() => handleSaveSurvey('PENDING_APPROVAL')}
                    disabled={isSaving}
                    style={{
                      flex: 1,
                      minWidth: '180px',
                      padding: '12px',
                      backgroundColor: saveFeedback === 'sent_approval' ? '#10B981' : 'var(--brand-navy)',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      opacity: isSaving ? 0.6 : 1,
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {isSaving ? '⏳ Gönderiliyor...' : saveFeedback === 'sent_approval' ? '✓ Onaya Gönderildi' : '🚀 Super Admin Onayına Gönder'}
                  </button>
                </div>
              </div>
            )}

            {/* Modal Controls with Direct Save Available on Any Step */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setWizardStep(Math.max(1, wizardStep - 1))}
                  disabled={wizardStep === 1}
                  style={{ padding: '10px 16px', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-highlight)', borderRadius: '8px', fontWeight: 600, opacity: wizardStep === 1 ? 0.5 : 1, cursor: 'pointer' }}
                >
                  ← Önceki
                </button>
                <button
                  type="button"
                  onClick={() => setWizardStep(Math.min(12, wizardStep + 1))}
                  disabled={wizardStep === 12}
                  style={{ padding: '10px 16px', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-highlight)', borderRadius: '8px', fontWeight: 700, opacity: wizardStep === 12 ? 0.5 : 1, cursor: 'pointer' }}
                >
                  Sonraki →
                </button>
              </div>

              {/* Direct Save Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleSaveSurvey('DRAFT')}
                  disabled={isSaving}
                  style={{
                    padding: '10px 18px',
                    backgroundColor: saveFeedback === 'saved' ? '#10B981' : 'var(--bg-surface)',
                    color: saveFeedback === 'saved' ? '#FFFFFF' : 'var(--text-primary)',
                    border: saveFeedback === 'saved' ? '1.5px solid #10B981' : '1.5px solid var(--brand-navy)',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: isSaving ? 0.6 : 1
                  }}
                >
                  {isSaving ? '⏳ Kaydediliyor...' : saveFeedback === 'saved' ? '✓ Kaydedildi' : '💾 Taslak Kaydet'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveSurvey('PENDING_APPROVAL')}
                  disabled={isSaving}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: saveFeedback === 'sent_approval' ? '#10B981' : 'var(--brand-navy)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: isSaving ? 0.6 : 1,
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {isSaving ? '⏳ Gönderiliyor...' : saveFeedback === 'sent_approval' ? '✓ Onaya Gönderildi' : '🚀 Onaya Gönder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Survey List Table */}
      <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
        Kampanya Anketleri
      </h3>

      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 500 }}>
          Anketler Yükleniyor...
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="table-desktop-view" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-surface-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '14px 16px' }}>ID</th>
                  <th style={{ padding: '14px 16px' }}>Başlık</th>
                  <th style={{ padding: '14px 16px' }}>Sahip</th>
                  <th style={{ padding: '14px 16px' }}>Durum</th>
                  <th style={{ padding: '14px 16px' }}>Cevaplanan / Katılımcı</th>
                  <th style={{ padding: '14px 16px' }}>Sorular</th>
                  <th style={{ padding: '14px 16px' }}>Ödül</th>
                  <th style={{ padding: '14px 16px' }}>Aksiyonlar</th>
                </tr>
              </thead>
              <tbody>
                {displayedSurveys.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      Bu filtreye veya aramaya uygun anket bulunamadı.
                    </td>
                  </tr>
                ) : (
                  displayedSurveys.map((s) => (
                    <tr key={s.surveyId || s.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '14px', color: 'var(--text-primary)' }}>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: '12px' }}>{s.surveyId || s.id}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span>{s.title}</span>
                          {s.category && <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>📁 {s.category}</span>}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-surface-secondary)', fontWeight: 600 }}>
                          {s.ownerType} {s.organizationId ? `(${s.organizationId})` : ''}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
                          backgroundColor: s.isArchived ? 'var(--bg-surface-secondary)' : s.status === 'ACTIVE' ? 'var(--success-bg)' : (s.status === 'PENDING_APPROVAL' || s.status === 'PENDING_ADMIN_APPROVAL') ? 'var(--warning-bg)' : s.status === 'SCHEDULED' ? 'var(--info-bg)' : 'var(--bg-surface-secondary)',
                          color: s.isArchived ? 'var(--text-secondary)' : s.status === 'ACTIVE' ? 'var(--success-color)' : (s.status === 'PENDING_APPROVAL' || s.status === 'PENDING_ADMIN_APPROVAL') ? 'var(--warning-color)' : s.status === 'SCHEDULED' ? 'var(--info-color)' : 'var(--text-secondary)',
                          border: s.isArchived ? '1px solid var(--border-color)' : s.status === 'ACTIVE' ? '1px solid var(--success-border)' : (s.status === 'PENDING_APPROVAL' || s.status === 'PENDING_ADMIN_APPROVAL') ? '1px solid var(--warning-border)' : s.status === 'SCHEDULED' ? '1px solid var(--info-border)' : '1px solid var(--border-color)'
                        }}>
                          {s.isArchived ? '📦 Arşiv' : s.status === 'ACTIVE' ? '🟢 Canlı' : (s.status === 'PENDING_APPROVAL' || s.status === 'PENDING_ADMIN_APPROVAL') ? '👑 Admin Onayı Bekliyor' : s.status === 'SCHEDULED' ? '⏰ Planlandı' : s.status === 'ENDED' || s.status === 'COMPLETED' ? '🏁 Tamamlandı' : '📝 Taslak'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--brand-navy)' }}>
                        👥 {s.completedCount ?? s.responseCount ?? 0} Yanıt
                      </td>
                      <td style={{ padding: '14px 16px' }}>{s.questionCount || (Array.isArray(s.questions) ? s.questions.length : 0)} / 3</td>
                      <td style={{ padding: '14px 16px' }}>+{s.profileScoreReward || 0} Puan</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {isAdmin && (
                            <button
                              onClick={() => handleToggleHighlight(s)}
                              title={s.isHighlighted ? "Öne çıkarılmayı kaldır" : "En üste öne çıkar"}
                              style={{
                                padding: '6px 8px',
                                backgroundColor: s.isHighlighted ? '#FEF3C7' : 'var(--bg-surface-secondary)',
                                color: s.isHighlighted ? '#D97706' : 'var(--text-secondary)',
                                border: s.isHighlighted ? '1px solid #F59E0B' : '1px solid var(--border-color)',
                                borderRadius: '6px',
                                fontSize: '13px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {s.isHighlighted ? '⭐' : '☆'}
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEditWizard(s)}
                            title="Anketi Düzenle / İncele"
                            style={{
                              padding: '6px 8px',
                              backgroundColor: 'var(--bg-surface-secondary)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border-highlight)',
                              borderRadius: '6px',
                              fontSize: '13px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ✏️
                          </button>
                          {isAdmin && (s.status === 'PENDING_ADMIN_APPROVAL' || s.status === 'PENDING_APPROVAL') && (
                            <button
                              onClick={() => handleApproveSurvey(s.surveyId || s.id)}
                              title="Admin Olarak Yayına Onayla"
                              style={{
                                padding: '6px 8px',
                                backgroundColor: 'var(--brand-navy)',
                                color: '#FFFFFF',
                                borderRadius: '6px',
                                fontSize: '13px',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              👑
                            </button>
                          )}
                          {isAdmin && (!s.isArchived ? (
                            <button
                              onClick={() => handleArchiveSurvey(s.surveyId || s.id, true)}
                              title="Anketi Arşivle"
                              style={{
                                padding: '6px 8px',
                                backgroundColor: 'var(--error-bg)',
                                color: 'var(--error-color)',
                                border: '1px solid var(--error-border)',
                                borderRadius: '6px',
                                fontSize: '13px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              📦
                            </button>
                          ) : (
                            <button
                              onClick={() => handleArchiveSurvey(s.surveyId || s.id, false)}
                              title="Arşivden Çıkar (Geri Al)"
                              style={{
                                padding: '6px 8px',
                                backgroundColor: 'var(--success-bg)',
                                color: 'var(--success-color)',
                                border: '1px solid var(--success-border)',
                                borderRadius: '6px',
                                fontSize: '13px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              📤
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Presentation */}
          <div className="card-mobile-view">
            {displayedSurveys.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', backgroundColor: 'var(--bg-surface)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                Bu filtreye veya aramaya uygun anket bulunamadı.
              </div>
            ) : (
              displayedSurveys.map((s) => (
                <div key={s.surveyId || s.id} style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{s.title}</h4>
                      {s.category && <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>📁 {s.category}</span>}
                    </div>
                    <span style={{
                      padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                      backgroundColor: s.isArchived ? 'var(--bg-surface-secondary)' : s.status === 'ACTIVE' ? 'var(--success-bg)' : (s.status === 'PENDING_APPROVAL' || s.status === 'PENDING_ADMIN_APPROVAL') ? 'var(--warning-bg)' : s.status === 'SCHEDULED' ? 'var(--info-bg)' : 'var(--bg-surface-secondary)',
                      color: s.isArchived ? 'var(--text-secondary)' : s.status === 'ACTIVE' ? 'var(--success-color)' : (s.status === 'PENDING_APPROVAL' || s.status === 'PENDING_ADMIN_APPROVAL') ? 'var(--warning-color)' : s.status === 'SCHEDULED' ? 'var(--info-color)' : 'var(--text-secondary)',
                      border: s.isArchived ? '1px solid var(--border-color)' : s.status === 'ACTIVE' ? '1px solid var(--success-border)' : (s.status === 'PENDING_APPROVAL' || s.status === 'PENDING_ADMIN_APPROVAL') ? '1px solid var(--warning-border)' : s.status === 'SCHEDULED' ? '1px solid var(--info-border)' : '1px solid var(--border-color)'
                    }}>
                      {s.isArchived ? '📦 Arşiv' : s.status === 'ACTIVE' ? '🟢 Canlı' : (s.status === 'PENDING_APPROVAL' || s.status === 'PENDING_ADMIN_APPROVAL') ? '👑 Admin Onayı' : s.status === 'SCHEDULED' ? '⏰ Planlandı' : s.status === 'ENDED' || s.status === 'COMPLETED' ? '🏁 Tamamlandı' : '📝 Taslak'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <div><strong>Sahip:</strong> {s.ownerType} {s.organizationId ? `(${s.organizationId})` : ''}</div>
                    <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}><strong>Cevaplanan / Katılımcı:</strong> 👥 {s.completedCount ?? s.responseCount ?? 0} Yanıt</div>
                    <div><strong>Soru Sayısı:</strong> {s.questionCount || (Array.isArray(s.questions) ? s.questions.length : 0)} / 3</div>
                    <div><strong>Profil Puanı:</strong> +{s.profileScoreReward || 0} Puan</div>
                    <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>ID: {s.surveyId || s.id}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {isAdmin && (
                      <button
                        onClick={() => handleToggleHighlight(s)}
                        title={s.isHighlighted ? "Öne çıkarılmayı kaldır" : "En üste öne çıkar"}
                        style={{
                          padding: '8px 14px',
                          backgroundColor: s.isHighlighted ? '#FEF3C7' : 'var(--bg-surface-secondary)',
                          color: s.isHighlighted ? '#D97706' : 'var(--text-secondary)',
                          border: s.isHighlighted ? '1px solid #F59E0B' : '1px solid var(--border-color)',
                          borderRadius: '8px',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        {s.isHighlighted ? '⭐' : '☆'}
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEditWizard(s)}
                      title="Anketi Düzenle / İncele"
                      style={{ padding: '8px 14px', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-highlight)', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
                    >
                      ✏️
                    </button>
                    {isAdmin && (s.status === 'PENDING_ADMIN_APPROVAL' || s.status === 'PENDING_APPROVAL') && (
                      <button
                        onClick={() => handleApproveSurvey(s.surveyId || s.id)}
                        title="Admin Yayına Onayla"
                        style={{ padding: '8px 14px', backgroundColor: 'var(--brand-navy)', color: '#FFFFFF', borderRadius: '8px', fontSize: '14px', border: 'none', cursor: 'pointer' }}
                      >
                        👑
                      </button>
                    )}
                    {isAdmin && (!s.isArchived ? (
                      <button
                        onClick={() => handleArchiveSurvey(s.surveyId || s.id, true)}
                        title="Arşivle"
                        style={{ padding: '8px 14px', backgroundColor: 'var(--error-bg)', color: 'var(--error-color)', border: '1px solid var(--error-border)', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
                      >
                        📦
                      </button>
                    ) : (
                      <button
                        onClick={() => handleArchiveSurvey(s.surveyId || s.id, false)}
                        title="Arşivden Çıkar (Geri Al)"
                        style={{ padding: '8px 14px', backgroundColor: 'var(--success-bg)', color: 'var(--success-color)', border: '1px solid var(--success-border)', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
                      >
                        📤
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination / Load More */}
          {allFilteredSurveys.length > displayLimit && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
              <button
                onClick={() => setDisplayLimit(prev => prev + 30)}
                style={{
                  padding: '12px 28px',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--brand-navy)',
                  border: '1.5px solid var(--brand-navy)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.15s ease'
                }}
              >
                Daha Fazla Göster ({displayedSurveys.length} / {allFilteredSurveys.length})
              </button>
            </div>
          )}
        </>
      )}

      {isJsonModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2100,
          padding: '16px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '750px',
            maxHeight: '92vh',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px 20px',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)' }}>
                  📥 JSON İle Anket / Kampanya Yükle & Taslak Oluştur
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Hazır bir Anket JSON verisi yapıştırın veya `.json` dosyası yükleyin.
                </p>
              </div>
              <button onClick={() => setIsJsonModalOpen(false)} style={{ color: 'var(--text-muted)', fontSize: '20px', background: 'none', minHeight: 'auto', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
              <input type="file" accept=".json" onChange={handleJsonFileUpload} style={{ fontSize: '13px' }} />
              <button
                type="button"
                onClick={() => setJsonInputText(sampleSurveyJson)}
                style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', cursor: 'pointer' }}
              >
                📋 Tek Anket Şablonu
              </button>
              <button
                type="button"
                onClick={() => setJsonInputText(sampleMultiSurveyJson)}
                style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(183,243,74,0.15)', color: '#CCFF00', fontWeight: 700, cursor: 'pointer' }}
              >
                📋 3-4 Anketli Liste Şablonu
              </button>
            </div>

            {jsonImportError && (
              <div style={{ padding: '10px 12px', backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '6px', fontSize: '13px', marginBottom: '12px' }}>
                {jsonImportError}
              </div>
            )}

            <textarea
              rows={14}
              value={jsonInputText}
              onChange={(e) => setJsonInputText(e.target.value)}
              placeholder="Anket JSON verisini buraya yapıştırın..."
              style={{
                width: '100%',
                fontFamily: 'monospace',
                fontSize: '12px',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: '#0F172A',
                color: '#CCFF00',
                marginBottom: '16px',
                resize: 'vertical'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={() => setIsJsonModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>İptal</button>
              <button
                type="button"
                onClick={handleImportJsonSurvey}
                disabled={isJsonImporting}
                style={{ padding: '8px 20px', borderRadius: '6px', backgroundColor: '#CCFF00', color: '#0F172A', fontWeight: 700, border: 'none', cursor: 'pointer' }}
              >
                {isJsonImporting ? 'Yükleniyor...' : '🚀 Yükle & Taslak Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
