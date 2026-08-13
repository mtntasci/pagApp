'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function FirmalarPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, padding: '60px 0 80px 0' }}>
        <div className="container">
          {/* Header Hero */}
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 60px auto' }}>
            <div className="badge-lime">🏢 Kurumsal Anket & Hedefleme Platformu</div>
            <h1 style={{ fontSize: '42px', fontWeight: '900', marginTop: '16px', color: 'white', lineHeight: '1.2' }}>
              Markanız İçin Hassas Hedefleme, <br />
              <span className="text-gradient">Yüksek Yanıt Oranı Ve Gerçek Veri</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '16px', fontSize: '18px', lineHeight: '1.6' }}>
              PAG, markaların doğru kullanıcı grubuna doğrudan ulaşmasını sağlayan, kullanıcı motivasyonunu yüksek tutan mikro-profilleme platformudur.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
              <Link href="/firma-basvuru" className="btn-lime">
                🚀 PAG ile Çalışmak İstiyorum
              </Link>
              <a href="https://app.pagapp.com" target="_blank" rel="noopener noreferrer" className="btn-outline">
                🏢 Firma Girişi (Portal)
              </a>
            </div>
          </div>

          {/* SECTION 1: HEDEF KİTLE KRİTERLERİ */}
          <div style={{ marginBottom: '64px' }}>
            <div className="badge-lime" style={{ marginBottom: '12px' }}>01. Hedef Kitle Detayı</div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '24px' }}>
              Zengin Profil Kriterleri İle Tam İsabet
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {[
                { title: '🎂 Yaş & Demografi', desc: 'Belirli yaş aralıkları (Örn: 25–35 yaş grubu) veya özel yaş filtreleri.' },
                { title: '💍 Medeni Durum', desc: 'Bekar, evli veya hedeflenen medeni durum segmentleri.' },
                { title: '👶 Çocuk Durumu', desc: 'Çocuğu olan, olmayan veya belirli yaşta çocuğu olan ebeveyn grupları.' },
                { title: '🏠 İkamet & Memleket', desc: 'İkamet edilen şehir veya doğduğu/memleketi olduğu şehir kırılımları.' }
              ].map((item, idx) => (
                <div key={idx} className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--brand-lime)', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: LOKASYON HEDEFLEME */}
          <div style={{ marginBottom: '64px', backgroundColor: 'var(--bg-surface)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <div className="badge-lime" style={{ marginBottom: '12px' }}>02. Lokasyon Derinliği</div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
              İl, İlçe Ve Mahalle Seviyesinde Kitle Seçimi
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '700px', lineHeight: '1.6' }}>
              Anket kampanyanızı yalnızca belirli bir şehirde değil, hedeflenen İlçe veya spesifik Mahalle seviyesinde kurgulayabilirsiniz. Mağaza açılışları, bölgesel promosyonlar ve yerel saha araştırmaları için idealdir.
            </p>
          </div>

          {/* SECTION 3: KİTLE KURGUSU & MANTIĞI (AND / OR) */}
          <div style={{ marginBottom: '64px' }}>
            <div className="badge-lime" style={{ marginBottom: '12px' }}>03. Esnek Kitle Kurgusu</div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
              Gelişmiş Mantıksal Filtre Grubu (AND / OR)
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '24px' }}>
              Farklı kriter grupları arasında <strong>AND (VE)</strong>, aynı kriter alanı içerisinde <strong>OR (VEYA)</strong> mantığı uygulanır.
            </p>

            <div className="glass-card" style={{ padding: '32px', border: '1px solid var(--border-highlight)' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--brand-lime)', marginBottom: '12px', textTransform: 'uppercase' }}>
                Örnek Hedef Kitle Kurgusu:
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', fontSize: '15px', fontWeight: 600 }}>
                <span style={{ padding: '8px 16px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>25 – 35 Yaş</span>
                <span style={{ color: 'var(--brand-lime)', fontWeight: '900' }}>AND</span>
                <span style={{ padding: '8px 16px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>İstanbul (İkamet)</span>
                <span style={{ color: 'var(--brand-lime)', fontWeight: '900' }}>AND</span>
                <span style={{ padding: '8px 16px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>Evli</span>
              </div>
            </div>
          </div>

          {/* SECTION 4: RAPORLAMA VE PII KORUMASI */}
          <div style={{ marginBottom: '64px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            <div className="glass-card" style={{ padding: '32px' }}>
              <div className="badge-lime" style={{ marginBottom: '12px' }}>04. Raporlama & Analytics</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>
                Canlı Müşteri Paneli Verileri
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Anket yanıt sayıları, şık grafikler, cevap dağılımları ve katılım hız istatistikleri müşteri panelinizde anlık olarak sunulur.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '32px', border: '1px solid var(--brand-lime)' }}>
              <div className="badge-lime" style={{ marginBottom: '12px' }}>🔒 Gizlilik & PII Koruması</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>
                Sıfır Kişisel Veri Açığa Çıkması
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Firmalara bireysel kullanıcıların isim, telefon veya e-posta gibi PII (Personal Identifiable Information) bilgileri verilmez. Tüm veriler anonim ve aggregate (toplu istatistik) olarak sunulur.
              </p>
            </div>
          </div>

          {/* SECTION 5: ONAY SÜRECİ & STORY TALEBİ */}
          <div style={{ marginBottom: '64px', backgroundColor: 'var(--bg-surface)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
              Super Admin Onay Süreci Ve Story Öne Çıkarma
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.7', marginBottom: '16px' }}>
              PAG ekosisteminde kullanıcı deneyimi ve kalite esastır. Hiçbir firma anketi PAG Super Admin ekibi tarafından onaylanmadan (APPROVED) yayınlanmaz.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.7' }}>
              Firmalar anketleri için mobil uygulama içi <strong>Story Bar</strong> öne çıkarma talebinde bulunabilir. Yayın tarihi ve onay yönetimi PAG merkez yetkisindedir.
            </p>
          </div>

          {/* BOTTOM CTA */}
          <div className="glass-card" style={{ padding: '48px', textAlign: 'center', border: '1px solid var(--border-highlight)' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>
              Hemen Başvuruda Bulunun
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '600px', margin: '0 auto 32px auto' }}>
              Kurumsal temsilcimiz başvuru talebinizi inceleyerek kurumsal e-posta adresiniz üzerinden sizinle iletişime geçecektir.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <Link href="/firma-basvuru" className="btn-lime">
                Firma Başvuru Formunu Doldur →
              </Link>
              <a href="https://app.pagapp.com" target="_blank" rel="noopener noreferrer" className="btn-outline">
                Portal Girişi
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
