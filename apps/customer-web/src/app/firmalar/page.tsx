'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AudienceTargetingDemo from '@/components/AudienceTargetingDemo';

export default function FirmalarPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden' }}>
      <Header />

      <main style={{ flex: 1, padding: '70px 0 90px 0' }} className="bg-corporate-mesh">
        <div className="container">
          
          {/* Header Hero */}
          <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 64px auto' }}>
            <div className="badge-blue">🏢 Kurumsal Anket & Hedefleme Platformu</div>
            <h1 style={{ fontSize: '46px', fontWeight: '900', marginTop: '16px', color: 'white', lineHeight: '1.2' }}>
              Markanız İçin Hassas Hedefleme, <br />
              <span className="text-gradient-blue">Yüksek Yanıt Oranı ve Gerçek Veri</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '16px', fontSize: '18px', lineHeight: '1.6' }}>
              PAG, markaların doğrudan hedefledikleri demografik ve coğrafi kitleye maksimum 3 soruda ulaşmasını sağlayan, kullanıcı motivasyonunu ödüllerle canlı tutan yeni nesil kurumsal mikro-profilleme platformudur.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px', flexWrap: 'wrap' }}>
              <Link href="/firma-basvuru" className="btn-lime" style={{ padding: '16px 32px' }}>
                🚀 Kurumsal Başvuru Yap
              </Link>
              <a href="https://app.pagapp.com.tr" target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ padding: '16px 32px' }}>
                🏢 Kurumsal Portal Girişi →
              </a>
            </div>
          </div>

          {/* Interactive Audience Targeting Playground */}
          <div style={{ marginBottom: '80px' }}>
            <AudienceTargetingDemo />
          </div>

          {/* SECTION 1: HEDEF KİTLE KRİTERLERİ */}
          <div style={{ marginBottom: '72px' }}>
            <div className="badge-lime" style={{ marginBottom: '12px' }}>01. Hedef Kitle Kriterleri</div>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '24px' }}>
              Zengin Mikro-Profil Kriterleri ile Tam İsabet
            </h2>

            <div className="responsive-grid-4">
              {[
                { title: '🎂 Yaş & Demografi', desc: 'Belirli yaş aralıkları (Örn: 18–24, 25–34, 35–44) veya özel yaş grubu filtreleri.' },
                { title: '💍 Medeni Durum', desc: 'Bekar, evli veya hedeflenen medeni durum segmentlerine özel kurgular.' },
                { title: '👶 Çocuk Durumu', desc: 'Çocuğu olan, olmayan veya belirli yaş grubunda çocuğu bulunan ebeveynler.' },
                { title: '🏠 İkamet & Lokasyon', desc: 'İkamet edilen şehir, ilçe veya doğduğu memleket kırılımları.' }
              ].map((item, idx) => (
                <div key={idx} className="glass-card" style={{ padding: '28px 22px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--brand-lime)', marginBottom: '10px' }}>{item.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: LOKASYON HEDEFLEME */}
          <div style={{ marginBottom: '72px', backgroundColor: 'var(--bg-surface)', padding: '44px 36px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <div className="badge-blue" style={{ marginBottom: '12px' }}>02. Coğrafi Hassasiyet</div>
            <h2 style={{ fontSize: '30px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
              İl, İlçe ve Mahalle Seviyesinde Kitle Erişimi
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '780px', lineHeight: '1.7' }}>
              Anket kampanyanızı yalnızca belirli bir şehirde değil, hedeflenen İlçe veya spesifik Mahalle seviyesinde kurgulayabilirsiniz. Mağaza açılışları, bölgesel promosyonlar, şube memnuniyet araştırmaları ve yerel saha çalışmaları için benzersiz bir hız sağlar.
            </p>
          </div>

          {/* SECTION 3: KİTLE KURGUSU & MANTIĞI (AND / OR) */}
          <div style={{ marginBottom: '72px' }}>
            <div className="badge-lime" style={{ marginBottom: '12px' }}>03. Mantıksal Filtre Grubu</div>
            <h2 style={{ fontSize: '30px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
              Gelişmiş Mantıksal Filtre Mimarisi (AND / OR)
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '24px' }}>
              Farklı kriter grupları arasında <strong>AND (VE)</strong>, aynı kriter alanı içerisinde <strong>OR (VEYA)</strong> mantığı uygulanır.
            </p>

            <div className="glass-card" style={{ padding: '36px', border: '1px solid var(--border-highlight)' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--brand-lime)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Örnek Hedef Kitle Kurgusu:
              </div>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', fontSize: '15px', fontWeight: 600 }}>
                <span style={{ padding: '10px 18px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  [25 – 35 Yaş]
                </span>
                <span style={{ color: 'var(--brand-lime)', fontWeight: '900' }}>AND</span>
                <span style={{ padding: '10px 18px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  [İstanbul / Kadıköy OR Beşiktaş]
                </span>
                <span style={{ color: 'var(--brand-lime)', fontWeight: '900' }}>AND</span>
                <span style={{ padding: '10px 18px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  [Evli]
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 4: RAPORLAMA VE PII KORUMASI */}
          <div className="responsive-grid-2" style={{ marginBottom: '72px' }}>
            <div className="glass-card" style={{ padding: '36px' }}>
              <div className="badge-lime" style={{ marginBottom: '12px' }}>04. Canlı Analitik & Raporlama</div>
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>
                Gerçek Zamanlı Müşteri Portalı
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Anket yanıt sayıları, cevap dağılım grafikleri, katılım hızı metrikleri ve yaş/cinsiyet filtre kırılımları kurumsal portalınızda anlık olarak güncellenir.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '36px', border: '1px solid #3977F6' }}>
              <div className="badge-blue" style={{ marginBottom: '12px' }}>🔒 Sıfır PII Sızıntısı</div>
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>
                %100 Anonim & Aggregate Güvence
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Firmalara bireysel kullanıcıların isim, telefon veya e-posta gibi kişisel verileri asla verilmez. Tüm veriler toplu istatistik ve anonim grafikler olarak sunulur.
              </p>
            </div>
          </div>

          {/* BOTTOM CTA */}
          <div className="glass-card-blue" style={{ padding: '54px 36px', textAlign: 'center', border: '1px solid var(--border-blue-highlight)' }}>
            <h2 style={{ fontSize: '34px', fontWeight: '900', color: 'white', marginBottom: '12px' }}>
              Markanız İçin Hemen Başvurun
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '640px', margin: '0 auto 36px auto', lineHeight: '1.6' }}>
              Kurumsal temsilcimiz başvuru talebinizi inceleyerek kurumsal e-posta adresiniz üzerinden sizinle iletişime geçecektir.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <Link href="/firma-basvuru" className="btn-lime" style={{ padding: '16px 36px', fontSize: '15px' }}>
                🚀 Kurumsal Başvuru Formunu Doldur
              </Link>
              <a href="https://app.pagapp.com.tr" target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ padding: '16px 36px', fontSize: '15px' }}>
                Kurumsal Portal Girişi →
              </a>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
