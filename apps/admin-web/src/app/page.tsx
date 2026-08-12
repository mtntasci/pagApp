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

  return (
    <div>
      <header style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold' }}>Dashboard</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Canlı Sistem Özeti ve KPI Metrikleri</p>
      </header>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Aktif Anketler</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--brand-lime)', marginTop: '8px' }}>
            {metrics.activeSurveys}
          </p>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Planlanan Anketler</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#60A5FA', marginTop: '8px' }}>
            {metrics.scheduledSurveys}
          </p>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Tamamlanan Anketler</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '8px' }}>
            {metrics.endedSurveys}
          </p>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Toplam Katılım</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '8px' }}>
            {metrics.totalResponses}
          </p>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Dağıtılan Profil Puanı</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--brand-lime)', marginTop: '8px' }}>
            {metrics.totalProfileScoreDistributed.toLocaleString()} Puan
          </p>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Dağıtılan TL Ödülü</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#F59E0B', marginTop: '8px' }}>
            ₺{metrics.totalMoneyRewardDistributed.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
