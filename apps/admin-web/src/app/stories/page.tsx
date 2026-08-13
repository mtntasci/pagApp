'use client';

import React, { useState } from 'react';

export default function StoriesPage() {
  const [stories] = useState([
    {
      storyId: 'story_01',
      surveyId: 'srv_ford_01',
      label: 'Ford Mobilite',
      imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341',
      position: 1,
      isActive: true
    },
    {
      storyId: 'story_02',
      surveyId: 'srv_mcd_01',
      label: 'McDonald\'s',
      imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349',
      position: 2,
      isActive: true
    }
  ]);

  return (
    <div>
      <header style={{ marginBottom: '24px' }}>
        <h2 className="admin-header-title" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
          Story Bar Yönetimi
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px', fontWeight: 500 }}>
          Mobil Uygulama Story Akışı ve Anket Bağlantıları
        </p>
      </header>

      {/* PAG Logo Notice */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: 'var(--info-bg)',
        border: '1px solid var(--info-border)',
        borderRadius: '10px',
        marginBottom: '24px',
        fontSize: '13px',
        color: 'var(--info-color)',
        fontWeight: 500
      }}>
        ℹ️ <strong>Bilgi:</strong> PAG logosunu taşıyan ilk sabit <em>HOME</em> hikaye elemanı mobil uygulamalar tarafından otomatik ilk sıraya eklenir. Buradan ankete bağlı olan Story içerikleri yönetilir.
      </div>

      {/* New Story Form */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        marginBottom: '40px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '20px' }}>
          Yeni Story Ekle
        </h3>

        <div className="admin-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Kısa Etiket (Label)</label>
            <input
              type="text"
              placeholder="Örn: Ford Özel"
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '6px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-highlight)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Bağlı Anket (Survey ID)</label>
            <input
              type="text"
              placeholder="srv_ford_01"
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '6px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-highlight)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Görsel URL (Story Image URL)</label>
          <input
            type="text"
            placeholder="https://..."
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '6px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-highlight)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '14px'
            }}
          />
        </div>

        <button style={{
          width: '100%',
          maxWidth: '300px',
          padding: '12px 24px',
          backgroundColor: 'var(--brand-navy)',
          color: '#FFFFFF',
          fontWeight: 700,
          borderRadius: '8px',
          fontSize: '14px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          Story Yayınla / Güncelle
        </button>
      </div>

      {/* Story List Table */}
      <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
        Aktif Story İçerikleri
      </h3>

      {/* Desktop View */}
      <div className="table-desktop-view" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-surface-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '14px 16px' }}>Sıra</th>
              <th style={{ padding: '14px 16px' }}>Etiket</th>
              <th style={{ padding: '14px 16px' }}>Bağlı Anket</th>
              <th style={{ padding: '14px 16px' }}>Görsel URL</th>
              <th style={{ padding: '14px 16px' }}>Durum</th>
            </tr>
          </thead>
          <tbody>
            {stories.map((st) => (
              <tr key={st.storyId} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '14px', color: 'var(--text-primary)' }}>
                <td style={{ padding: '14px 16px', fontWeight: 700 }}>#{st.position}</td>
                <td style={{ padding: '14px 16px', fontWeight: 600 }}>{st.label}</td>
                <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{st.surveyId}</td>
                <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>{st.imageUrl}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, backgroundColor: 'var(--success-bg)', color: 'var(--success-color)', border: '1px solid var(--success-border)' }}>
                    {st.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="card-mobile-view">
        {stories.map((st) => (
          <div key={st.storyId} style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>#{st.position} {st.label}</span>
              <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, backgroundColor: 'var(--success-bg)', color: 'var(--success-color)', border: '1px solid var(--success-border)' }}>
                {st.isActive ? 'Aktif' : 'Pasif'}
              </span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              <strong>Bağlı Anket:</strong> <span style={{ fontFamily: 'monospace' }}>{st.surveyId}</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
              {st.imageUrl}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
