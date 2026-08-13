'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function KullanimKosullariPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, padding: '60px 0 80px 0' }}>
        <div className="container" style={{ maxWidth: '840px' }}>
          <div style={{ marginBottom: '40px' }}>
            <div className="badge-lime">Kullanım Kuralları</div>
            <h1 style={{ fontSize: '36px', fontWeight: '900', marginTop: '12px', color: 'white' }}>
              Kullanım Koşulları
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '14px' }}>
              Son Güncelleme Tarihi: 13 Ağustos 2026
            </p>
          </div>

          <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: '1.7', color: 'var(--text-secondary)', fontSize: '15px' }}>
            <section>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>1. Taraflar Ve Amaç</h2>
              <p>
                Bu Kullanım Koşulları, PAG mobil uygulaması ve web platformunun (Alaf Teknoloji A.Ş.) kullanımı ile ilgili kuralları belirler. Platforma üye olan her kullanıcı bu koşulları kabul etmiş sayılır.
              </p>
            </section>

            <section>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>2. Profil Puanı (Profile Score) Kuralları</h2>
              <p>
                Profil Puanı para değildir; satılamaz, devredilemez ve nakde çevrilemez. Kullanıcının platform içi etkinliğini ve profilleme düzeyini gösteren dinamik bir sıralama puandır.
              </p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Yüksek Profil Puanı sonraki kampanyalarda bildirimlerin daha önce alınması avantajını sağlar.</li>
                <li>Profil Puanı hileli işlem veya sahte profil durumunda sıfırlanabilir.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>3. Anket Katılımı Ve Ödüller</h2>
              <p>
                Anketler maksimum 3 sorudan oluşur. Anket tamamlama süresi ve sırası backend sunucuları tarafından yetkili zaman damgası ile belirlenir.
              </p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li><strong>Ödül Garantisi Yoktur:</strong> Her ankette parasal ödül bulunacağı garanti edilmez. Ödül türü ve miktarı anket bazlı tanımlanır.</li>
                <li><strong>Derece Ödülleri:</strong> Derece bazlı parasal ödüllerde yetkili tamamlama sırası esastır.</li>
                <li><strong>Hediye Çekleri:</strong> Tanımlanan hediye kodları tek kullanımlık olup ilgili markanın kullanım koşullarına tabidir.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>4. Hesap Ve Kullanım Güvenliği</h2>
              <p>
                Kullanıcılar tek bir PAG hesabına sahip olabilir. Otomasyon, bot veya sahte konum/cihaz kullanımı tespit edilen hesaplar engellenir. Parasal bakiye çekimlerinde KYC doğrulaması istenebilir.
              </p>
            </section>

            <section>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>5. İletişim Ve Yetkili Şirket</h2>
              <p>
                Platform sahibi <strong>Alaf Teknoloji A.Ş.</strong> olup, tüm yasal bildirimler için <strong>info@alafteknoloji.com</strong> adresi yetkilidir.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
