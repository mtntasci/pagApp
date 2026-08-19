'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface ActiveSurveyOption {
  surveyId: string;
  title: string;
  responseCount: number;
  status?: string;
  ownerType?: string;
  organizationId?: string | null;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    activeSurveys: 0,
    activeProfileSurveys: 0,
    totalUsers: 0,
    activePushUsers: 0,
    totalResponses: 0,
    basicProfileCompletedCount: 0,
    phoneVerifiedCount: 0,
    kycVerifiedCount: 0,
    ibanSubmittedCount: 0,
    activeSurveysList: [] as ActiveSurveyOption[]
  });

  const [selectedSurveyId, setSelectedSurveyId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadMetrics = useCallback(async () => {
    try {
      setIsRefreshing(true);

      const res = await fetch('/api/v1/admin/dashboard/metrics');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const data = json.data;
          setMetrics({
            activeSurveys: data.activeSurveys || 0,
            activeProfileSurveys: data.activeProfileSurveys || 0,
            totalUsers: data.totalUsers || 0,
            activePushUsers: data.activePushUsers || 0,
            totalResponses: data.totalResponses || 0,
            basicProfileCompletedCount: data.basicProfileCompletedCount || 0,
            phoneVerifiedCount: data.phoneVerifiedCount || 0,
            kycVerifiedCount: data.kycVerifiedCount || 0,
            ibanSubmittedCount: data.ibanSubmittedCount || 0,
            activeSurveysList: data.activeSurveysList || []
          });

          if (data.activeSurveysList && data.activeSurveysList.length > 0) {
            setSelectedSurveyId(prev => {
              const exists = data.activeSurveysList.some((s: any) => s.surveyId === prev);
              return exists ? prev : data.activeSurveysList[0].surveyId;
            });
          }
        }
      }
    } catch (err) {
      console.warn('Dashboard metrics fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const topCards = [
    { title: 'Aktif Anket', value: metrics.activeSurveys, tag: 'Canlı Yayında', tagBg: 'rgba(16, 185, 129, 0.15)', tagColor: '#10B981', icon: '📋' },
    { title: 'Aktif Profil Anketi', value: metrics.activeProfileSurveys, tag: 'Profil Havuzu', tagBg: 'rgba(57, 119, 246, 0.15)', tagColor: '#3977F6', icon: '👤' },
    { title: 'Kullanıcı Sayısı', value: metrics.totalUsers.toLocaleString('tr-TR'), tag: 'Toplam Kayıtlı', tagBg: 'rgba(183, 243, 74, 0.2)', tagColor: 'var(--brand-lime-text, #4B8E00)', icon: '👥' },
    { title: 'Aktif Kullanıcı (Push Alan)', value: metrics.activePushUsers.toLocaleString('tr-TR'), tag: 'Bildirim Aktif', tagBg: 'rgba(245, 158, 11, 0.15)', tagColor: '#F59E0B', icon: '🔔' }
  ];

  const selectedSurvey = metrics.activeSurveysList.find(s => s.surveyId === selectedSurveyId) || (metrics.activeSurveysList.length > 0 ? metrics.activeSurveysList[0] : null);
  const targetPopulation = Math.max(metrics.activePushUsers, metrics.totalUsers, 1);
  const responseCount = selectedSurvey ? (selectedSurvey.responseCount || 0) : 0;
  const participationPercentage = Math.min(100, Math.round((responseCount / targetPopulation) * 1000) / 10);

  const verificationDistributions = [
    {
      title: 'Temel Profil Bilgisi',
      subtitle: 'Dolduran vs Doldurmayan',
      icon: '📝',
      completedCount: metrics.basicProfileCompletedCount,
      totalCount: metrics.totalUsers,
      completedLabel: 'Dolduran Kullanıcı',
      pendingLabel: 'Doldurmayan Kullanıcı',
      color: '#3977F6'
    },
    {
      title: 'Telefon Doğrulama',
      subtitle: 'Doğrulayan vs Doğrulamayan (+200 PP)',
      icon: '📱',
      completedCount: metrics.phoneVerifiedCount,
      totalCount: metrics.totalUsers,
      completedLabel: 'Doğrulayan Kullanıcı',
      pendingLabel: 'Doğrulamayan Kullanıcı',
      color: '#10B981'
    },
    {
      title: 'KYC Doğrulama',
      subtitle: 'Doğrulayan vs Doğrulamayan (+500 PP)',
      icon: '🪪',
      completedCount: metrics.kycVerifiedCount,
      totalCount: metrics.totalUsers,
      completedLabel: 'Doğrulayan Kullanıcı',
      pendingLabel: 'Doğrulamayan Kullanıcı',
      color: '#F59E0B'
    },
    {
      title: 'IBAN & TCKN Bilgisi',
      subtitle: 'Giren vs Girmeyen (+200 PP)',
      icon: '💳',
      completedCount: metrics.ibanSubmittedCount,
      totalCount: metrics.totalUsers,
      completedLabel: 'Giren Kullanıcı',
      pendingLabel: 'Girmeyen Kullanıcı',
      color: '#8B5CF6'
    }
  ];

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 }}>
            Dashboard & Raporlar
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px', fontWeight: 500, margin: 0 }}>
            Canlı kullanıcı popülasyonu, anket katılım oranları ve profil doğrulama istatistikleri
          </p>
        </div>
        <button
          onClick={() => loadMetrics()}
          disabled={isRefreshing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-surface-secondary)',
            color: 'var(--text-primary)',
            fontWeight: 700,
            fontSize: '13px',
            cursor: isRefreshing ? 'not-allowed' : 'pointer',
            opacity: isRefreshing ? 0.7 : 1
          }}
        >
          <span style={{ display: 'inline-block', transform: isRefreshing ? 'rotate(360deg)' : 'none', transition: 'transform 0.8s ease' }}>
            🔄
          </span>
          {isRefreshing ? 'Güncelleniyor...' : 'Verileri Yenile'}
        </button>
      </header>

      {/* ================================================== */}
      {/* 1. TOP 4 KPI CARDS */}
      {/* ================================================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '20px',
        marginBottom: '36px'
      }}>
        {topCards.map((card, idx) => (
          <div key={idx} style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '110px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {card.title}
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: card.tagBg,
                color: card.tagColor
              }}>
                {card.tag}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <p style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px', margin: 0 }}>
                {isLoading ? '...' : card.value}
              </p>
              <span style={{ fontSize: '24px' }}>{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ================================================== */}
      {/* 2. SURVEY PARTICIPATION RATE SECTION (DROPDOWN SELECTOR) */}
      {/* ================================================== */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '36px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              📊 Anket Katılım Oranı Analizi
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
              Seçilen ankete katılan kullanıcıların aktif kitleye oranı
            </p>
          </div>
          {metrics.activeSurveysList.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                İncelenecek Anket:
              </label>
              <select
                value={selectedSurveyId}
                onChange={(e) => setSelectedSurveyId(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-secondary)',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  outline: 'none',
                  maxWidth: '320px'
                }}
              >
                {metrics.activeSurveysList.map(s => (
                  <option key={s.surveyId} value={s.surveyId}>
                    {s.title} ({s.responseCount || 0} Yanıt)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {selectedSurvey ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            backgroundColor: 'var(--bg-surface-secondary)',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            marginBottom: '20px'
          }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                İncelenen Anket
              </span>
              <p style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', margin: 0 }}>
                {selectedSurvey.title}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Hedef Kitle / Aktif Bildirim Alan
              </span>
              <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px', margin: 0 }}>
                {targetPopulation.toLocaleString('tr-TR')} Kişi
              </p>
            </div>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Ankete Katılan / Cevaplayan
              </span>
              <p style={{ fontSize: '20px', fontWeight: 800, color: '#10B981', marginTop: '2px', margin: 0 }}>
                👥 {responseCount.toLocaleString('tr-TR')} Katılımcı
              </p>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Katılım Oranı
                </span>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#10B981' }}>
                  %{participationPercentage}
                </span>
              </div>
              <div style={{
                height: '8px',
                width: '100%',
                backgroundColor: 'var(--border-color)',
                borderRadius: '4px',
                marginTop: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${participationPercentage}%`,
                  backgroundColor: '#10B981',
                  borderRadius: '4px',
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface-secondary)',
            borderRadius: '10px',
            color: 'var(--text-secondary)',
            fontSize: '14px',
            fontWeight: 500
          }}>
            Henüz incelenecek anket bulunamadı. Anketler sekmesinden yeni bir anket yayınlayabilirsiniz.
          </div>
        )}

        {/* Live Survey Table */}
        {metrics.activeSurveysList.length > 1 && (
          <div style={{ marginTop: '20px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 8px', fontWeight: 700 }}>Anket Adı</th>
                  <th style={{ padding: '10px 8px', fontWeight: 700 }}>Durum</th>
                  <th style={{ padding: '10px 8px', fontWeight: 700 }}>Katılımcı Sayısı</th>
                  <th style={{ padding: '10px 8px', fontWeight: 700 }}>Katılım Oranı</th>
                </tr>
              </thead>
              <tbody>
                {metrics.activeSurveysList.map((s) => {
                  const p = Math.min(100, Math.round(((s.responseCount || 0) / targetPopulation) * 1000) / 10);
                  const isSel = s.surveyId === selectedSurveyId;
                  return (
                    <tr
                      key={s.surveyId}
                      onClick={() => setSelectedSurveyId(s.surveyId)}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: isSel ? 'rgba(183, 243, 74, 0.08)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '12px 8px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {s.title}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: s.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                          color: s.status === 'ACTIVE' ? '#10B981' : 'var(--text-secondary)'
                        }}>
                          {s.status === 'ACTIVE' ? 'CANLI' : (s.status || 'AKTİF')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', fontWeight: 700, color: '#10B981' }}>
                        👥 {s.responseCount || 0} Yanıt
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, maxWidth: '100px', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${p}%`, height: '100%', backgroundColor: '#10B981' }} />
                          </div>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '12px' }}>%{p}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================================================== */}
      {/* 3. USER PROFILE & VERIFICATION BREAKDOWN GRID */}
      {/* ================================================== */}
      <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
        📌 Kullanıcı Profil ve Doğrulama Dağılımları
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
        gap: '20px'
      }}>
        {verificationDistributions.map((dist, idx) => {
          const pendingCount = Math.max(0, dist.totalCount - dist.completedCount);
          const percent = dist.totalCount > 0 ? Math.round((dist.completedCount / dist.totalCount) * 100) : 0;

          return (
            <div key={idx} style={{
              backgroundColor: 'var(--bg-surface)',
              padding: '20px 24px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '16px'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '20px' }}>{dist.icon}</span>
                  <span style={{ fontSize: '14px', fontWeight: 900, color: dist.color }}>
                    %{percent}
                  </span>
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px', margin: 0 }}>
                  {dist.title}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', margin: 0 }}>
                  {dist.subtitle}
                </p>
              </div>

              {/* Progress Bar */}
              <div>
                <div style={{
                  height: '8px',
                  width: '100%',
                  backgroundColor: 'var(--bg-surface-secondary)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${percent}%`,
                    backgroundColor: dist.color,
                    borderRadius: '4px',
                    transition: 'width 0.4s ease'
                  }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-primary)' }}>
                    ✅ {dist.completedLabel}: <strong>{dist.completedCount.toLocaleString('tr-TR')}</strong>
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    ⏳ {dist.pendingLabel}: <strong>{pendingCount.toLocaleString('tr-TR')}</strong>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
