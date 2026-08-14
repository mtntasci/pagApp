'use client';

import React, { useState } from 'react';

export default function DeviceMockups() {
  const [activeScreen, setActiveScreen] = useState<'home' | 'story' | 'survey' | 'rewards' | 'profile'>('home');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', width: '100%' }}>
      {/* Screen Selectors */}
      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-surface-secondary)',
        padding: '8px',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
      }}>
        {[
          { id: 'home', label: '📱 Ana Sayfa' },
          { id: 'story', label: '⚡ Story Bar' },
          { id: 'survey', label: '📝 3 Soruluk Anket' },
          { id: 'rewards', label: '🎁 Ödül Cüzdanı' },
          { id: 'profile', label: '👤 Profil Güçlendirme' }
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setActiveScreen(btn.id as any)}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeScreen === btn.id ? 'var(--brand-lime)' : 'transparent',
              color: activeScreen === btn.id ? '#010C26' : 'var(--text-secondary)',
              transition: 'all 0.25s ease',
              boxShadow: activeScreen === btn.id ? '0 4px 14px rgba(183, 243, 74, 0.3)' : 'none'
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Mobile Device Frame */}
      <div className="device-shell">
        <div className="device-notch">
          <div className="device-notch-lens"></div>
        </div>

        {/* Screen Content Render */}
        <div style={{
          flex: 1,
          backgroundColor: '#010C26',
          padding: '38px 16px 20px 16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          scrollbarWidth: 'none'
        }}>
          {/* Header Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            paddingBottom: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img
                src="/app_icon.png"
                alt="PAG Logo"
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  objectFit: 'cover',
                  border: '1px solid rgba(183, 243, 74, 0.4)'
                }}
              />
              <span style={{ fontSize: '13px', fontWeight: '800', color: 'white' }}>PAG Mobil</span>
            </div>
            <div style={{
              fontSize: '11px',
              color: 'var(--brand-lime)',
              backgroundColor: 'rgba(183,243,74,0.12)',
              border: '1px solid rgba(183,243,74,0.3)',
              padding: '3px 10px',
              borderRadius: '12px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              ⭐ 850 P
            </div>
          </div>

          {/* SCREEN 1: HOME */}
          {activeScreen === 'home' && (
            <>
              {/* User greeting */}
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                padding: '12px 14px',
                borderRadius: '14px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Öncelikli Bildirim Akışı</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', marginTop: '2px' }}>
                    1 Yeni Anket Mevcut 🔥
                  </div>
                </div>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(57,119,246,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px'
                }}>
                  🔔
                </div>
              </div>

              {/* Live Survey Card */}
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                padding: '14px',
                borderRadius: '16px',
                border: '1px solid var(--border-highlight)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', backgroundColor: 'rgba(57,119,246,0.25)', color: '#60A5FA', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                    🏢 Ford Otosan
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--brand-lime)', fontWeight: 'bold' }}>
                    +150 Profil Puanı & 100 TL
                  </span>
                </div>

                <div>
                  <h5 style={{ fontSize: '13px', fontWeight: 'bold', color: 'white' }}>
                    Elektrikli Araç ve Şarj Tercihleri
                  </h5>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                    Maks. 3 Soru • Süre: ~30 saniye
                  </p>
                </div>

                <div style={{
                  padding: '8px',
                  backgroundColor: 'var(--brand-lime)',
                  color: '#010C26',
                  textAlign: 'center',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}>
                  Ankete Başla (Hızlı Katılım) →
                </div>
              </div>

              {/* Engagement task */}
              <div style={{
                backgroundColor: 'var(--bg-surface-secondary)',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{ fontSize: '20px' }}>🎬</div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'white' }}>Günlük Video Görevi</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Kısa tanıtım izle, +50 Profil Puanı kap.</div>
                </div>
              </div>
            </>
          )}

          {/* SCREEN 2: STORY BAR */}
          {activeScreen === 'story' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  24 Saatlik Marka Hikayeleri
                </span>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
                  {[
                    { name: 'Ford', icon: '🚗', color: 'var(--brand-lime)' },
                    { name: 'McDonald’s', icon: '🍔', color: '#F59E0B' },
                    { name: 'Kahve', icon: '☕', color: '#38BDF8' },
                    { name: 'Teknoloji', icon: '💻', color: '#A855F7' }
                  ].map((cat, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                      <div style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '50%',
                        border: `2px solid ${cat.color}`,
                        backgroundColor: 'var(--bg-surface-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                        boxShadow: `0 0 10px ${cat.color}40`
                      }}>
                        {cat.icon}
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600 }}>{cat.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--bg-surface)',
                padding: '14px',
                borderRadius: '14px',
                border: '1px solid var(--border-highlight)',
                marginTop: '6px'
              }}>
                <span style={{ fontSize: '10px', color: 'var(--brand-lime)', fontWeight: 'bold' }}>⭐ Marka Özel Vitrini</span>
                <h5 style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '4px', color: 'white' }}>
                  Yeni Nesil Elektrikli Lansman Story
                </h5>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.5' }}>
                  Onaylanmış kurumsal anketler ve promosyonlar mobil uygulamanın en üst hikaye bandında yer alır.
                </p>
              </div>
            </div>
          )}

          {/* SCREEN 3: SURVEY */}
          {activeScreen === 'survey' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <span>Soru 1 / 3</span>
                <span style={{ color: 'var(--brand-lime)', fontWeight: 'bold' }}>⚡ Single Select</span>
              </div>
              <div style={{ height: '4px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: '33%', height: '100%', backgroundColor: 'var(--brand-lime)' }}></div>
              </div>

              <h5 style={{ fontSize: '13px', fontWeight: 'bold', color: 'white', marginTop: '4px', lineHeight: '1.4' }}>
                Haftalık kahve tüketiminde en çok hangi türü tercih ediyorsunuz?
              </h5>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                {['Filtre Kahve / Americano', 'Sütlü Kahveler (Latte / Cappuccino)', 'Geleneksel Türk Kahvesi', 'Soğuk Demleme (Cold Brew)'].map((opt, i) => (
                  <div key={i} style={{
                    padding: '10px 12px',
                    backgroundColor: i === 0 ? 'rgba(183, 243, 74, 0.15)' : 'var(--bg-surface-secondary)',
                    border: i === 0 ? '1px solid var(--brand-lime)' : '1px solid var(--border-color)',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: i === 0 ? 'bold' : 'normal',
                    color: i === 0 ? 'var(--brand-lime)' : 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>{opt}</span>
                    {i === 0 && <span style={{ fontSize: '12px' }}>✓</span>}
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: '10px',
                padding: '10px',
                backgroundColor: 'var(--brand-lime)',
                color: '#010C26',
                textAlign: 'center',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '11px'
              }}>
                Sonraki Soruya Geç (2/3) →
              </div>
            </div>
          )}

          {/* SCREEN 4: REWARDS */}
          {activeScreen === 'rewards' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                padding: '14px',
                borderRadius: '14px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
              }}>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Birikmiş Nakit Bakiye</span>
                <div style={{ fontSize: '26px', fontWeight: '900', color: 'white', marginTop: '2px' }}>
                  350.00 TL
                </div>
                <div style={{ fontSize: '10px', color: 'var(--brand-lime)', marginTop: '4px', fontWeight: 'bold' }}>
                  ✓ Minimum çekim eşiğine ulaşıldı
                </div>
                <div style={{
                  marginTop: '10px',
                  padding: '6px 12px',
                  backgroundColor: 'rgba(57,119,246,0.2)',
                  border: '1px solid #3977F6',
                  borderRadius: '6px',
                  color: '#93C5FD',
                  textAlign: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>
                  IBAN Çekim Talebi Oluştur
                </div>
              </div>

              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                Kazanılan Dijital Hediye Çekleri
              </div>

              <div style={{
                padding: '10px 12px',
                backgroundColor: 'rgba(57,119,246,0.15)',
                border: '1px dashed #3977F6',
                borderRadius: '10px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'white' }}>🍔 McDonald’s 50 TL Menü Çeki</div>
                <div style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--brand-lime)', fontWeight: 'bold', marginTop: '4px' }}>
                  PAG-MC-9941-82
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-secondary)', marginTop: '2px' }}>Durum: Kullanıma Hazır</div>
              </div>
            </div>
          )}

          {/* SCREEN 5: PROFILE */}
          {activeScreen === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
                  <span style={{ color: 'white', fontWeight: 600 }}>Profil Doluluk Oranı</span>
                  <span style={{ color: 'var(--brand-lime)', fontWeight: 'bold' }}>%92</span>
                </div>
                <div style={{ height: '5px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '92%', height: '100%', backgroundColor: 'var(--brand-lime)' }}></div>
                </div>
              </div>

              {/* Profile Booster */}
              <div style={{
                backgroundColor: 'rgba(183, 243, 74, 0.1)',
                border: '1px solid var(--brand-lime)',
                padding: '12px',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--brand-lime)' }}>
                  ⚡ Profilini Güçlendir (+120 P)
                </div>
                <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                  Otomotiv ve teknoloji tercih sorularını yanıtla, Profil Puanını 970'e çıkararak 1. Bildirim Grubuna yüksel!
                </p>
                <div style={{
                  marginTop: '8px',
                  padding: '6px',
                  backgroundColor: 'var(--brand-lime)',
                  color: '#010C26',
                  textAlign: 'center',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  fontSize: '10px'
                }}>
                  Soruları Yanıtla →
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
