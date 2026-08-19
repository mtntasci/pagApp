'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
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

export interface AnonymousRespondent {
  userId: string;
  anonymousRef: string;
  completedAt: string | null;
}

export interface CampaignStats {
  total: number;
  customerSelected: number;
  randomSelected: number;
  called: number;
  reached: number;
  accepted: number;
  declined: number;
  noAnswer: number;
  callBackLater: number;
  wrongPerson: number;
  pushSent: number;
  completed: number;
  completionRate: number;
  reachRate: number;
}

export default function VerificationCampaignsPage() {
  const { isAdmin, isOrgUser } = useAuth();
  const [campaigns, setCampaigns] = useState<VerificationCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaignDetail, setSelectedCampaignDetail] = useState<{ campaign: any; stats: CampaignStats } | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // New Campaign Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [availableSurveys, setAvailableSurveys] = useState<any[]>([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState('');
  const [respondents, setRespondents] = useState<AnonymousRespondent[]>([]);
  const [isLoadingRespondents, setIsLoadingRespondents] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [randomCount, setRandomCount] = useState<number>(10);
  const [rewardSummary, setRewardSummary] = useState('250 TL Hediye Çeki');
  const [isCreating, setIsCreating] = useState(false);

  // 1. Fetch campaigns
  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true);
    try {
      const listFn = httpsCallable(functions, 'listVerificationCampaigns');
      const res: any = await listFn({});
      if (res.data?.success && Array.isArray(res.data.data?.campaigns)) {
        setCampaigns(res.data.data.campaigns);
      }
    } catch (err) {
      console.error('Fetch Campaigns Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. Fetch available surveys for modal
  const fetchSurveysForModal = async () => {
    try {
      const listSurveysFn = httpsCallable(functions, 'listSurveysAdmin');
      const res: any = await listSurveysFn({});
      if (res.data?.success && Array.isArray(res.data.data?.surveys)) {
        // Filter surveys: must be active/ended or have verificationConfig enabled
        const filtered = res.data.data.surveys.filter((s: any) =>
          isAdmin || s?.verificationConfig?.enabled === true || s?.isVerificationEnabled === true
        );
        setAvailableSurveys(filtered);
        if (filtered.length > 0) {
          setSelectedSurveyId(filtered[0].surveyId);
          loadRespondents(filtered[0].surveyId);
        }
      }
    } catch (err) {
      console.error('Fetch Surveys Error:', err);
    }
  };

  // 3. Load respondents for chosen survey
  const loadRespondents = async (surveyId: string) => {
    if (!surveyId) return;
    setIsLoadingRespondents(true);
    setSelectedUserIds([]);
    try {
      const getRespFn = httpsCallable(functions, 'getCompletedRespondentsForVerification');
      const res: any = await getRespFn({ surveyId });
      if (res.data?.success && Array.isArray(res.data.data?.respondents)) {
        setRespondents(res.data.data.respondents);
      }
    } catch (err) {
      console.error('Fetch Respondents Error:', err);
    } finally {
      setIsLoadingRespondents(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Open Detail
  const handleOpenDetail = async (campaignId: string) => {
    setIsDetailLoading(true);
    try {
      const getDetailFn = httpsCallable(functions, 'getVerificationCampaignDetail');
      const res: any = await getDetailFn({ campaignId });
      if (res.data?.success && res.data.data) {
        setSelectedCampaignDetail(res.data.data);
      }
    } catch (err: any) {
      console.error('Get Detail Error:', err);
      alert('Detay yüklenirken hata: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Toggle respondent selection
  const handleToggleRespondent = (uid: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  // Submit Create Verification Campaign
  const handleCreateCampaign = async () => {
    if (!selectedSurveyId) {
      alert('Lütfen bir anket seçin.');
      return;
    }
    if (selectedUserIds.length === 0 && randomCount <= 0) {
      alert('Lütfen en az bir firma seçimi veya rastgele seçim sayısı belirleyin.');
      return;
    }

    setIsCreating(true);
    try {
      const createFn = httpsCallable(functions, 'createVerificationCampaign');
      const res: any = await createFn({
        masterSurveyId: selectedSurveyId,
        customerSelectedUserIds: selectedUserIds,
        randomSelectedCount: Number(randomCount) || 0,
        verificationRewardSummary: rewardSummary
      });

      if (res.data?.success) {
        alert('Kalite Doğrulama Kampanyası başarıyla oluşturuldu ve çağrı havuzuna aktarıldı!');
        setIsCreateModalOpen(false);
        await fetchCampaigns();
      }
    } catch (err: any) {
      console.error('Create Campaign Error:', err);
      alert('Kampanya oluşturulurken hata: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="admin-header-title" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Kalite Doğrulama Hizmeti
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px', fontWeight: 500 }}>
            Kurumsal Anket Yanıt Doğrulama ve Çağrı Merkezi Kalite Kontrol Raporları
          </p>
        </div>

        <button
          onClick={() => {
            setIsCreateModalOpen(true);
            fetchSurveysForModal();
          }}
          style={{
            padding: '10px 18px',
            backgroundColor: 'var(--brand-navy)',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '13px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🛡️ Yeni Kalite Doğrulama Başlat
        </button>
      </header>

      {/* Campaigns Table */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Kampanyalar yükleniyor...</div>
      ) : campaigns.length === 0 ? (
        <div style={{ padding: '36px', textAlign: 'center', backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
          Henüz oluşturulmuş bir Kalite Doğrulama kampanyası bulunmuyor.
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-surface-secondary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Anket Adı</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Toplam Doğrulama</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Firma Seçimi</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>PAG Random</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Doğrulama Ödülü</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Durum</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {c.masterSurveyTitle}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                      {c.requestedCount} Katılımcı
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {c.customerSelectedCount}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {c.randomSelectedCount}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--brand-navy)', fontWeight: 600 }}>
                      🎁 {c.verificationRewardSummary}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                        backgroundColor: c.status === 'ACTIVE' ? 'var(--success-bg)' : 'var(--bg-surface-secondary)',
                        color: c.status === 'ACTIVE' ? 'var(--success-color)' : 'var(--text-secondary)'
                      }}>
                        {c.status === 'ACTIVE' ? 'Aktif' : c.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenDetail(c.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-surface-secondary)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-highlight)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        📊 İlerleme Raporu
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Campaign Detail / Aggregate Progress Dashboard Modal */}
      {selectedCampaignDetail && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px'
        }}>
          <div style={{
            width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto',
            backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)',
            borderRadius: '16px', padding: '28px', boxShadow: 'var(--shadow-lg)',
            display: 'flex', flexDirection: 'column', gap: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-navy)', textTransform: 'uppercase' }}>
                  Kalite Doğrulama İlerleme Raporu
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {selectedCampaignDetail.campaign.masterSurveyTitle}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCampaignDetail(null)}
                style={{ color: 'var(--text-muted)', fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Top Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '14px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Doğrulama Paketi</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {selectedCampaignDetail.stats.total}
                </div>
              </div>
              <div style={{ padding: '14px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Firma Seçimi</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '4px' }}>
                  {selectedCampaignDetail.stats.customerSelected}
                </div>
              </div>
              <div style={{ padding: '14px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>PAG Random</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#6366F1', marginTop: '4px' }}>
                  {selectedCampaignDetail.stats.randomSelected}
                </div>
              </div>
              <div style={{ padding: '14px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Tamamlama Oranı</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#10B981', marginTop: '4px' }}>
                  %{selectedCampaignDetail.stats.completionRate}
                </div>
              </div>
            </div>

            {/* Detailed Aggregate Progress Table (Zero PII Exposed) */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
                    <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Arandı</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'right' }}>{selectedCampaignDetail.stats.called}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-secondary)' }}>
                    <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Ulaşıldı (Erişim Oranı: %{selectedCampaignDetail.stats.reachRate})</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'right' }}>{selectedCampaignDetail.stats.reached}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
                    <td style={{ padding: '10px 14px', color: '#10B981' }}>✓ Kabul Etti (Ek Anket Gönderildi)</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'right', color: '#10B981' }}>{selectedCampaignDetail.stats.accepted}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-secondary)' }}>
                    <td style={{ padding: '10px 14px', color: 'var(--error-color)' }}>✕ Reddetti</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'right', color: 'var(--error-color)' }}>{selectedCampaignDetail.stats.declined}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
                    <td style={{ padding: '10px 14px', color: 'var(--warning-color)' }}>Ulaşılamadı</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'right', color: 'var(--warning-color)' }}>{selectedCampaignDetail.stats.noAnswer}</td>
                  </tr>
                  <tr style={{ backgroundColor: 'var(--bg-surface-secondary)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--brand-navy)' }}>⭐ Ek Anket Tamamlandı</td>
                    <td style={{ padding: '10px 14px', fontWeight: 800, textAlign: 'right', color: 'var(--brand-navy)', fontSize: '15px' }}>{selectedCampaignDetail.stats.completed}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                onClick={() => setSelectedCampaignDetail(null)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--bg-surface-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-highlight)',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Quality Verification Campaign Modal */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px'
        }}>
          <div style={{
            width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto',
            backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)',
            borderRadius: '16px', padding: '28px', boxShadow: 'var(--shadow-lg)',
            display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)' }}>
                🛡️ Yeni Kalite Doğrulama Başlat
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{ color: 'var(--text-muted)', fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Step 1: Select Survey */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Doğrulanacak Anket:
              </label>
              <select
                value={selectedSurveyId}
                onChange={(e) => {
                  setSelectedSurveyId(e.target.value);
                  loadRespondents(e.target.value);
                }}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600
                }}
              >
                {availableSurveys.map((s) => (
                  <option key={s.surveyId} value={s.surveyId}>
                    {s.title} ({s.ownerType})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Anonymous Respondent Selection List */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Firma Tarafından Seçilecek Katılımcılar ({selectedUserIds.length} Seçildi):
                </label>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  (Tamamen anonim referanslar, PII gizlenmiştir)
                </span>
              </div>

              {isLoadingRespondents ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Katılımcı havuzu yükleniyor...</div>
              ) : respondents.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Bu anket için henüz tamamlanmış katılımcı bulunmuyor.
                </div>
              ) : (
                <div style={{
                  maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px'
                }}>
                  {respondents.map((r) => {
                    const isChecked = selectedUserIds.includes(r.userId);
                    return (
                      <label
                        key={r.userId}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', borderRadius: '6px',
                          backgroundColor: isChecked ? 'var(--accent-bg, #EFF6FF)' : 'transparent',
                          cursor: 'pointer', fontSize: '13px'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleRespondent(r.userId)}
                        />
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.anonymousRef}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '11px', marginLeft: 'auto' }}>
                          {r.completedAt ? new Date(r.completedAt).toLocaleString('tr-TR') : 'Tamamlandı'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 3: Random Pick Count & Reward Settings */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  PAG Sunucu Rastgele Seçim Sayısı:
                </label>
                <input
                  type="number"
                  min="0"
                  value={randomCount}
                  onChange={(e) => setRandomCount(Number(e.target.value))}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Doğrulama Ödül Metni:
                </label>
                <input
                  type="text"
                  value={rewardSummary}
                  onChange={(e) => setRewardSummary(e.target.value)}
                  placeholder="250 TL Hediye Çeki"
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600
                  }}
                />
              </div>
            </div>

            {/* Summary Box */}
            <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '10px', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Toplam Doğrulama Havuzu:</span>
              <strong style={{ color: 'var(--brand-navy)' }}>
                {selectedUserIds.length + (Number(randomCount) || 0)} Katılımcı ({selectedUserIds.length} Firma + {randomCount} PAG Random)
              </strong>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{ padding: '10px 16px', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-highlight)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                İptal
              </button>
              <button
                onClick={handleCreateCampaign}
                disabled={isCreating}
                style={{ padding: '10px 20px', backgroundColor: 'var(--brand-navy)', color: '#FFFFFF', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
              >
                {isCreating ? 'Oluşturuluyor...' : 'Kampanyayı Başlat & Arama Havuzuna Gönder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
