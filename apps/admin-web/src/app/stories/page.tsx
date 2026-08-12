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
      <header style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold' }}>Story Bar Yönetimi</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Mobil Uygulama Story Akışı ve Anket Bağlantıları</p>
      </header>

      {/* PAG Logo Notice */}
      <div style={{
        padding: '16px',
        backgroundColor: 'var(--bg-surface)',
        borderLeft: '4px solid var(--brand-lime)',
        borderRadius: '8px',
        marginBottom: '32px',
        fontSize: '14px',
        color: 'var(--text-secondary)'
      }}>
        ℹ️ <strong>Bilgi:</strong> PAG logosunu taşıyan ilk sabit <em>HOME</em> hikaye elemanı mobil uygulamalar tarafından otomatik ilk sıraya eklenir. Buradan ankete bağlı olan Story içerikleri yönetilir.
      </div>

      {/* New Story Form */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        marginBottom: '40px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Yeni Story Ekle</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Kısa Etiket (Label)</label>
            <input
              type="text"
              placeholder="Örn: Ford Özel"
              style={{
                width: '100%',
                padding: '10px 12px',
                marginTop: '4px',
                backgroundColor: 'var(--bg-surface-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'white'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Bağlı Anket (Survey ID)</label>
            <input
              type="text"
              placeholder="srv_ford_01"
              style={{
                width: '100%',
                padding: '10px 12px',
                marginTop: '4px',
                backgroundColor: 'var(--bg-surface-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'white'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Görsel URL (Story Image URL)</label>
          <input
            type="text"
            placeholder="https://..."
            style={{
              width: '100%',
              padding: '10px 12px',
              marginTop: '4px',
              backgroundColor: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: 'white'
            }}
          />
        </div>

        <button style={{
          padding: '12px 24px',
          backgroundColor: 'var(--brand-lime)',
          color: '#011033',
          fontWeight: 'bold',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          Story Yayınla / Güncelle
        </button>
      </div>

      {/* Story List Table */}
      <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Aktif Story İçerikleri</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--bg-surface)', borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '13px' }}>
            <th style={{ padding: '16px' }}>Sıra</th>
            <th style={{ padding: '16px' }}>Etiket</th>
            <th style={{ padding: '16px' }}>Bağlı Anket</th>
            <th style={{ padding: '16px' }}>Görsel URL</th>
            <th style={{ padding: '16px' }}>Durum</th>
          </tr>
        </thead>
        <tbody>
          {stories.map((st) => (
            <tr key={st.storyId} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '14px' }}>
              <td style={{ padding: '16px', fontWeight: 'bold' }}>#{st.position}</td>
              <td style={{ padding: '16px', fontWeight: 500 }}>{st.label}</td>
              <td style={{ padding: '16px', fontFamily: 'monospace' }}>{st.surveyId}</td>
              <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '12px' }}>{st.imageUrl}</td>
              <td style={{ padding: '16px', color: 'var(--brand-lime)' }}>{st.isActive ? 'Aktif' : 'Pasif'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
