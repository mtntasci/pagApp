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
          {/* Company & Product Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                backgroundColor: 'rgba(183, 243, 74, 0.15)',
                border: '1px solid var(--brand-lime)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontWeight: 'bold', color: 'var(--brand-lime)', fontSize: '16px' }}>PAG</span>
              </div>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFFFFF' }}>PAG</span>
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

          {/* Product Links */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Ürün</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link href="/#nedir">PAG Nedir?</Link></li>
              <li><Link href="/#nasil-calisir">Nasıl Çalışır?</Link></li>
              <li><Link href="/#profil-puani">Profil Puanı</Link></li>
              <li><Link href="/#oduller">Ödüller</Link></li>
            </ul>
          </div>

          {/* Business Links */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Firmalar</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link href="/firmalar" style={{ color: 'var(--brand-lime)', fontWeight: 600 }}>Firmalar İçin</Link></li>
              <li><Link href="/firma-basvuru">Firma Başvurusu</Link></li>
              <li>
                <a href="https://app.pagapp.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)' }}>
                  🏢 Firma Girişi (Portal)
                </a>
              </li>
            </ul>
          </div>

          {/* Corporate Links */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Kurumsal</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link href="/iletisim">Alaf Teknoloji A.Ş.</Link></li>
              <li><Link href="/iletisim">İletişim</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
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
