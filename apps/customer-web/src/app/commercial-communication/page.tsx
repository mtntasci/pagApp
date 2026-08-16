import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Ticari Elektronik İleti İzni | PAG',
  description: 'PAG Ticari Elektronik İleti Bilgilendirme ve Onay Metni. Push bildirim, SMS, e-posta ve telefon pazarlama izinleri.',
  alternates: {
    canonical: 'https://www.pagapp.com.tr/commercial-communication'
  },
  openGraph: {
    title: 'Ticari Elektronik İleti İzni | PAG',
    description: 'PAG Ticari Elektronik İleti Bilgilendirme ve Onay Metni. Push bildirim, SMS, e-posta ve telefon pazarlama izinleri.',
    url: 'https://www.pagapp.com.tr/commercial-communication',
    siteName: 'PAG',
    locale: 'tr_TR',
    type: 'website'
  }
};

export default function CommercialCommunicationPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, padding: '56px 0 88px 0' }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          {/* Header Section */}
          <div style={{ marginBottom: '36px' }}>
            <div className="badge-lime">İletişim İzinleri</div>
            <h1 style={{ fontSize: '36px', fontWeight: '900', marginTop: '14px', color: 'white', letterSpacing: '-0.5px' }}>
              Ticari Elektronik İleti Bilgilendirme ve Onay Metni
            </h1>
            <p style={{ color: 'var(--brand-lime)', fontSize: '15px', fontWeight: 600, marginTop: '6px' }}>
              6563 Sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun Uyarınca İletişim Tercihleri
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: 'var(--text-secondary)', marginTop: '12px', fontSize: '13px' }}>
              <span>📅 <strong>Son Güncelleme:</strong> 17 Ağustos 2026</span>
              <span>🏢 <strong>Hizmet Sağlayıcı:</strong> Alaf Teknoloji A.Ş.</span>
            </div>
          </div>

          {/* Core Principle Box */}
          <div className="glass-card" style={{ padding: '24px 28px', marginBottom: '32px', borderLeft: '4px solid var(--brand-lime)', backgroundColor: 'rgba(183, 243, 74, 0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--brand-lime)', marginBottom: '8px' }}>
              İsteğe Bağlı İzinler & Kolay İptal
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Ticari elektronik ileti onayları <strong>tamamen isteğe bağlıdır</strong>. Bu izinleri vermemeniz PAG platformunu kullanmanızı veya genel anketlere katılmanızı kesinlikle engellemez. Tüm pazarlama kanalı izinleri varsayılan olarak <strong>kapalı (onaysız)</strong> gelir ve dilediğiniz zaman uygulama ayarlarından değiştirilebilir.
            </p>
          </div>

          {/* Legal Text Container */}
          <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px', lineHeight: '1.75', color: 'var(--text-secondary)', fontSize: '15px' }}>
            
            {/* Section 1 */}
            <section id="onay-kapsami">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                1. Onayın Kapsamı ve İletişim Kanalları
              </h2>
              <p>
                6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun ve Ticari İletişim ve Ticari Elektronik İletiler Hakkında Yönetmelik uyarınca; Alaf Teknoloji A.Ş. tarafından işletilen PAG platformu kapsamında tarafınıza sunulan genel ve özel anket duyuruları, nakit ödül havuzlu anketler, hediye çeki kampanyaları, promosyonlar ve yeni platform özelliklerine ilişkin ticari elektronik iletilerin gönderilmesi için ayrı ayrı iletişim kanalı tercihleri sunulmaktadır:
              </p>
              <ul style={{ paddingLeft: '22px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>Push (Mobil Anlık Bildirim):</strong> Mobil cihazınıza yeni anketler, sıralama güncellemeleri ve ödül fırsatları hakkında gönderilen anlık bildirimler.</li>
                <li><strong>SMS (Kısa Mesaj):</strong> Kayıtlı cep telefonu numaranıza iletilen önemli kampanya ve anket davet mesajları.</li>
                <li><strong>E-Posta:</strong> Kayıtlı e-posta adresinize gönderilen bültenler, haftalık özetler ve pazar araştırması duyuruları.</li>
                <li><strong>Telefon Araması:</strong> Özel araştırma projeleri veya kullanıcı memnuniyet görüşmeleri amacıyla yapılan aramalar.</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section id="servis-bildirimleri-ayrimi">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                2. Servis / Güvenlik Bildirimleri ile Pazarlama Ayrımı
              </h2>
              <p>
                Hesap güvenliği, şifre sıfırlama, oturum doğrulama, bakiye çekim teyidi ve yasal zorunlu bildirimler (servis/işlemsel bildirimler) pazarlama amaçlı ticari elektronik ileti kapsamında <strong>değildir</strong>. Bu tür güvenlik ve operasyonel iletiler mevzuat gereği ticari izin şartına tabi olmaksızın iletilir.
              </p>
            </section>

            {/* Section 3 */}
            <section id="varsayilan-durum">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                3. Varsayılan Durum ve Ön-Seçim Yasağı
              </h2>
              <p>
                PAG’da tüm ticari iletişim izinleri varsayılan olarak <strong>kapalı (işaretsiz)</strong> tutulur. Kullanıcı kendi açık iradesiyle dilediği iletişim kanallarını seçmedikçe kendisine pazarlama içerikli ileti gönderilmez.
              </p>
            </section>

            {/* Section 4 */}
            <section id="ret-ve-iptal-hakki">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                4. İzni Geri Alma ve Reddetme Hakkı
              </h2>
              <p>
                Verdiğiniz ticari elektronik ileti iznini dilediğiniz zaman, hiçbir gerekçe göstermeksizin ve hiçbir ücret ödemeksizin geri alabilirsiniz:
              </p>
              <ul style={{ paddingLeft: '22px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>PAG mobil uygulamasında <strong>Profil &gt; Sözleşmeler ve İzinler</strong> ekranına giderek ilgili kanal anahtarını (toggle) kapatabilirsiniz.</li>
                <li>Gönderilen e-postalardaki <em>"Abonelikten Ayrıl"</em> bağlantısını kullanabilirsiniz.</li>
                <li><strong>info@alafteknoloji.com</strong> adresine talebinizi iletebilirsiniz.</li>
              </ul>
              <p style={{ marginTop: '8px' }}>
                Ret bildiriminiz bize ulaştıktan sonra en geç 3 (üç) iş günü içerisinde ilgili iletişim kanalından ticari ileti gönderimi durdurulur.
              </p>
            </section>

            {/* Section 5 */}
            <section id="iletisim-bilgileri">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                5. İletişim Bilgileri
              </h2>
              <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '10px', marginTop: '12px', fontSize: '13px', lineHeight: '1.6' }}>
                <p><strong>Alaf Teknoloji A.Ş.</strong></p>
                <p>Yakacık Çarşı Mah. Panorama Sok. No: 26, Kartal / İstanbul, 34876, Türkiye</p>
                <p>E-posta: <a href="mailto:info@alafteknoloji.com" style={{ color: 'var(--brand-lime)', fontFamily: 'monospace' }}>info@alafteknoloji.com</a></p>
              </div>
            </section>

          </div>

          {/* Navigation Links */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginTop: '36px', fontSize: '14px' }}>
            <Link href="/terms" className="btn-outline" style={{ padding: '10px 20px' }}>
              ⚖️ Kullanım Koşulları →
            </Link>
            <Link href="/user-privacy" className="btn-outline" style={{ padding: '10px 20px' }}>
              📜 KVKK Aydınlatma Metni →
            </Link>
            <Link href="/reward-terms" className="btn-outline" style={{ padding: '10px 20px' }}>
              🎁 Ödül Katılım Koşulları →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
