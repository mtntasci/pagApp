'use client';

import React, { useState } from 'react';

export default function DeviceMockups() {
  const [activeScreen, setActiveScreen] = useState<'home' | 'survey' | 'score' | 'rewards' | 'profile'>('home');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
      {/* Screen Selectors */}
      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-surface)',
        padding: '6px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        {[
          { id: 'home', label: '📱 Ana Sayfa & Story' },
          { id: 'survey', label: '📝 Anket (Maks 3 Soru)' },
          { id: 'score', label: '⭐ Profil Puanı' },
          { id: 'rewards', label: '🎁 Ödüller' },
          { id: 'profile', label: '👤 Profil Güçlendirme' }
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setActiveScreen(btn.id as any)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeScreen === btn.id ? 'var(--brand-lime)' : 'transparent',
              color: activeScreen === btn.id ? '#011033' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Mobile Device Frame */}
      <div className="device-shell">
        <div className="device-notch"></div>

        {/* Screen Content Render */}
        <div style={{ flex: 1, backgroundColor: '#011033', padding: '36px 16px 20px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Header Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '24px', height: '24px', backgroundColor: 'rgba(183,243,74,0.2)', border: '1px solid var(--brand-lime)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--brand-lime)' }}>PAG</span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 'bold' }}>PAG Mobil</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--brand-lime)', backgroundColor: 'rgba(183,243,74,0.1)', padding: '2px 8px', borderRadius: '10px' }}>
              Puan: 850
            </span>
          </div>

          {/* SCREEN 1: HOME */}
          {activeScreen === 'home' && (
            <>
              {/* Story Bar */}
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Öne Çıkanlar</span>
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {['Teknoloji', 'Otomotiv', 'Spor', 'Moda'].map((cat, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--brand-lime)', backgroundColor: 'var(--bg-surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                        {i === 0 ? '💻' : i === 1 ? '🚗' : i === 2 ? '⚽' : '👟'}
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{cat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Survey Card */}
              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-highlight)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', backgroundColor: 'rgba(57,119,246,0.2)', color: '#3977F6', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Özel Anket</span>
                  <span style={{ fontSize: '10px', color: 'var(--brand-lime)', fontWeight: 'bold' }}>+150 Profil Puanı</span>
                </div>
                <h5 style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '6px' }}>Teknoloji ve Akıllı Cihaz Tercihleri</h5>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Maksimum 3 Soru • Katılım Limiti Mevcut</p>
                <div style={{ marginTop: '10px', padding: '6px', backgroundColor: 'var(--brand-lime)', color: '#011033', textAlign: 'center', borderRadius: '6px', fontWeight: 'bold', fontSize: '11px' }}>
                  Ankete Başla →
                </div>
              </div>

              {/* Engagement Ad Card */}
              <div style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'white' }}>🎬 Günlük Video İnceleme</div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>Kısa tanıtım izle, +50 Profil Puanı kazan.</div>
              </div>
            </>
          )}

          {/* SCREEN 2: SURVEY */}
          {activeScreen === 'survey' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <span>Soru 1 / 3</span>
                <span style={{ color: 'var(--brand-lime)', fontWeight: 'bold' }}>Single Select</span>
              </div>
              <div style={{ height: '4px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: '33%', height: '100%', backgroundColor: 'var(--brand-lime)' }}></div>
              </div>
              <h5 style={{ fontSize: '13px', fontWeight: 'bold', color: 'white', marginTop: '4px' }}>
                Hangi akıllı telefon işletim sistemini tercih ediyorsunuz?
              </h5>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                {['iOS (Apple)', 'Android (Google)', 'Diğer / Kararsızım'].map((opt, i) => (
                  <div key={i} style={{
                    padding: '10px',
                    backgroundColor: i === 0 ? 'rgba(183, 243, 74, 0.15)' : 'var(--bg-surface-secondary)',
                    border: i === 0 ? '1px solid var(--brand-lime)' : '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: i === 0 ? 'bold' : 'normal',
                    color: i === 0 ? 'var(--brand-lime)' : 'white'
                  }}>
                    {opt}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '12px', padding: '8px', backgroundColor: 'var(--brand-lime)', color: '#011033', textAlign: 'center', borderRadius: '6px', fontWeight: 'bold', fontSize: '11px' }}>
                Sonraki Soruya Geç →
              </div>
            </div>
          )}

          {/* SCREEN 3: PROFILE SCORE */}
          {activeScreen === 'score' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '16px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-highlight)' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Mevcut Profil Puanınız</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--brand-lime)', marginTop: '4px' }}>850 Puan</div>
                <span style={{ fontSize: '10px', color: 'var(--success-color)' }}>Top 5% Kullanıcı Sıralaması</span>
              </div>

              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Son Puan Hareketleri (Ledger)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { title: 'Teknoloji Anketi Katılımı', pts: '+150 Puan', date: 'Bugün' },
                  { title: 'Telefon Doğrulaması', pts: '+200 Puan', date: 'Dün' },
                  { title: 'Temel Profil Tamamlama', pts: '+500 Puan', date: '3 gün önce' }
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '8px 10px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 'bold' }}>{item.title}</div>
                      <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{item.date}</div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--brand-lime)' }}>{item.pts}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN 4: REWARDS */}
          {activeScreen === 'rewards' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Birikmiş Bakiye</span>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginTop: '2px' }}>250.00 TL</div>
                <div style={{ fontSize: '10px', color: 'var(--brand-lime)', marginTop: '4px' }}>Minimum çekim eşiğine ulaşıldı</div>
              </div>

              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Kazanılan Hediye Çekleri</div>
              <div style={{ padding: '10px', backgroundColor: 'rgba(57,119,246,0.15)', border: '1px solid #3977F6', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'white' }}>50 TL Hediye Çeki (Örn: McDonald's)</div>
                <div style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--brand-lime)', fontWeight: 'bold', marginTop: '4px' }}>PAG-MC-8829-44</div>
                <div style={{ fontSize: '9px', color: 'var(--text-secondary)', marginTop: '2px' }}>Kullanım Durumu: Aktif</div>
              </div>
            </div>
          )}

          {/* SCREEN 5: PROFILE */}
          {activeScreen === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span>Temel Profil Tamamlama</span>
                  <span style={{ color: 'var(--brand-lime)', fontWeight: 'bold' }}>%100</span>
                </div>
              </div>

              {/* "Profilini Güçlendir" Card */}
              <div style={{ backgroundColor: 'rgba(183, 243, 74, 0.1)', border: '1px solid var(--brand-lime)', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--brand-lime)' }}>⚡ Profilini Güçlendir</div>
                <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Ek sorulara yanıt vererek daha fazla Profil Puanı kazan ve yeni anketlere öncelikle ulaş!
                </p>
                <div style={{ marginTop: '8px', padding: '4px', backgroundColor: 'var(--brand-lime)', color: '#011033', textAlign: 'center', borderRadius: '4px', fontWeight: 'bold', fontSize: '10px' }}>
                  Profil Sorularını Gör →
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
