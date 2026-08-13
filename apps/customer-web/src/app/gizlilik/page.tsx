'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function GizlilikPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, padding: '60px 0 80px 0' }}>
        <div className="container" style={{ maxWidth: '840px' }}>
          <div style={{ marginBottom: '40px' }}>
            <div className="badge-lime">Gizlilik & Güvenlik</div>
            <h1 style={{ fontSize: '36px', fontWeight: '900', marginTop: '12px', color: 'white' }}>
              Gizlilik Politikası
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '14px' }}>
              Son Güncelleme Tarihi: 13 Ağustos 2026
            </p>
          </div>

          <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: '1.7', color: 'var(--text-secondary)', fontSize: '15px' }}>
            <section>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>1. Gizlilik İlkelerimiz</h2>
              <p>
                Alaf Teknoloji A.Ş. (“PAG”) olarak kullanıcılarımızın gizliliğine ve veri güvenliğine yüksek önem veriyoruz. Bu Gizlilik Politikası, mobil uygulamamız ve web platformumuz üzerinden toplanan verilerin işlenme esaslarını açıklar.
              </p>
            </section>

            <section>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>2. Veri Toplama Ve İşleme Esasları</h2>
              <p>
                Toplanan veriler yalnızca hizmetin sunulması, platform deneyiminin iyileştirilmesi ve anket uygunluklarının belirlenmesi amacıyla işlenir:
              </p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li><strong>Hesap ve Profil Verileri:</strong> Kayıt aşamasında sağlanan iletişim ve temel profil yanıtları güvenli veritabanlarında saklanır.</li>
                <li><strong>Anket Yanıtları:</strong> Katıldığınız anketlerde verdiğiniz yanıtlar doğrudan veritabanımıza kaydedilir. Profil anketleri güncellenebilirken, firma anket yanıtları değiştirilemez yapıdadır.</li>
                <li><strong>Profil Puanı Logları:</strong> Kazanılan puanlar izlenebilir defter (ledger) yapısında saklanır. Duplicate puan tanımlaması engellenir.</li>
                <li><strong>Cihaz ve Bildirim Tokenları:</strong> Anket bildirimlerinin gönderilmesi amacıyla cihaz bildirim jetonları (FCM token) işlenir.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>3. PII Ve Anonim İstatistik Ayrımı</h2>
              <p>
                PAG, anket düzenleyen ticari müşterilere kişisel olarak sizi tanımlayabilecek verileri (Ad, Soyad, Telefon, E-posta) aktarmaz. Müşteri panellerinde yalnızca anonimleştirilmiş ve toplu grafik/istatistik sonuçları sunulur.
              </p>
            </section>

            <section>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>4. Veri Güvenliği VE Otorite</h2>
              <p>
                Kullanıcı verileri Firebase güvenli altyapısı ve yetkili backend servisleri (Cloud Functions) üzerinden işlenir. İstemci (mobil/web) tarafında authoritative veri manipülasyonuna izin verilmez.
              </p>
            </section>

            <section>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>5. İletişim</h2>
              <p>
                Gizlilik politikamız ile ilgili sorularınız için <strong>info@alafteknoloji.com</strong> e-posta adresi üzerinden Alaf Teknoloji A.Ş. ile iletişime geçebilirsiniz.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
