'use client';

import React, { useState } from 'react';

export default function VouchersPage() {
  const [pools] = useState([
    {
      poolId: 'pool_mcdonalds',
      name: "McDonald's Turkey Menü Havuzu",
      orgId: 'org_mcdonalds',
      totalCount: 50,
      availableCount: 42,
      assignedCount: 8
    },
    {
      poolId: 'pool_nike',
      name: 'Nike 100 TL Çek Havuzu',
      orgId: 'org_nike',
      totalCount: 100,
      availableCount: 85,
      assignedCount: 15
    }
  ]);

  return (
    <div>
      <header style={{ marginBottom: '24px' }}>
        <h2 className="admin-header-title" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
          Hediye Çeki (Voucher Pool) Yönetimi
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px', fontWeight: 500 }}>
          Stok Havuzu Oluşturma ve Toplu Kupon Yükleme
        </p>
      </header>

      {/* New Voucher Pool Box */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        marginBottom: '40px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '20px' }}>
          Yeni Kupon Havuzu Oluştur & Yükle
        </h3>

        <div className="admin-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Havuz Adı</label>
            <input
              type="text"
              placeholder="Örn: Ford 200 TL Bakım Çeki"
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
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Kupon Değeri (TL)</label>
            <input
              type="number"
              placeholder="100"
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
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Toplu Kupon Kodları (Her satıra 1 kod)</label>
          <textarea
            rows={4}
            placeholder={"CODE-1001-PAG\nCODE-1002-PAG\nCODE-1003-PAG"}
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
          maxWidth: '360px',
          padding: '12px 24px',
          backgroundColor: 'var(--brand-navy)',
          color: '#FFFFFF',
          fontWeight: 700,
          borderRadius: '8px',
          fontSize: '14px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          Kupon Havuzunu Oluştur & Kodları Yükle
        </button>
      </div>

      {/* Existing Pools Grid */}
      <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
        Mevcut Kupon Havuzları
      </h3>
      <div className="admin-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {pools.map((p) => (
          <div key={p.poolId} style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--brand-navy)' }}>{p.name}</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'monospace' }}>ID: {p.poolId}</p>

            <div style={{ marginTop: '16px', padding: '12px 14px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'space-between', fontSize: '13px' }}>
              <span>Toplam: <strong>{p.totalCount}</strong></span>
              <span style={{ color: 'var(--success-color)', fontWeight: 700 }}>Kullanılabilir: <strong>{p.availableCount}</strong></span>
              <span style={{ color: 'var(--text-secondary)' }}>Atanmış: <strong>{p.assignedCount}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
