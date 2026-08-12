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
      <header style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold' }}>Hediye Çeki (Voucher Pool) Yönetimi</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Stok Havuzu Oluşturma ve Toplu Kupon Yükleme</p>
      </header>

      {/* New Voucher Pool Box */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        marginBottom: '40px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Yeni Kupon Havuzu Oluştur & Yükle</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Havuz Adı</label>
            <input
              type="text"
              placeholder="Örn: Ford 200 TL Bakım Çeki"
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
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Kupon Değeri (TL)</label>
            <input
              type="number"
              placeholder="100"
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
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Toplu Kupon Kodları (Her satıra 1 kod)</label>
          <textarea
            rows={4}
            placeholder={"CODE-1001-PAG\nCODE-1002-PAG\nCODE-1003-PAG"}
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
          Kupon Havuzunu Oluştur & Kodları Yükle
        </button>
      </div>

      {/* Existing Pools Grid */}
      <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Mevcut Kupon Havuzları</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {pools.map((p) => (
          <div key={p.poolId} style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--brand-lime)' }}>{p.name}</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>ID: {p.poolId}</p>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span>Toplam: <strong>{p.totalCount}</strong></span>
              <span style={{ color: 'var(--success-color)' }}>Kullanılabilir: <strong>{p.availableCount}</strong></span>
              <span style={{ color: 'var(--text-muted)' }}>Atanmış: <strong>{p.assignedCount}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
