'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export interface VerificationCampaign {
  id: string;
  masterSurveyId: string;
  masterSurveyTitle: string;
  organizationId: string | null;
  status: string;
  requestedCount: number;
  customerSelectedCount: number;
  randomSelectedCount: number;
  verificationSurveyId: string;
  verificationRewardSummary: string;
  createdAt: string;
}

export interface MaskedRespondent {
  userId: string;
  anonymousRef: string;
  userDisplayName: string;
  maskedPhone: string;
  city: any;
  gender: string;
  age: number;
  completedAt: string | null;
}

export interface CampaignStats {
  total: number;
  totalAssigned?: number;
  customerSelected?: number;
  randomSelected?: number;
  pending?: number;
  called: number;
  reached?: number;
  accepted?: number;
  declined: number;
  noAnswer: number;
  callBackLater: number;
  wrongPerson: number;
  pushSent: number;
  completed: number;
  completionRate: number;
  reachRate: number;
}

function formatCityName(val: any): string {
  if (!val) return 'İstanbul';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    return val.cityName || val.name || val.city || val.districtName || 'İstanbul';
  }
  return String(val);
}

function formatSafeDateString(val: any): string {
  if (!val) return '—';
  try {
    if (typeof val === 'string') {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      }
    }
    if (typeof val === 'number') {
      const d = new Date(val > 1e11 ? val : val * 1000);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      }
    }
    if (typeof val === 'object') {
      if (typeof val.toDate === 'function') {
        const d = val.toDate();
        if (!isNaN(d.getTime())) return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      }
      if (typeof val._seconds === 'number') {
        const d = new Date(val._seconds * 1000);
        if (!isNaN(d.getTime())) return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      }
      if (typeof val.seconds === 'number') {
        const d = new Date(val.seconds * 1000);
        if (!isNaN(d.getTime())) return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      }
    }
  } catch (e) {
    // fallback
  }
  return '—';
}

function VerificationCampaignsContent() {
  const { isAdmin, isOrgUser, portalUser } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentView = searchParams.get('view') || (isOrgUser ? 'ORG' : 'PAG');
  const isOrgView = currentView === 'ORG' || isOrgUser;
  const [activeTab, setActiveTab] = useState<'CAMPAIGNS' | 'CREATE_CAMPAIGN'>('CREATE_CAMPAIGN');

  // Campaigns List
  const [campaigns, setCampaigns] = useState<VerificationCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaignDetail, setSelectedCampaignDetail] = useState<{ campaign: any; stats: CampaignStats } | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // New Campaign & Respondent Selector State
  const [availableSurveys, setAvailableSurveys] = useState<any[]>([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState('');
  const [surveyMetadata, setSurveyMetadata] = useState<{
    pagTargetCount: number;
    orgSelectionQuota: number;
    verificationRewardSummary: string;
  }>({
    pagTargetCount: 50,
    orgSelectionQuota: 20,
    verificationRewardSummary: '250 TL Hediye Çeki'
  });

  const [respondents, setRespondents] = useState<MaskedRespondent[]>([]);
  const [isLoadingRespondents, setIsLoadingRespondents] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Demographic Filters for Respondent Selection
  const [filterCity, setFilterCity] = useState<string>('ALL');
  const [filterGender, setFilterGender] = useState<string>('ALL');
  const [filterMinAge, setFilterMinAge] = useState<string>('');
  const [filterMaxAge, setFilterMaxAge] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Fetch campaigns
  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/admin/surveys');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.surveys)) {
          let list = json.data.surveys
            .filter((s: any) => s.hasVerification)
            .map((s: any) => ({
              id: s.id,
              masterSurveyId: s.id,
              masterSurveyTitle: s.title,
              organizationId: s.organizationId || null,
              status: s.status,
              requestedCount: s.verificationTargetCount || 50,
              customerSelectedCount: s.verificationOrgQuota || 20,
              randomSelectedCount: (s.verificationTargetCount || 50) - (s.verificationOrgQuota || 20),
              verificationSurveyId: s.id,
              verificationRewardSummary: s.rewardDefinition?.description || 'Ödül',
              createdAt: s.createdAt
            }));

          if (isOrgUser && portalUser?.organizationId) {
            list = list.filter((c: any) => c.organizationId === portalUser.organizationId);
          }
          setCampaigns(list);
        } else {
          setCampaigns([]);
        }
      } else {
        setCampaigns([]);
      }
    } catch (err) {
      console.warn('Fetch verification campaigns error:', err);
      setCampaigns([]);
    } finally {
      setIsLoading(false);
    }
  }, [isOrgUser, portalUser]);

  // 2. Fetch available surveys for selection
  const fetchSurveys = useCallback(async () => {
    let list: any[] = [];
    try {
      const res = await fetch('/api/v1/admin/surveys');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.surveys)) {
          list = json.data.surveys;
        }
      }
    } catch (neonErr) {
      console.warn('Fetch surveys error:', neonErr);
    }

    // Tenant isolation for org user
    if (isOrgUser && portalUser?.organizationId) {
      list = list.filter(s => s.organizationId === portalUser.organizationId);
    }

    // STRICT FILTER: Only surveys marked for Quality Verification
    list = list.filter(s =>
      s.hasVerification === true ||
      s.isVerificationEnabled === true ||
      s.verificationConfig?.enabled === true ||
      (typeof s.verificationTargetCount === 'number' && s.verificationTargetCount > 0) ||
      s.surveyType === 'VERIFICATION'
    );

    setAvailableSurveys(list);

    if (list.length > 0) {
      const currentExists = list.some(s => s.surveyId === selectedSurveyId);
      const chosen = currentExists ? list.find(s => s.surveyId === selectedSurveyId) : list[0];
      if (chosen) {
        if (!selectedSurveyId || !currentExists) {
          setSelectedSurveyId(chosen.surveyId);
        }
        const vConfig = chosen.verificationConfig || {};
        setSurveyMetadata({
          pagTargetCount: vConfig.pagTargetCount || 50,
          orgSelectionQuota: vConfig.orgSelectionQuota || 20,
          verificationRewardSummary: vConfig.rewardDefinition?.voucherPoolName || vConfig.verificationRewardSummary || '250 TL Hediye Çeki'
        });
      }
    }
  }, [selectedSurveyId, isOrgUser, portalUser]);

  const handleSelectSurvey = (sId: string) => {
    setSelectedSurveyId(sId);
    setSelectedUserIds([]);
    const found = availableSurveys.find(s => s.surveyId === sId);
    if (found) {
      const vConfig = found.verificationConfig || {};
      setSurveyMetadata({
        pagTargetCount: vConfig.pagTargetCount || 50,
        orgSelectionQuota: vConfig.orgSelectionQuota || 20,
        verificationRewardSummary: vConfig.rewardDefinition?.voucherPoolName || vConfig.verificationRewardSummary || '250 TL Hediye Çeki'
      });
    }
  };

  // 3. Load respondents with filters (manual search trigger)
  const loadRespondents = useCallback(
    async (surveyId?: string, overrideFilters?: any) => {
      const targetId = surveyId || selectedSurveyId;
      if (!targetId) return;
      setIsLoadingRespondents(true);
      try {
        const cCity = overrideFilters?.city !== undefined ? overrideFilters.city : filterCity;
        const cGender = overrideFilters?.gender !== undefined ? overrideFilters.gender : filterGender;
        const cMinAge = overrideFilters?.minAge !== undefined ? overrideFilters.minAge : filterMinAge;
        const cMaxAge = overrideFilters?.maxAge !== undefined ? overrideFilters.maxAge : filterMaxAge;
        const cSearch = overrideFilters?.search !== undefined ? overrideFilters.search : searchQuery;

        const params = new URLSearchParams({
          surveyId: targetId,
          city: cCity !== 'ALL' ? cCity : '',
          gender: cGender !== 'ALL' ? cGender : '',
          minAge: cMinAge || '',
          maxAge: cMaxAge || '',
          search: cSearch.trim() || ''
        });
        const apiRes = await fetch(`/api/v1/admin/verification/respondents?${params.toString()}`);
        const apiData = await apiRes.json();
        if (apiData.success && apiData.data && Array.isArray(apiData.data.respondents)) {
          setRespondents(apiData.data.respondents);
          setSurveyMetadata({
            pagTargetCount: apiData.data.pagTargetCount || 50,
            orgSelectionQuota: apiData.data.orgSelectionQuota || 20,
            verificationRewardSummary: apiData.data.verificationRewardSummary || '250 TL Hediye Çeki'
          });
        }
      } catch (err) {
        console.error('Fetch Respondents Error:', err);
      } finally {
        setIsLoadingRespondents(false);
      }
    },
    [selectedSurveyId, filterCity, filterGender, filterMinAge, filterMaxAge, searchQuery]
  );

  useEffect(() => {
    fetchCampaigns();
    fetchSurveys();
  }, [fetchCampaigns, fetchSurveys]);

  // Initial load when survey changes
  useEffect(() => {
    if (selectedSurveyId && activeTab === 'CREATE_CAMPAIGN') {
      loadRespondents(selectedSurveyId);
    }
  }, [selectedSurveyId, activeTab]);

  // Toggle Single User
  const handleToggleUser = (uid: string) => {
    const maxQuota = isOrgView ? surveyMetadata.orgSelectionQuota : Math.max(1, surveyMetadata.pagTargetCount - surveyMetadata.orgSelectionQuota);
    setSelectedUserIds(prev => {
      if (prev.includes(uid)) {
        return prev.filter(id => id !== uid);
      } else {
        if (prev.length >= maxQuota) {
          alert(`${isOrgView ? 'Firma' : 'PAG'} seçim kotası maksimum ${maxQuota} katılımcıdır.`);
          return prev;
        }
        return [...prev, uid];
      }
    });
  };

  // Submit and Create Verification Campaign
  const handleCreateCampaign = async () => {
    if (!selectedSurveyId) {
      alert('Lütfen bir anket seçiniz.');
      return;
    }

    if (isOrgView) {
      const confirmMsg = `Firmanız adına seçilen ${selectedUserIds.length} katılımcı listesi PAG yetkililerine iletilsin mı?\n\n- Firma Tarafından Seçilen: ${selectedUserIds.length} / ${surveyMetadata.orgSelectionQuota} Katılımcı\n- Kalan PAG Tamamlaması: ${Math.max(0, surveyMetadata.pagTargetCount - selectedUserIds.length)} Katılımcı\n- Toplam Arama Hedefi: ${surveyMetadata.pagTargetCount} Katılımcı`;
      if (!confirm(confirmMsg)) return;

      setIsCreating(true);
      try {
        const res = await fetch('/api/v1/admin/verification/campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            masterSurveyId: selectedSurveyId,
            customerSelectedUserIds: selectedUserIds,
            randomSelectedCount: Math.max(0, surveyMetadata.pagTargetCount - selectedUserIds.length),
            verificationRewardSummary: surveyMetadata.verificationRewardSummary
          })
        });
        const data = await res.json();

        if (data?.success) {
          setSuccessBanner(`✅ Firma katılımcı seçiminiz (${selectedUserIds.length} kişi) başarıyla kaydedildi ve PAG onayına iletildi.`);
          setActiveTab('CAMPAIGNS');
          await fetchCampaigns();
        } else {
          alert(data?.error || 'Kampanya oluşturulamadı.');
        }
      } catch (err: any) {
        console.error('Create Campaign Error:', err);
        alert('İşlem sırasında hata: ' + (err.message || 'Bilinmeyen hata'));
      } finally {
        setIsCreating(false);
      }
      return;
    }

    // Super Admin Launch Flow
    const remainingToFill = Math.max(0, surveyMetadata.pagTargetCount - selectedUserIds.length);
    const confirmMsg = `PAG Kalite Doğrulama Kampanyası Başlatılsın mı?\n\n- Firma Seçimi: ${selectedUserIds.length} Katılımcı\n- PAG Tarafından Random Tamamlanacak: ${remainingToFill} Katılımcı\n- Toplam Arama Havuzu: ${surveyMetadata.pagTargetCount} Katılımcı\n- Ödül: ${surveyMetadata.verificationRewardSummary}`;

    if (!confirm(confirmMsg)) return;

    setIsCreating(true);
    try {
      const res = await fetch('/api/v1/admin/verification/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masterSurveyId: selectedSurveyId,
          customerSelectedUserIds: selectedUserIds,
          randomSelectedCount: remainingToFill,
          verificationRewardSummary: surveyMetadata.verificationRewardSummary
        })
      });
      const data = await res.json();

      if (data?.success) {
        setSuccessBanner(`✅ Kalite Doğrulama Kampanyası başarıyla oluşturuldu! Toplam ${data.data?.requestedCount || 0} katılımcı çağrı merkezine aktarıldı.`);
        setSelectedUserIds([]);
        setActiveTab('CAMPAIGNS');
        await fetchCampaigns();
      } else {
        alert(data?.error || 'Kampanya oluşturulamadı.');
      }
    } catch (err: any) {
      console.error('Create Campaign Error:', err);
      alert('Kampanya oluşturulurken hata: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setIsCreating(false);
    }
  };

  // View Campaign Detail
  const handleOpenDetail = async (campaignId: string) => {
    setIsDetailLoading(true);
    try {
      const found = campaigns.find(c => c.id === campaignId);
      if (found) {
        setSelectedCampaignDetail({
          campaign: found,
          stats: {
            total: found.requestedCount,
            called: 0,
            pending: found.requestedCount,
            accepted: 0,
            declined: 0,
            noAnswer: 0,
            callBackLater: 0,
            wrongPerson: 0,
            pushSent: 0,
            completed: 0,
            reachRate: 0,
            completionRate: 0
          }
        });
      }
    } catch (err: any) {
      console.error('Get Detail Error:', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 }}>
              {isOrgView ? '🏢 Firma Kalite Doğrulama — Katılımcı Belirleme' : '🛡️ PAG Kalite Doğrulama Yönetimi'}
            </h2>
            <span style={{
              padding: '3px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 800,
              backgroundColor: isOrgView ? 'rgba(59, 130, 246, 0.15)' : 'rgba(183, 243, 74, 0.2)',
              color: isOrgView ? '#3B82F6' : 'var(--brand-navy)'
            }}>
              {isOrgView ? 'FİRMA MODU' : 'SUPER ADMIN / PAG'}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px', fontWeight: 500, margin: 0 }}>
            {isOrgView
              ? `Firmanıza ayrılan ${surveyMetadata.orgSelectionQuota} kişilik kotayı belirleyip PAG onayına gönderin.`
              : 'Firma katılımcı seçimlerini inceleyin, PAG havuzunu onaylayın ve çağrı merkezine aktarın.'}
          </p>
        </div>

        {/* Action Button: Yeni Kampanya Başlat & Görünüm Değiştirici */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {isAdmin && (
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '8px', padding: '3px', border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => router.push('/verification-campaigns?view=PAG')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: !isOrgView ? 'var(--brand-navy)' : 'transparent',
                  color: !isOrgView ? '#FFFFFF' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                🛡️ PAG Yönetimi
              </button>
              <button
                onClick={() => router.push('/verification-campaigns?view=ORG')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: isOrgView ? 'var(--brand-navy)' : 'transparent',
                  color: isOrgView ? '#FFFFFF' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                🏢 Firma Ekranı
              </button>
            </div>
          )}

          <button
            onClick={() => setActiveTab(activeTab === 'CAMPAIGNS' ? 'CREATE_CAMPAIGN' : 'CAMPAIGNS')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'CREATE_CAMPAIGN' ? 'var(--bg-surface-secondary)' : 'var(--brand-lime)',
              color: activeTab === 'CREATE_CAMPAIGN' ? 'var(--text-primary)' : 'var(--brand-midnight)',
              fontWeight: 800,
              fontSize: '13.5px',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {activeTab === 'CREATE_CAMPAIGN' ? '📋 Kampanya Listesine Dön' : '➕ Yeni Katılımcı Seçimi'}
          </button>
        </div>
      </header>

      {successBanner && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10B981',
          padding: '14px 18px',
          borderRadius: '10px',
          marginBottom: '24px',
          fontWeight: 700,
          fontSize: '14px'
        }}>
          {successBanner}
        </div>
      )}

      {/* ================================================== */}
      {/* TAB 1: KAMPANYA LİSTESİ & İSTATİSTİKLER */}
      {/* ================================================== */}
      {activeTab === 'CAMPAIGNS' && (
        <div>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>Kampanyalar yükleniyor...</div>
          ) : campaigns.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Henüz oluşturulmuş bir Kalite Doğrulama Kampanyası bulunmuyor</p>
              <p style={{ fontSize: '13px', marginTop: '6px', margin: 0 }}>Yukarıdaki butona tıklayarak anket katılımcı havuzundan yeni bir doğrulama süreci başlatabilirsiniz.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {campaigns.map((c) => (
                <div
                  key={c.id}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--brand-navy)' }}>
                        ID: {c.id.slice(0, 16)}...
                      </span>
                      <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
                        {c.status || 'AKTİF'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      {c.masterSurveyTitle}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', margin: 0 }}>
                      🎁 Doğrulama Ödülü: <strong>{c.verificationRewardSummary}</strong>
                    </p>
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '12px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
                    <span>Hedef: <strong>{c.requestedCount} Kişi</strong></span>
                    <span>🏢 Firma: <strong>{c.customerSelectedCount}</strong></span>
                    <span>🎲 PAG: <strong>{c.randomSelectedCount}</strong></span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleOpenDetail(c.id)}
                      style={{
                        flex: 1,
                        padding: '9px',
                        backgroundColor: 'var(--brand-navy)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '12.5px',
                        cursor: 'pointer'
                      }}
                    >
                      📊 Canlı Rapor & Detay
                    </button>
                    <Link
                      href={`/verification-calls?campaignId=${c.id}`}
                      style={{
                        flex: 1,
                        padding: '9px',
                        backgroundColor: 'var(--brand-lime)',
                        color: 'var(--brand-midnight)',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '12.5px',
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      📞 Çağrı Portalı
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================================================== */}
      {/* TAB 2: YENİ KATILIMCI SEÇİMİ & DOĞRULAMA TANIMLAMA */}
      {/* ================================================== */}
      {activeTab === 'CREATE_CAMPAIGN' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Adım 1 & 2: Anket Seçimi ve Demografik Filtreler */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '20px 24px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ flex: 1, minWidth: '300px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  1. Doğrulanacak Anketi Seçin *
                </label>
                <select
                  value={selectedSurveyId}
                  onChange={(e) => handleSelectSurvey(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-surface-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {availableSurveys.map((s) => {
                    const orgLabel = s.ownerType === 'ORGANIZATION' ? `[Kurum: ${s.organizationId || 'Müşteri'}]` : '[PAG]';
                    const statusLabel = s.status === 'APPROVED' ? '✓ Onaylandı' : (s.status === 'ACTIVE' ? '🟢 Yayında' : (s.status === 'DRAFT' ? '📝 Taslak' : s.status));
                    return (
                      <option key={s.surveyId} value={s.surveyId}>
                        {orgLabel} {s.title} — {statusLabel}
                      </option>
                    );
                  })}
                  {availableSurveys.length === 0 && (
                    <option value="" disabled>Kalite Doğrulama tanımlı anket bulunamadı</option>
                  )}
                </select>
              </div>

              {/* Kota ve Hedef Bilgilendirme Rozeti */}
              <div style={{
                backgroundColor: 'var(--bg-surface-secondary)',
                border: '1px solid var(--border-color)',
                padding: '12px 18px',
                borderRadius: '10px',
                display: 'flex',
                gap: '20px',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {isOrgView ? 'Firma Kotanız' : 'Firma Kotası'}
                  </span>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>
                    {selectedUserIds.length} / {surveyMetadata.orgSelectionQuota} Kişi
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {isOrgView ? 'PAG Kalan Havuzu' : 'PAG Kotası'}
                  </span>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: '#10B981', margin: 0 }}>
                    {Math.max(0, surveyMetadata.pagTargetCount - surveyMetadata.orgSelectionQuota)} Kişi
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Toplam Arama Hedefi</span>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {surveyMetadata.pagTargetCount} Kişi
                  </p>
                </div>
              </div>
            </div>

            {/* Demografik Filtreleme Barı */}
            <div>
              <span style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                2. Katılımcı Havuzu Demografik Filtreleri
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                {/* İl Filtresi */}
                <div>
                  <select
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}
                  >
                    <option value="ALL">Tüm İller</option>
                    <option value="İstanbul">İstanbul</option>
                    <option value="Ankara">Ankara</option>
                    <option value="İzmir">İzmir</option>
                    <option value="Antalya">Antalya</option>
                    <option value="Bursa">Bursa</option>
                    <option value="Adana">Adana</option>
                  </select>
                </div>

                {/* Cinsiyet Filtresi */}
                <div>
                  <select
                    value={filterGender}
                    onChange={(e) => setFilterGender(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}
                  >
                    <option value="ALL">Tüm Cinsiyetler</option>
                    <option value="MALE">Erkek</option>
                    <option value="FEMALE">Kadın</option>
                  </select>
                </div>

                {/* Yaş Aralığı */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input
                    type="number"
                    placeholder="Min Yaş"
                    value={filterMinAge}
                    onChange={(e) => setFilterMinAge(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                  <span style={{ color: 'var(--text-secondary)' }}>-</span>
                  <input
                    type="number"
                    placeholder="Max Yaş"
                    value={filterMaxAge}
                    onChange={(e) => setFilterMaxAge(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </div>

                {/* Arama Kutusu */}
                <div>
                  <input
                    type="text"
                    placeholder="İsim veya Katılımcı No ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        loadRespondents(selectedSurveyId);
                      }
                    }}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </div>

                {/* Filtrele ve Sıfırla Butonları */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => loadRespondents(selectedSurveyId)}
                    disabled={isLoadingRespondents}
                    style={{
                      flex: 1,
                      padding: '8px 16px',
                      backgroundColor: 'var(--brand-navy)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: isLoadingRespondents ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {isLoadingRespondents ? '⏳ Aranıyor...' : '🔍 Ara'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterCity('ALL');
                      setFilterGender('ALL');
                      setFilterMinAge('');
                      setFilterMaxAge('');
                      setSearchQuery('');
                      loadRespondents(selectedSurveyId, { city: 'ALL', gender: 'ALL', minAge: '', maxAge: '', search: '' });
                    }}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'var(--bg-surface-secondary)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                    title="Filtreleri Sıfırla"
                  >
                    🔄 Sıfırla
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Adım 3: Maskelenmiş Katılımcı Listesi */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  3. Katılımcı Listesi & Seçim ({respondents.length} Uygun Katılımcı)
                </span>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, marginTop: '2px' }}>
                  {isOrgView
                    ? `Firmanıza ayrılan ${surveyMetadata.orgSelectionQuota} katılımcıyı seçin.`
                    : 'Listeden seçim yapabilir veya doğrudan PAG kampanyasını başlatabilirsiniz.'}
                </p>
              </div>

              <span style={{
                fontSize: '12px',
                fontWeight: 700,
                color: selectedUserIds.length >= surveyMetadata.orgSelectionQuota ? '#10B981' : 'var(--brand-navy)'
              }}>
                Seçilen: {selectedUserIds.length} / {isOrgView ? surveyMetadata.orgSelectionQuota : (surveyMetadata.pagTargetCount - surveyMetadata.orgSelectionQuota)} Kişi
              </span>
            </div>

            {isLoadingRespondents ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Katılımcı havuzu taranıyor ve filtreler uygulanıyor...
              </div>
            ) : respondents.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Seçilen filtrelere uygun tamamlanmış katılımcı bulunamadı.
              </div>
            ) : (
              <div style={{ maxHeight: '480px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-surface-secondary)', zIndex: 10 }}>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '10px 16px', width: '40px' }}>Seç</th>
                      <th style={{ padding: '10px 16px', fontWeight: 700 }}>Katılımcı (Maskelenmiş)</th>
                      <th style={{ padding: '10px 16px', fontWeight: 700 }}>Maskeli Telefon</th>
                      <th style={{ padding: '10px 16px', fontWeight: 700 }}>İl (Şehir)</th>
                      <th style={{ padding: '10px 16px', fontWeight: 700 }}>Cinsiyet</th>
                      <th style={{ padding: '10px 16px', fontWeight: 700 }}>Yaş</th>
                      <th style={{ padding: '10px 16px', fontWeight: 700 }}>Tamamlama Tarihi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {respondents.map((r) => {
                      const isSelected = selectedUserIds.includes(r.userId);
                      return (
                        <tr
                          key={r.userId}
                          onClick={() => handleToggleUser(r.userId)}
                          style={{
                            borderBottom: '1px solid var(--border-color)',
                            backgroundColor: isSelected ? 'rgba(183, 243, 74, 0.12)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background-color 0.1s ease'
                          }}
                        >
                          <td style={{ padding: '12px 16px' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // handled by row click
                              style={{ cursor: 'pointer' }}
                            />
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {r.userDisplayName}
                          </td>
                          <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                            {r.maskedPhone}
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            📍 {formatCityName(r.city)}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              backgroundColor: r.gender === 'Kadın' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                              color: r.gender === 'Kadın' ? '#EC4899' : '#3B82F6'
                            }}>
                              {r.gender}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {r.age} Yaş
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                            {formatSafeDateString(r.completedAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Adım 4: Onay ve Gönderim Barı */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '20px 24px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {isOrgView
                  ? `Seçim Özeti: ${selectedUserIds.length} Firma Seçimi / ${surveyMetadata.orgSelectionQuota} Katılımcı Kotası`
                  : `Seçim Özeti: ${selectedUserIds.length} Firma Seçimi + ${Math.max(0, surveyMetadata.pagTargetCount - selectedUserIds.length)} PAG Random = ${surveyMetadata.pagTargetCount} Toplam Arama`}
              </span>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', margin: 0 }}>
                {isOrgView
                  ? 'Seçtiğiniz katılımcılar PAG ekibine iletilir ve doğrulama aramaları başlatılır.'
                  : 'Firma tarafından seçilmeyen kalan adet, PAG tarafından filtrelere uygun havuzdan otomatik tamamlanır.'}
              </p>
            </div>

            <button
              onClick={handleCreateCampaign}
              disabled={isCreating}
              style={{
                padding: '12px 28px',
                borderRadius: '10px',
                backgroundColor: 'var(--brand-lime)',
                color: 'var(--brand-midnight)',
                border: 'none',
                fontWeight: 900,
                fontSize: '15px',
                cursor: isCreating ? 'not-allowed' : 'pointer',
                boxShadow: 'var(--shadow-md)',
                opacity: isCreating ? 0.7 : 1
              }}
            >
              {isCreating
                ? 'İşleniyor...'
                : (isOrgView
                    ? `📤 Seçilen Katılımcıları PAG'a Gönder (${selectedUserIds.length}/${surveyMetadata.orgSelectionQuota})`
                    : '✅ Seçilen Katılımcıları Onayla')}
            </button>
          </div>
        </div>
      )}

      {/* Campaign Detail Modal */}
      {selectedCampaignDetail && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px'
        }}>
          <div style={{
            width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto',
            backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)',
            borderRadius: '16px', padding: '28px', boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                📊 Kalite Doğrulama Canlı Raporu
              </h3>
              <button
                onClick={() => setSelectedCampaignDetail(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Hedef Havuz</span>
                <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{selectedCampaignDetail.stats.total}</p>
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Aranan</span>
                <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>{selectedCampaignDetail.stats.called}</p>
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Kabul Eden</span>
                <p style={{ fontSize: '20px', fontWeight: 800, color: '#10B981', margin: 0 }}>{selectedCampaignDetail.stats.accepted}</p>
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Doğrulayan</span>
                <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--brand-lime-text, #4B8E00)', margin: 0 }}>{selectedCampaignDetail.stats.completed}</p>
              </div>
            </div>

            <div style={{ padding: '14px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Ulaşılma Oranı:</span>
                <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>%{selectedCampaignDetail.stats.reachRate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Doğrulama Tamamlama Oranı:</span>
                <span style={{ fontWeight: 800, color: '#10B981' }}>%{selectedCampaignDetail.stats.completionRate}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerificationCampaignsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>Yükleniyor...</div>}>
      <VerificationCampaignsContent />
    </Suspense>
  );
}
