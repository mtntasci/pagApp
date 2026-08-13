'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#000A24',
      borderTop: '1px solid var(--border-color)',
      padding: '64px 0 32px 0',
      color: 'var(--text-secondary)',
      fontSize: '14px'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '48px'
        }}>
          {/* 1. PAG Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src="/logo.png"
                alt="PAG Logo"
                style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'contain' }}
              />
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Kullanıcı profil sıralaması, kontrollü push bildirimleri ve hedeflenmiş anket ekosistemi.
            </p>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              <p style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Ürün Sahibi: Alaf Teknoloji A.Ş.</p>
              <p style={{ marginTop: '4px' }}>Yakacık Çarşı Mah. Panorama Sok. No: 26</p>
              <p>Kartal / İstanbul, 34876, Türkiye</p>
              <p style={{ marginTop: '4px', fontFamily: 'monospace' }}>info@alafteknoloji.com</p>
              <p style={{ marginTop: '2px', color: 'var(--brand-lime)' }}>alafteknoloji.com</p>
            </div>
          </div>

          {/* 2. Kurumsal Çözümler Links */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Kurumsal Çözümler</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link href="/firmalar" style={{ color: 'var(--brand-lime)', fontWeight: 600 }}>Kurumsal</Link></li>
              <li><Link href="/firma-basvuru">Kurumsal Başvuru</Link></li>
              <li>
                <a href="https://app.pagapp.com.tr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)' }}>
                  🏢 Kurumsal Giriş (Portal)
                </a>
              </li>
            </ul>
          </div>

          {/* 3. Kurumsal Links */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Kurumsal</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link href="/iletisim">Alaf Teknoloji A.Ş.</Link></li>
              <li><Link href="/iletisim">İletişim</Link></li>
            </ul>
          </div>

          {/* 4. Yasal Links */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Yasal</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link href="/kvkk">KVKK Aydınlatma Metni</Link></li>
              <li><Link href="/gizlilik">Gizlilik Politikası</Link></li>
              <li><Link href="/kullanim-kosullari">Kullanım Koşulları</Link></li>
            </ul>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}>
          <div>
            © 2026 Alaf Teknoloji A.Ş. Tüm hakları saklıdır. PAG bir Alaf Teknoloji A.Ş. ürünüdür.
          </div>
          <div>
            Canonical Domain: <span style={{ color: 'var(--brand-lime)', fontFamily: 'monospace' }}>https://www.pagapp.com.tr</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
