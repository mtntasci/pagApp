'use client';

import React, { useState } from 'react';

export default function DashboardPage() {
  const [metrics] = useState({
    activeSurveys: 4,
    scheduledSurveys: 2,
    endedSurveys: 8,
    draftSurveys: 1,
    totalResponses: 1420,
    totalProfileScoreDistributed: 71000,
    totalMoneyRewardDistributed: 14500
  });

  const cards = [
    { title: 'Aktif Anketler', value: metrics.activeSurveys, tag: 'Canlı Yayında', tagBg: 'var(--success-bg)', tagColor: 'var(--success-color)' },
    { title: 'Planlanan Anketler', value: metrics.scheduledSurveys, tag: 'Takvimde', tagBg: 'var(--info-bg)', tagColor: 'var(--info-color)' },
    { title: 'Tamamlanan Anketler', value: metrics.endedSurveys, tag: 'Sonuçlandı', tagBg: 'var(--bg-surface-secondary)', tagColor: 'var(--text-secondary)' },
    { title: 'Toplam Katılım', value: metrics.totalResponses.toLocaleString('tr-TR'), tag: 'Yanıt', tagBg: 'var(--bg-surface-secondary)', tagColor: 'var(--text-primary)' },
    { title: 'Dağıtılan Profil Puanı', value: `${metrics.totalProfileScoreDistributed.toLocaleString('tr-TR')} Puan`, tag: 'Profile Score', tagBg: 'var(--brand-lime-subtle)', tagColor: 'var(--brand-navy)' },
    { title: 'Dağıtılan TL Ödülü', value: `₺${metrics.totalMoneyRewardDistributed.toLocaleString('tr-TR')}`, tag: 'Nakit Ödül', tagBg: 'var(--warning-bg)', tagColor: 'var(--warning-color)' }
  ];

  return (
    <div>
      <header style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
          Dashboard
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px', fontWeight: 500 }}>
          Canlı Sistem Özeti ve KPI Metrikleri
        </p>
      </header>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {cards.map((card, idx) => (
          <div key={idx} style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
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
            <p style={{ fontSize: '30px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
