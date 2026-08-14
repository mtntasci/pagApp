'use client';

import React, { useState } from 'react';

export default function PushPrioritySimulator() {
  const [score, setScore] = useState<number>(1450);

  // Determine user batch & rank tier based on gemstone/precious metal hierarchy
  const getTierInfo = (currentScore: number) => {
    if (currentScore >= 2000) {
      return {
        tier: 'Elmas Grubu (1. Dağıtım)',
        icon: '💎',
        batch: 1,
        batchName: 'Elmas',
        timeOffset: '00:00 (İlk 60 sn)',
        percentile: 'En Üst %5',
        badgeColor: 'var(--brand-lime)',
        statusText: '🚀 Elmas Grubu! Bildirimi ilk 60 saniyede alırsın. Derece ödülü (TL / Çek) kazanma şansın maksimum!'
      };
    } else if (currentScore >= 1200) {
      return {
        tier: 'Yakut Grubu (2. Dağıtım)',
        icon: '🔴',
        batch: 2,
        batchName: 'Yakut',
        timeOffset: '+60 Saniye',
        percentile: 'Üst %20',
        badgeColor: '#F43F5E',
        statusText: '⚡ Yakut Grubu! Bildirimi 2. grupta (+60 sn) alırsın. Hızlı davranarak derece ödüllerine kolayca ulaşabilirsin.'
      };
    } else if (currentScore >= 600) {
      return {
        tier: 'Altın Grubu (3. Dağıtım)',
        icon: '🟡',
        batch: 3,
        batchName: 'Altın',
        timeOffset: '+120 Saniye',
        percentile: 'Orta %50',
        badgeColor: '#F59E0B',
        statusText: '⏳ Altın Grubu! Bildirimi 3. grupta (+120 sn) alırsın. Profil sorularını tamamlayarak puanını yükselt, Yakut ve Elmas gruplarına tırman!'
      };
    } else {
      return {
        tier: 'Gümüş Grubu (4. Dağıtım)',
        icon: '⚪',
        batch: 4,
        batchName: 'Gümüş',
        timeOffset: '+180 Saniye',
        percentile: 'Başlangıç',
        badgeColor: '#94A3B8',
        statusText: '🌱 Gümüş Grubu! Bildirimi 4. grupta alırsın. Profilini tamamlayıp kısa videolar izleyerek hızla Altın ve üzeri gruplara geçebilirsin.'
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
          Kademeli Bildirim Grupları
        </span>
      </div>

      <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>
        Profil Puanın Bildirim Grubunu Nasıl Belirler?
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '28px', lineHeight: '1.6' }}>
        Puan kaydırıcısını hareket ettirerek <strong>Elmas, Yakut, Altın ve Gümüş</strong> dağıtım gruplarındaki yerinizi ve erken bildirim avantajınızı canlı görün.
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
          <span style={{ fontSize: '24px', fontWeight: '900', color: info.badgeColor }}>
            {info.icon} {score} Puan
          </span>
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
          <span>⚪ Gümüş (100 P)</span>
          <span>🟡 Altın (600 P)</span>
          <span>🔴 Yakut (1200 P)</span>
          <span>💎 Elmas (2000+ P)</span>
        </div>
      </div>

      {/* Batch delivery timeline visual with Gemstone/Metal names */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'white', marginBottom: '14px' }}>
          📦 Kademeli Bildirim Dağıtım Grupları (Değer Sıralaması):
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          {[
            { batchNum: 1, name: 'Elmas Grubu', icon: '💎', time: '00:00 (1. Grup)', threshold: '2000+ P', color: 'var(--brand-lime)' },
            { batchNum: 2, name: 'Yakut Grubu', icon: '🔴', time: '+60 sn (2. Grup)', threshold: '1200+ P', color: '#F43F5E' },
            { batchNum: 3, name: 'Altın Grubu', icon: '🟡', time: '+120 sn (3. Grup)', threshold: '600+ P', color: '#F59E0B' },
            { batchNum: 4, name: 'Gümüş Grubu', icon: '⚪', time: '+180 sn (4. Grup)', threshold: '100+ P', color: '#94A3B8' }
          ].map((b) => {
            const isUserBatch = info.batch === b.batchNum;
            return (
              <div
                key={b.batchNum}
                style={{
                  padding: '16px 10px',
                  borderRadius: '14px',
                  backgroundColor: isUserBatch ? 'rgba(183, 243, 74, 0.15)' : 'var(--bg-surface)',
                  border: isUserBatch ? `2px solid ${b.color}` : '1px solid var(--border-color)',
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
                    backgroundColor: b.color,
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
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{b.icon}</div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: isUserBatch ? b.color : 'white' }}>
                  {b.name}
                </div>
                <div style={{ fontSize: '11px', color: isUserBatch ? '#FFFFFF' : 'var(--text-secondary)', marginTop: '4px', fontWeight: 600 }}>
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
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Kazanılan Grup</span>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>
              {info.icon} {info.tier} ({info.percentile})
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bildirim Zamanı</span>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: info.badgeColor }}>{info.timeOffset}</div>
          </div>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
          {info.statusText}
        </p>
      </div>
    </div>
  );
}
