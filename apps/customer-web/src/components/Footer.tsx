'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#00081C',
      borderTop: '1px solid var(--border-color)',
      padding: '72px 0 36px 0',
      color: 'var(--text-secondary)',
      fontSize: '14px'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '56px'
        }}>
          {/* 1. PAG Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src="/app_icon.png"
                alt="PAG Logo"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  objectFit: 'cover',
                  border: '1px solid rgba(183, 243, 74, 0.4)'
                }}
              />
              <span style={{ fontSize: '20px', fontWeight: '900', color: 'white' }}>
                PAG<span style={{ color: 'var(--brand-lime)' }}>.</span>
              </span>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Yeni nesil mobil anket, dinamik profil puanlama, kontrollü push bildirimleri ve nakit ödül ekosistemi.
            </p>

            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.5' }}>
              <p style={{ fontWeight: '700', color: 'white' }}>Alaf Teknoloji A.Ş.</p>
              <p style={{ marginTop: '2px' }}>Yakacık Çarşı Mah. Panorama Sok. No: 26</p>
              <p>Kartal / İstanbul, 34876, Türkiye</p>
              <p style={{ marginTop: '4px', color: 'var(--brand-lime)', fontFamily: 'monospace' }}>info@alafteknoloji.com</p>
            </div>
          </div>

          {/* 2. Bireysel Kullanıcılar */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>
              Bireysel Kullanıcılar
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link href="/#nasil-calisir" style={{ transition: 'color 0.2s' }}>⚡ PAG Nasıl Çalışır?</Link></li>
              <li><Link href="/#profil-puani" style={{ transition: 'color 0.2s' }}>⭐ Profil Puanı & Gruplar</Link></li>
              <li><Link href="/#simulasyon" style={{ color: 'var(--brand-lime)', fontWeight: 600 }}>🎮 Canlı Anket Simülatörü</Link></li>
              <li><Link href="/#oduller" style={{ transition: 'color 0.2s' }}>💸 Nakit & Çek Ödülleri</Link></li>
              <li><Link href="/#uygulamayi-taniyin" style={{ transition: 'color 0.2s' }}>📱 Mobil Ekranlar</Link></li>
            </ul>
          </div>

          {/* 3. Kurumsal Çözümler */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>
              Kurumsal Çözümler
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link href="/firmalar" style={{ color: '#60A5FA', fontWeight: 600 }}>🏢 Kurumsal Tanıtım</Link></li>
              <li><Link href="/#kurumsal">🎯 Mikro-Hedefleme & Analitik</Link></li>
              <li><Link href="/firma-basvuru" style={{ color: 'var(--brand-lime)' }}>🚀 Kurumsal Başvuru</Link></li>
              <li>
                <a href="https://app.pagapp.com.tr" target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>
                  🔑 Portal Girişi →
                </a>
              </li>
            </ul>
          </div>

          {/* 4. Yasal & Destek */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>
              Yasal & Destek
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link href="/terms" style={{ transition: 'color 0.2s' }}>Kullanım Koşulları & Sözleşme</Link></li>
              <li><Link href="/user-privacy" style={{ transition: 'color 0.2s' }}>KVKK Aydınlatma Metni</Link></li>
              <li><Link href="/explicit-consent" style={{ transition: 'color 0.2s' }}>Açık Rıza Metni</Link></li>
              <li><Link href="/commercial-communication" style={{ transition: 'color 0.2s' }}>Ticari İleti İzni</Link></li>
              <li><Link href="/reward-terms" style={{ transition: 'color 0.2s' }}>Ödül & Kampanya Koşulları</Link></li>
              <li><Link href="/privacy" style={{ transition: 'color 0.2s' }}>Gizlilik Politikası</Link></li>
              <li><Link href="/age-suitability" style={{ color: 'var(--brand-lime)', fontWeight: 600, transition: 'color 0.2s' }}>🔞 Yaş Uygunluğu (18+)</Link></li>
              <li><Link href="/support" style={{ transition: 'color 0.2s' }}>💬 PAG Destek Merkezi</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}>
          <div>
            © 2026 Alaf Teknoloji A.Ş. Tüm hakları saklıdır. PAG bir Alaf Teknoloji A.Ş. tescilli markasıdır.
          </div>
          <div>
            Resmi Web Sitesi: <span style={{ color: 'var(--brand-lime)', fontFamily: 'monospace' }}>https://www.pagapp.com.tr</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
