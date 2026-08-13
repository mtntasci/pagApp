'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { collection, getDocs } from 'firebase/firestore';
import { db, functions } from '@/lib/firebase';

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

export default function SurveysPage() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'DRAFT' | 'PENDING' | 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'ARCHIVED'>('ALL');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSurveyId, setEditingSurveyId] = useState<string | null>(null);

  const [surveys, setSurveys] = useState<any[]>([]);

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
  const [formStoryImageCategory, setFormStoryImageCategory] = useState('Otomotiv');
  const [formQuestions, setFormQuestions] = useState([
    { id: 'q1', text: '1. Soru Metni', options: ['Seçenek 1', 'Seçenek 2'] }
  ]);
  const [formStartAt, setFormStartAt] = useState('2026-08-15T10:00');
  const [formEndAt, setFormEndAt] = useState('2026-08-30T23:59');
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

      const createOrUpdateFn = httpsCallable(functions, 'createOrUpdateSurveyAdmin');

      for (const surveyObj of items) {
        if (!surveyObj.title || !Array.isArray(surveyObj.questions) || surveyObj.questions.length === 0) {
          throw new Error('Geçersiz anket formatı. "title" ve en az 1 soru ("questions") gereklidir.');
        }

        const formattedQuestions = surveyObj.questions.map((q: any, idx: number) => ({
          questionId: q.id || q.questionId || `q${idx + 1}`,
          order: q.order || idx + 1,
          type: 'SINGLE_SELECT',
          text: q.questionText || q.text || `${idx + 1}. Soru`,
          options: (q.options || []).map((opt: any, oIdx: number) => ({
            optionId: typeof opt === 'object' ? (opt.optionId || `opt_${oIdx + 1}`) : `opt_${oIdx + 1}`,
            label: typeof opt === 'string' ? opt : (opt.label || `Seçenek ${oIdx + 1}`),
            order: typeof opt === 'object' ? (opt.order || oIdx + 1) : oIdx + 1
          }))
        }));

        const cleanedPayload = removeUndefinedFields({
          surveyId: surveyObj.surveyId || undefined,
          ownerType: surveyObj.ownerType || 'PAG',
          organizationId: surveyObj.organizationId || undefined,
          surveyType: surveyObj.surveyType || 'PAG',
          category: surveyObj.category || 'Genel',
          title: surveyObj.title.trim(),
          description: surveyObj.description || undefined,
          status: surveyObj.status || 'DRAFT',
          startAt: surveyObj.startAt ? new Date(surveyObj.startAt).toISOString() : new Date().toISOString(),
          endAt: surveyObj.endAt ? new Date(surveyObj.endAt).toISOString() : undefined,
          questions: formattedQuestions,
          targeting: surveyObj.targeting || { type: 'ALL' },
          profileScoreReward: Number(surveyObj.profileScoreReward) || 50,
          rewardDefinition: surveyObj.rewardDefinition || { rewardType: 'NONE' },
          storyConfig: surveyObj.storyConfig || undefined
        });

        await createOrUpdateFn(cleanedPayload);
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
      const listFn = httpsCallable(functions, 'listSurveysAdmin');
      const res: any = await listFn({});
      if (res.data?.success && Array.isArray(res.data.data?.surveys)) {
        setSurveys(res.data.data.surveys);
        setIsLoading(false);
        return;
      }
    } catch (err: any) {
      console.warn('Fetch Surveys Admin SDK error/fallback:', err);
    }

    try {
      const snap = await getDocs(collection(db, 'surveys'));
      const list = snap.docs.map(docSnap => {
        const d = docSnap.data();
        return {
          ...d,
          surveyId: docSnap.id
        };
      });
      setSurveys(list);
    } catch (fsErr) {
      console.error('Fetch Surveys Firestore fallback error:', fsErr);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

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
    setFormStoryImageCategory('Otomotiv');
    setFormQuestions([
      { id: 'q1', text: '1. Soru Metni', options: ['Seçenek 1', 'Seçenek 2'] }
    ]);
    setFormStartAt('2026-08-15T10:00');
    setFormEndAt('2026-08-30T23:59');
    setErrorMsg(null);
  };

  const handleOpenNewWizard = () => {
    resetWizardForm();
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const handleOpenEditWizard = (survey: any) => {
    setEditingSurveyId(survey.surveyId);
    setFormOwnerType(survey.ownerType || 'PAG');
    setFormOrgId(survey.organizationId || '');
    setFormTitle(survey.title || '');
    setFormDesc(survey.description || '');
    setFormSurveyType(survey.surveyType || 'PAG');
    setFormCategory(survey.category || 'Genel');
    setFormTargeting(survey.targeting?.type || 'ALL');
    if (survey.targeting?.profileFilters) {
      setFormProfileMinAge(survey.targeting.profileFilters.minAge ? String(survey.targeting.profileFilters.minAge) : '');
      setFormProfileMaxAge(survey.targeting.profileFilters.maxAge ? String(survey.targeting.profileFilters.maxAge) : '');
      setFormProfileMaritalStatus(survey.targeting.profileFilters.maritalStatus || 'ALL');
      setFormProfileChildrenStatus(survey.targeting.profileFilters.childrenStatus || 'ALL');
      setFormProfileHometown(survey.targeting.profileFilters.hometown || '');
    }
    setFormScoreReward(survey.profileScoreReward || 50);
    if (survey.rewardDefinition) {
      setFormFinancialReward(survey.rewardDefinition.rewardType || 'NONE');
      setFormMoneyModel(survey.rewardDefinition.distributionModel || 'RANKED');
      setFormMoneyBudget(survey.rewardDefinition.totalBudget || 1000);
      if (Array.isArray(survey.rewardDefinition.rankedRules)) {
        setFormRank1(survey.rewardDefinition.rankedRules[0]?.amount || 300);
        setFormRank2(survey.rewardDefinition.rankedRules[1]?.amount || 200);
        setFormRank3(survey.rewardDefinition.rankedRules[2]?.amount || 100);
      }
      setFormVoucherName(survey.rewardDefinition.voucherPoolName || '');
    } else {
      setFormFinancialReward('NONE');
    }
    setFormShowStory(survey.storyConfig?.showInStory || false);
    setFormStoryLabel(survey.storyConfig?.storyLabel || '');
    setFormStoryImageCategory(survey.storyConfig?.imageCategory || 'Otomotiv');

    if (Array.isArray(survey.questions) && survey.questions.length > 0) {
      setFormQuestions(survey.questions.map((q: any, idx: number) => ({
        id: q.questionId || `q${idx + 1}`,
        text: q.text || '',
        options: Array.isArray(q.options)
          ? q.options.map((opt: any) => typeof opt === 'string' ? opt : (opt.label || ''))
          : ['Seçenek 1', 'Seçenek 2']
      })));
    }

    if (survey.startAt) {
      const d = new Date(survey.startAt);
      if (!isNaN(d.getTime())) {
        setFormStartAt(d.toISOString().slice(0, 16));
      }
    }
    if (survey.endAt) {
      const d = new Date(survey.endAt);
      if (!isNaN(d.getTime())) {
        setFormEndAt(d.toISOString().slice(0, 16));
      }
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

    setIsSaving(true);
    setErrorMsg(null);
    try {
      const formattedQuestions = formQuestions.map((q, idx) => ({
        questionId: q.id || `q${idx + 1}`,
        order: idx + 1,
        type: 'SINGLE_SELECT',
        text: q.text,
        options: q.options.map((optText, oIdx) => ({
          optionId: `opt_${oIdx + 1}`,
          label: typeof optText === 'string' ? optText : (optText as any).label || `Seçenek ${oIdx + 1}`,
          order: oIdx + 1
        }))
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

      const rawPayload = {
        surveyId: editingSurveyId || undefined,
        ownerType: formOwnerType,
        organizationId: formOwnerType === 'ORGANIZATION' ? (formOrgId || undefined) : undefined,
        surveyType: formSurveyType,
        category: formCategory,
        title: formTitle,
        description: formDesc || undefined,
        status: targetStatus,
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
        storyConfig: {
          showInStory: formShowStory,
          storyLabel: formShowStory ? formStoryLabel : undefined,
          imageCategory: formShowStory ? formStoryImageCategory : undefined
        }
      };

      // Sanitize payload: guaranteed recursive removal of any undefined properties
      const cleanedPayload = removeUndefinedFields(rawPayload);

      // Authoritative Firebase Admin SDK backend execution via Cloud Function callable
      const createOrUpdateFn = httpsCallable(functions, 'createOrUpdateSurveyAdmin');
      const res: any = await createOrUpdateFn(cleanedPayload);

      if (res.data?.success) {
        setIsWizardOpen(false);
        resetWizardForm();
        await fetchSurveys();
      } else {
        throw new Error(res.data?.error || 'Sunucu yazma hatası');
      }
    } catch (err: any) {
      console.error('Save Survey Admin SDK Error:', err);
      setErrorMsg('Kayıt Hatası: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchiveSurvey = async (surveyId: string, archive: boolean) => {
    try {
      const archiveFn = httpsCallable(functions, 'archiveSurveyAdmin');
      const res: any = await archiveFn({ surveyId, archive });
      if (res.data?.success) {
        await fetchSurveys();
      } else {
        alert('Arşivleme hatası: ' + (res.data?.error || 'Bilinmeyen hata'));
      }
    } catch (err: any) {
      console.error('Archive Survey Error:', err);
      alert('Arşivleme hatası: ' + (err.message || 'Bilinmeyen hata'));
    }
  };

  const handleApproveSurvey = async (surveyId: string) => {
    try {
      const approveFn = httpsCallable(functions, 'approveSurveyAdmin');
      const res: any = await approveFn({ surveyId });
      if (res.data?.success) {
        await fetchSurveys();
      } else {
        alert('Onaylama hatası: ' + (res.data?.error || 'Bilinmeyen hata'));
      }
    } catch (err: any) {
      console.error('Approve Survey Error:', err);
      alert('Onaylama hatası: ' + (err.message || 'Bilinmeyen hata'));
    }
  };

  const filteredSurveys = surveys.filter(s => {
    if (activeTab === 'ALL') return !s.isArchived;
    if (activeTab === 'ARCHIVED') return s.isArchived;
    if (s.isArchived) return false;
    if (activeTab === 'DRAFT') return s.status === 'DRAFT';
    if (activeTab === 'PENDING') return s.status === 'PENDING_APPROVAL';
    if (activeTab === 'SCHEDULED') return s.status === 'SCHEDULED';
    if (activeTab === 'ACTIVE') return s.status === 'ACTIVE';
    if (activeTab === 'ENDED') return s.status === 'ENDED';
    return true;
  });

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
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        {[
          { key: 'ALL', label: 'Tüm Aktifler' },
          { key: 'DRAFT', label: 'Taslaklar' },
          { key: 'PENDING', label: 'Onay Bekleyenler' },
          { key: 'SCHEDULED', label: 'Planlananlar' },
          { key: 'ACTIVE', label: 'Canlı Anketler' },
          { key: 'ENDED', label: 'Tamamlananlar' },
          { key: 'ARCHIVED', label: 'Arşiv' }
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              backgroundColor: activeTab === t.key ? 'var(--brand-navy)' : 'transparent',
              color: activeTab === t.key ? '#FFFFFF' : 'var(--text-secondary)',
              border: activeTab === t.key ? '1px solid var(--brand-navy)' : '1px solid transparent',
              flexShrink: 0
            }}
          >
            {t.label}
          </button>
        ))}
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
                  {editingSurveyId ? 'Anket Düzenle' : 'Kampanya Hazırlama Sihirbazı'} (Adım {wizardStep} / 10)
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Uçtan Uca Kampanya Konfigürasyonu</p>
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

            {/* 10-Step Touch-Scrollable Indicator */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '20px', paddingBottom: '4px' }}>
              {Array.from({ length: 10 }).map((_, i) => {
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
                      <option value="org_ford">Ford Otosan</option>
                      <option value="org_mcdonalds">McDonald's Türkiye</option>
                      <option value="org_nike">Nike Türkiye</option>
                    </select>
                  </div>
                )}
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
                      <option value="Otomotiv">Otomotiv</option>
                      <option value="Yeme / İçme">Yeme / İçme</option>
                      <option value="Teknoloji">Teknoloji</option>
                      <option value="Spor">Spor</option>
                      <option value="Genel">Genel</option>
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

            {/* Step 4: Rewards */}
            {wizardStep === 4 && (
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>4. Adım: Profil Puanı & Ödül</h4>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Profil Puanı Ödülü (Profile Score)</label>
                  <input
                    type="number" value={formScoreReward} onChange={(e) => setFormScoreReward(Number(e.target.value))}
                    style={{ width: '100%', padding: '12px', marginTop: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Finansal Ödül Tipi</label>
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

            {/* Step 5: Money / Voucher */}
            {wizardStep === 5 && (
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>5. Adım: Ödül Detay Konfigürasyonu</h4>
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
                      <input type="text" value={formVoucherName} onChange={(e) => setFormVoucherName(e.target.value)} placeholder="Örn: Ford 200 TL Bakım Çeki" style={{ width: '100%', padding: '12px', marginTop: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px' }} />
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

            {/* Step 6: Story */}
            {wizardStep === 6 && (
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>6. Adım: Story / Görsel Konfigürasyonu</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <input type="checkbox" checked={formShowStory} onChange={(e) => setFormShowStory(e.target.checked)} id="storyCheck" style={{ width: '18px', height: '18px' }} />
                  <label htmlFor="storyCheck" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Story Bar'da Göster</label>
                </div>
                {formShowStory && (
                  <div className="admin-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Kısa Story Etiketi (Label)</label>
                      <input type="text" value={formStoryLabel} onChange={(e) => setFormStoryLabel(e.target.value)} placeholder="Örn: Ford Özel" style={{ width: '100%', padding: '12px', marginTop: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Kategori Görseli (Preset Asset)</label>
                      <select value={formStoryImageCategory} onChange={(e) => setFormStoryImageCategory(e.target.value)} style={{ width: '100%', padding: '12px', marginTop: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '8px' }}>
                        <option value="Otomotiv">Otomotiv Görseli</option>
                        <option value="Yeme / İçme">Yeme / İçme Görseli</option>
                        <option value="Teknoloji">Teknoloji Görseli</option>
                        <option value="Spor">Spor Görseli</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 7: Questions */}
            {wizardStep === 7 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>7. Adım: Sorular (Max 3 / Mevcut: {formQuestions.length})</h4>
                  <button onClick={handleAddQuestion} disabled={formQuestions.length >= 3} style={{ padding: '8px 14px', backgroundColor: formQuestions.length >= 3 ? 'var(--bg-surface-secondary)' : 'var(--brand-navy)', color: formQuestions.length >= 3 ? 'var(--text-muted)' : '#FFFFFF', fontWeight: 700, borderRadius: '6px', fontSize: '12px' }}>+ Soru Ekle</button>
                </div>
                {formQuestions.map((q, idx) => (
                  <div key={q.id || idx} style={{ padding: '16px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '10px', marginBottom: '14px', border: '1px solid var(--border-color)' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{idx + 1}. Soru Metni</label>
                      <input
                        type="text"
                        value={q.text}
                        onChange={(e) => {
                          const updated = [...formQuestions];
                          updated[idx].text = e.target.value;
                          setFormQuestions(updated);
                        }}
                        style={{ width: '100%', padding: '10px', marginTop: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '6px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Seçenekler (Virgülle ayırın)</label>
                      <input
                        type="text"
                        value={q.options.join(', ')}
                        onChange={(e) => {
                          const updated = [...formQuestions];
                          updated[idx].options = e.target.value.split(',').map(s => s.trim());
                          setFormQuestions(updated);
                        }}
                        style={{ width: '100%', padding: '10px', marginTop: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', borderRadius: '6px' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 8: Schedule */}
            {wizardStep === 8 && (
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>8. Adım: Yayın Tarihi & Saat</h4>
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

            {/* Step 9: Preview */}
            {wizardStep === 9 && (
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>9. Adım: Önizleme & Konfigürasyon Özeti</h4>
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-primary)' }}>
                  <p><strong>Sahip:</strong> {formOwnerType} {formOrgId && `(${formOrgId})`}</p>
                  <p><strong>Başlık:</strong> {formTitle || 'Başlık Girilmedi'}</p>
                  <p><strong>Hedef Kitle:</strong> {formTargeting}</p>
                  <p><strong>Profil Puanı:</strong> +{formScoreReward} Puan</p>
                  <p><strong>Finansal Ödül:</strong> {formFinancialReward} {formFinancialReward === 'MONEY' && `(Bütçe: ${formMoneyBudget} TL)`}</p>
                  <p><strong>Soru Sayısı:</strong> {formQuestions.length} / 3</p>
                </div>
              </div>
            )}

            {/* Step 10: Submit & Approve */}
            {wizardStep === 10 && (
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>10. Adım: Onaya Gönder & Yayınla</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Süper Admin onayı alındıktan sonra anket verileri kilitlenecek ve soru snapshot'ı oluşturulacaktır.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <button
                    onClick={() => handleSaveSurvey('DRAFT')}
                    disabled={isSaving}
                    style={{ flex: 1, minWidth: '130px', padding: '12px', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-highlight)', borderRadius: '8px', fontWeight: 600, fontSize: '13px', opacity: isSaving ? 0.6 : 1 }}
                  >
                    {isSaving ? 'Kaydediliyor...' : 'Taslak Kaydet'}
                  </button>
                  <button
                    onClick={() => handleSaveSurvey('PENDING_APPROVAL')}
                    disabled={isSaving}
                    style={{ flex: 1, minWidth: '180px', padding: '12px', backgroundColor: 'var(--brand-navy)', color: '#FFFFFF', borderRadius: '8px', fontWeight: 700, fontSize: '13px', opacity: isSaving ? 0.6 : 1, boxShadow: 'var(--shadow-sm)' }}
                  >
                    {isSaving ? 'Gönderiliyor...' : 'Super Admin Onayına Gönder'}
                  </button>
                </div>
              </div>
            )}

            {/* Modal Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <button onClick={() => setWizardStep(Math.max(1, wizardStep - 1))} disabled={wizardStep === 1} style={{ flex: 1, padding: '10px', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-highlight)', borderRadius: '8px', fontWeight: 600, opacity: wizardStep === 1 ? 0.5 : 1 }}>Önceki</button>
              <button onClick={() => setWizardStep(Math.min(10, wizardStep + 1))} disabled={wizardStep === 10} style={{ flex: 1, padding: '10px', backgroundColor: 'var(--brand-navy)', color: '#FFFFFF', fontWeight: 700, borderRadius: '8px', opacity: wizardStep === 10 ? 0.5 : 1 }}>Sonraki</button>
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
                  <th style={{ padding: '14px 16px' }}>Sorular</th>
                  <th style={{ padding: '14px 16px' }}>Ödül</th>
                  <th style={{ padding: '14px 16px' }}>Aksiyonlar</th>
                </tr>
              </thead>
              <tbody>
                {filteredSurveys.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      Bu filtreye uygun anket bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredSurveys.map((s) => (
                    <tr key={s.surveyId} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '14px', color: 'var(--text-primary)' }}>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{s.surveyId}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>{s.title}</td>
                      <td style={{ padding: '14px 16px' }}>{s.ownerType}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
                          backgroundColor: s.status === 'ACTIVE' ? 'var(--success-bg)' : s.status === 'PENDING_APPROVAL' ? 'var(--warning-bg)' : s.status === 'SCHEDULED' ? 'var(--info-bg)' : 'var(--bg-surface-secondary)',
                          color: s.status === 'ACTIVE' ? 'var(--success-color)' : s.status === 'PENDING_APPROVAL' ? 'var(--warning-color)' : s.status === 'SCHEDULED' ? 'var(--info-color)' : 'var(--text-secondary)',
                          border: s.status === 'ACTIVE' ? '1px solid var(--success-border)' : s.status === 'PENDING_APPROVAL' ? '1px solid var(--warning-border)' : s.status === 'SCHEDULED' ? '1px solid var(--info-border)' : '1px solid var(--border-color)'
                        }}>
                          {s.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>{s.questionCount || (Array.isArray(s.questions) ? s.questions.length : 0)} / 3</td>
                      <td style={{ padding: '14px 16px' }}>+{s.profileScoreReward || 0} Puan</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleOpenEditWizard(s)}
                            style={{ padding: '6px 12px', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-highlight)', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}
                          >
                            Düzenle
                          </button>
                          {s.status === 'PENDING_APPROVAL' && (
                            <button onClick={() => handleApproveSurvey(s.surveyId)} style={{ padding: '6px 12px', backgroundColor: 'var(--brand-navy)', color: '#FFFFFF', fontWeight: 700, borderRadius: '6px', fontSize: '12px' }}>Onayla</button>
                          )}
                          {!s.isArchived ? (
                            <button onClick={() => handleArchiveSurvey(s.surveyId, true)} style={{ padding: '6px 12px', backgroundColor: 'var(--error-bg)', color: 'var(--error-color)', border: '1px solid var(--error-border)', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>Arşivle</button>
                          ) : (
                            <button onClick={() => handleArchiveSurvey(s.surveyId, false)} style={{ padding: '6px 12px', backgroundColor: 'var(--success-bg)', color: 'var(--success-color)', border: '1px solid var(--success-border)', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>Geri Al</button>
                          )}
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
            {filteredSurveys.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', backgroundColor: 'var(--bg-surface)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                Bu filtreye uygun anket bulunamadı.
              </div>
            ) : (
              filteredSurveys.map((s) => (
                <div key={s.surveyId} style={{
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
                    <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{s.title}</h4>
                    <span style={{
                      padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                      backgroundColor: s.status === 'ACTIVE' ? 'var(--success-bg)' : s.status === 'PENDING_APPROVAL' ? 'var(--warning-bg)' : s.status === 'SCHEDULED' ? 'var(--info-bg)' : 'var(--bg-surface-secondary)',
                      color: s.status === 'ACTIVE' ? 'var(--success-color)' : s.status === 'PENDING_APPROVAL' ? 'var(--warning-color)' : s.status === 'SCHEDULED' ? 'var(--info-color)' : 'var(--text-secondary)',
                      border: s.status === 'ACTIVE' ? '1px solid var(--success-border)' : s.status === 'PENDING_APPROVAL' ? '1px solid var(--warning-border)' : s.status === 'SCHEDULED' ? '1px solid var(--info-border)' : '1px solid var(--border-color)'
                    }}>
                      {s.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <div><strong>Sahip:</strong> {s.ownerType}</div>
                    <div><strong>Soru Sayısı:</strong> {s.questionCount || (Array.isArray(s.questions) ? s.questions.length : 0)} / 3</div>
                    <div><strong>Profil Puanı:</strong> +{s.profileScoreReward || 0} Puan</div>
                    <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>ID: {s.surveyId}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button
                      onClick={() => handleOpenEditWizard(s)}
                      style={{ flex: 1, padding: '10px', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-highlight)', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
                    >
                      Düzenle
                    </button>
                    {s.status === 'PENDING_APPROVAL' && (
                      <button onClick={() => handleApproveSurvey(s.surveyId)} style={{ flex: 1, padding: '10px', backgroundColor: 'var(--brand-navy)', color: '#FFFFFF', fontWeight: 700, borderRadius: '8px', fontSize: '13px' }}>Onayla</button>
                    )}
                    {!s.isArchived ? (
                      <button onClick={() => handleArchiveSurvey(s.surveyId, true)} style={{ flex: 1, padding: '10px', backgroundColor: 'var(--error-bg)', color: 'var(--error-color)', border: '1px solid var(--error-border)', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>Arşivle</button>
                    ) : (
                      <button onClick={() => handleArchiveSurvey(s.surveyId, false)} style={{ flex: 1, padding: '10px', backgroundColor: 'var(--success-bg)', color: 'var(--success-color)', border: '1px solid var(--success-border)', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>Geri Al</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
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
                📋 Örnek Şablon Yapıştır
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
