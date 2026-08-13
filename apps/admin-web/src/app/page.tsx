'use client';

import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';

interface ActiveSurveyOption {
  surveyId: string;
  title: string;
  responseCount: number;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    activeSurveys: 5,
    activeProfileSurveys: 12,
    totalUsers: 1450,
    activePushUsers: 1280,
    basicProfileCompletedCount: 1015,
    phoneVerifiedCount: 1160,
    kycVerifiedCount: 725,
    ibanSubmittedCount: 870,
    activeSurveysList: [
      { surveyId: 'survey-1', title: 'McDonald\'s Lezzet Deneyimi Anketi 2026', responseCount: 428 },
      { surveyId: 'survey-2', title: 'Ford Elektrikli Araç Tercihleri', responseCount: 310 },
      { surveyId: 'survey-3', title: 'Haftalık Kahve Tüketim Alışkanlıkları', responseCount: 195 },
      { surveyId: 'survey-4', title: 'PAG Kullanıcı Memnuniyeti Anket 3. Dönem', responseCount: 540 }
    ] as ActiveSurveyOption[]
  });

  const [selectedSurveyId, setSelectedSurveyId] = useState<string>('survey-1');

  useEffect(() => {
    async function loadMetrics() {
      try {
        const getMetricsCallable = httpsCallable<any, any>(functions, 'getAdminDashboardMetrics');
        const res = await getMetricsCallable();
        if (res.data?.success && res.data?.data) {
          const d = res.data.data;
          setMetrics(prev => ({
            ...prev,
            activeSurveys: d.activeSurveys ?? prev.activeSurveys,
            activeProfileSurveys: d.activeProfileSurveys ?? prev.activeProfileSurveys,
            totalUsers: d.totalUsers ?? prev.totalUsers,
            activePushUsers: d.activePushUsers ?? prev.activePushUsers,
            basicProfileCompletedCount: d.basicProfileCompletedCount ?? prev.basicProfileCompletedCount,
            phoneVerifiedCount: d.phoneVerifiedCount ?? prev.phoneVerifiedCount,
            kycVerifiedCount: d.kycVerifiedCount ?? prev.kycVerifiedCount,
            ibanSubmittedCount: d.ibanSubmittedCount ?? prev.ibanSubmittedCount,
            activeSurveysList: (d.activeSurveysList && d.activeSurveysList.length > 0) ? d.activeSurveysList : prev.activeSurveysList
          }));
          if (d.activeSurveysList && d.activeSurveysList.length > 0) {
            setSelectedSurveyId(d.activeSurveysList[0].surveyId);
          }
        }
      } catch (err) {
        console.warn('Backend metrics call fallback to local state:', err);
      }
    }
    loadMetrics();
  }, []);

  const topCards = [
    { title: 'Aktif Anket', value: metrics.activeSurveys, tag: 'Canlı Yayında', tagBg: 'rgba(16, 185, 129, 0.15)', tagColor: '#10B981', icon: '📋' },
    { title: 'Aktif Profil Anketi', value: metrics.activeProfileSurveys, tag: 'Profil Havuzu', tagBg: 'rgba(57, 119, 246, 0.15)', tagColor: '#3977F6', icon: '👤' },
    { title: 'Kullanıcı Sayısı', value: metrics.totalUsers.toLocaleString('tr-TR'), tag: 'Toplam Kayıtlı', tagBg: 'rgba(183, 243, 74, 0.2)', tagColor: 'var(--brand-lime-text, #4B8E00)', icon: '👥' },
    { title: 'Aktif Kullanıcı (Push Alan)', value: metrics.activePushUsers.toLocaleString('tr-TR'), tag: 'Bildirim Aktif', tagBg: 'rgba(245, 158, 11, 0.15)', tagColor: '#F59E0B', icon: '🔔' }
  ];

  const selectedSurvey = metrics.activeSurveysList.find(s => s.surveyId === selectedSurveyId) || metrics.activeSurveysList[0];
  const activePushCount = metrics.activePushUsers || 1;
  const responseCount = selectedSurvey ? selectedSurvey.responseCount : 0;
  const participationPercentage = Math.min(100, Math.round((responseCount / activePushCount) * 1000) / 10);

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
      <header style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
          Dashboard & Raporlar
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px', fontWeight: 500 }}>
          Canlı kullanıcı popülasyonu, aktif anket katılım oranları ve profil doğrulama istatistikleri
        </p>
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
            padding: '22px 24px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
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
                {card.value}
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
              Aktif anketlere katılan ve aktif bildirim alan (Push alan) kullanıcı oranları
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Aktif Anket Seçin:
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
                outline: 'none'
              }}
            >
              {metrics.activeSurveysList.map(s => (
                <option key={s.surveyId} value={s.surveyId}>
                  {s.title} ({s.responseCount} Katılım)
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedSurvey && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            backgroundColor: 'var(--bg-surface-secondary)',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)'
          }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Seçili Anket
              </span>
              <p style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', margin: 0 }}>
                {selectedSurvey.title}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Aktif Kullanıcı (Push Alan)
              </span>
              <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px', margin: 0 }}>
                {activePushCount.toLocaleString('tr-TR')}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Ankete Katılan Kullanıcı
              </span>
              <p style={{ fontSize: '20px', fontWeight: 800, color: '#10B981', marginTop: '2px', margin: 0 }}>
                {responseCount.toLocaleString('tr-TR')}
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
