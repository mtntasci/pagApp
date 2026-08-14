'use client';

import React, { useState } from 'react';

export default function PushPrioritySimulator() {
  const [score, setScore] = useState<number>(1450);

  // Determine user batch & rank tier based on score
  const getTierInfo = (currentScore: number) => {
    if (currentScore >= 2000) {
      return {
        tier: 'Efsane Kategori (Elite)',
        batch: 1,
        timeOffset: '00:00 (Anında)',
        percentile: 'En Üst %5',
        badgeColor: 'var(--brand-lime)',
        statusText: '🚀 Bildirimi ilk 60 saniyede alırsın. Derece ödülü (TL / Çek) kazanma şansın maksimum!'
      };
    } else if (currentScore >= 1200) {
      return {
        tier: 'İleri Seviye (Advanced)',
        batch: 2,
        timeOffset: '+60 Saniye',
        percentile: 'Üst %20',
        badgeColor: '#38BDF8',
        statusText: '⚡ Bildirimi 2. grupta alırsın. Hızlı davranarak derece ödüllerine ulaşabilirsin.'
      };
    } else if (currentScore >= 600) {
      return {
        tier: 'Aktif Katılımcı (Standard)',
        batch: 3,
        timeOffset: '+120 Saniye',
        percentile: 'Orta %50',
        badgeColor: '#FBBF24',
        statusText: '⏳ Bildirimi 3. grupta alırsın. Profil anketlerini doldurarak puanını yükselt ve 1. Gruba tırman!'
      };
    } else {
      return {
        tier: 'Yeni Başlayan (Starter)',
        batch: 4,
        timeOffset: '+180 Saniye',
        percentile: 'Başlangıç',
        badgeColor: '#94A3B8',
        statusText: '🌱 Bildirimi son grupta alırsın. Profilini tamamlayıp videoları izleyerek hızla puan kazanabilirsin.'
      };
    }
  };

  const info = getTierInfo(score);

  return (
    <div className="glass-card" style={{ padding: '36px 28px', border: '1px solid var(--border-blue-highlight)' }}>
      {/* Header badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <span className="badge-blue">⚡ Algoritma & Sıralama Simülatörü</span>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Kademeli Bildirim Mimarisi (Push Batching)
        </span>
      </div>

      <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>
        Profil Puanın Bildirim Hızını Nasıl Belirler?
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '28px', lineHeight: '1.6' }}>
        Kaydırıcıyı hareket ettirerek farklı Profil Puanlarında bildirim alma sıranızın ve ödül avantajınızın nasıl değiştiğini canlı görün.
      </p>

      {/* Score slider control */}
      <div style={{
        backgroundColor: 'var(--bg-surface-secondary)',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Simüle Edilen Profil Puanı:</span>
          <span style={{ fontSize: '24px', fontWeight: '900', color: info.badgeColor }}>{score} Puan</span>
        </div>

        <input
          type="range"
          min="100"
          max="3000"
          step="50"
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          style={{
            width: '100%',
            accentColor: 'var(--brand-lime)',
            cursor: 'pointer',
            height: '8px'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
          <span>100 P (Başlangıç)</span>
          <span>1000 P</span>
          <span>2000 P</span>
          <span>3000 P (Efsane)</span>
        </div>
      </div>

      {/* Batch delivery timeline visual */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'white', marginBottom: '14px' }}>
          📦 Bildirim Dağıtım Kuyruğu (Push Batches):
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          {[
            { batchNum: 1, time: '00:00 (1. Grup)', label: 'Batch 1', threshold: '2000+ P' },
            { batchNum: 2, time: '+60 sn (2. Grup)', label: 'Batch 2', threshold: '1200+ P' },
            { batchNum: 3, time: '+120 sn (3. Grup)', label: 'Batch 3', threshold: '600+ P' },
            { batchNum: 4, time: '+180 sn (4. Grup)', label: 'Batch 4', threshold: '100+ P' }
          ].map((b) => {
            const isUserBatch = info.batch === b.batchNum;
            return (
              <div
                key={b.batchNum}
                style={{
                  padding: '14px 10px',
                  borderRadius: '12px',
                  backgroundColor: isUserBatch ? 'rgba(183, 243, 74, 0.15)' : 'var(--bg-surface)',
                  border: isUserBatch ? '2px solid var(--brand-lime)' : '1px solid var(--border-color)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
              >
                {isUserBatch && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'var(--brand-lime)',
                    color: '#010C26',
                    fontSize: '9px',
                    fontWeight: '900',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    whiteSpace: 'nowrap'
                  }}>
                    SENİN GRUBUN
                  </div>
                )}
                <div style={{ fontSize: '14px', fontWeight: '800', color: isUserBatch ? 'var(--brand-lime)' : 'white' }}>
                  {b.label}
                </div>
                <div style={{ fontSize: '11px', color: isUserBatch ? '#FFFFFF' : 'var(--text-secondary)', marginTop: '4px' }}>
                  {b.time}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {b.threshold}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic calculation result card */}
      <div style={{
        padding: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '14px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mevcut Statü</span>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>{info.tier} ({info.percentile})</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bildirim Alma Zamanı</span>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--brand-lime)' }}>{info.timeOffset}</div>
          </div>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
          {info.statusText}
        </p>
      </div>
    </div>
  );
}
