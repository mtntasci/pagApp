'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function KvkkPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, padding: '60px 0 80px 0' }}>
        <div className="container" style={{ maxWidth: '840px' }}>
          <div style={{ marginBottom: '40px' }}>
            <div className="badge-lime">Yasal Bilgilendirme</div>
            <h1 style={{ fontSize: '36px', fontWeight: '900', marginTop: '12px', color: 'white' }}>
              6698 Sayılı KVKK Aydınlatma Metni
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '14px' }}>
              Son Güncelleme Tarihi: 13 Ağustos 2026
            </p>
          </div>

          <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: '1.7', color: 'var(--text-secondary)', fontSize: '15px' }}>
            <section>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>1. Veri Sorumlusu</h2>
              <p>
                6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, PAG mobil uygulaması ve ilişkili web hizmetleri kapsamında kişisel verileriniz; veri sorumlusu olarak <strong>Alaf Teknoloji A.Ş.</strong> (“Şirket”) tarafından aşağıda açıklanan kapsamda işlenmektedir.
              </p>
              <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '8px', marginTop: '12px', fontSize: '13px' }}>
                <strong>Şirket Unvanı:</strong> Alaf Teknoloji A.Ş. <br />
                <strong>Adres:</strong> Yakacık Çarşı Mah. Panorama Sok. No: 26, Kartal / İstanbul, 34876, Türkiye <br />
                <strong>E-posta:</strong> info@alafteknoloji.com <br />
                <strong>Web Sitesi:</strong> alafteknoloji.com
              </div>
            </section>

            <section>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>2. İşlenen Kişisel Veri Kategorileri</h2>
              <p>
                PAG hizmetlerinin sunulabilmesi amacıyla aşağıdaki veri kategorileri işlenmektedir:
              </p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li><strong>Kimlik ve İletişim Bilgileri:</strong> Ad, soyad, e-posta adresi, telefon numarası, doğum tarihi.</li>
                <li><strong>Temel Profil Bilgileri:</strong> Medeni durum, çocuk bilgisi, ikamet edilen şehir/ilçe/mahalle, memleket/doğum yeri.</li>
                <li><strong>Anket Yanıt Verileri:</strong> Uygulama içi katıldığınız anketlere verilen yanıtlar ve eğilim verileri.</li>
                <li><strong>Profil Puanı ve Derece Verileri:</strong> Etkinlik geçmişi, kazanılan Profil Puanı (Profile Score) logları ve sıralama geçmişi.</li>
                <li><strong>Ödül ve Bakiye Bilgileri:</strong> Biriken hak edilen parasal bakiyeler, tanımlanan hediye çekleri (voucher) ve çekim talepleri.</li>
                <li><strong>Cihaz ve Bildirim Bilgileri:</strong> FCM cihaz jetonu (token), cihaz işletim sistemi türü, bildirim izin durumları.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>3. Kişisel Verilerin İşlenme Amaçları</h2>
              <p>
                Kişisel verileriniz şu amaçlarla işlenmektedir:
              </p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Kullanıcı hesabının oluşturulması ve kimlik doğrulaması yapılması,</li>
                <li>Profil Puanı (Profile Score) hesaplaması ve kullanıcı sıralamalarının belirlenmesi,</li>
                <li>Size uygun anketlerin tespit edilmesi ve push bildirim sırasının kurgulanması,</li>
                <li>Hak edilen ödül, bakiye ve hediye çeklerinin hesaba tanımlanması,</li>
                <li>Müşteri/Firma anketlerinde kişisel verileriniz açığa çıkarılmaksızın toplu (aggregate) ve anonim istatistik raporlarının oluşturulması.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>4. Firmalar İle Veri Paylaşımı Ve Anonimlik</h2>
              <p>
                PAG, anket düzenleyen kurum ve firmalara kullanıcıların doğrudan ad, soyad, telefon veya e-posta gibi kişisel tanımlayıcı verilerini (PII) <strong>kesinlikle aktarmaz</strong>. Anlaşmalı firmalara yalnızca anonim ve toplu istatistiksel raporlar sunulur.
              </p>
            </section>

            <section>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>5. KVKK Kapsamındaki Haklarınız</h2>
              <p>
                KVKK’nın 11. maddesi uyarınca veri sahipleri; kişisel verilerinin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, silinmesini veya düzeltilmesini isteme haklarına sahiptir. Taleplerinizi <strong>info@alafteknoloji.com</strong> e-posta adresi üzerinden iletebilirsiniz.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
