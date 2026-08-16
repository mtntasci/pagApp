import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Destek | PAG',
  description: 'PAG Yardım ve Destek Merkezi. Sıkça Sorulan Sorular, hesap yönetimi, Profil Puanı, ödüller ve teknik destek.',
  alternates: {
    canonical: 'https://www.pagapp.com.tr/support'
  },
  openGraph: {
    title: 'Destek | PAG',
    description: 'PAG Yardım ve Destek Merkezi. Sıkça Sorulan Sorular, hesap yönetimi, Profil Puanı, ödüller ve teknik destek.',
    url: 'https://www.pagapp.com.tr/support',
    siteName: 'PAG',
    locale: 'tr_TR',
    type: 'website'
  }
};

const supportCategories = [
  {
    icon: '👤',
    title: 'Hesap ve Giriş',
    description: 'Google ile Giriş, Apple ile Giriş, oturum yönetimi ve hesap güvenliği işlemleri.'
  },
  {
    icon: '📝',
    title: 'Profil Bilgileri',
    description: 'Temel profil doldurma, il/ilçe yerleşim güncellemesi ve profil soruları.'
  },
  {
    icon: '📊',
    title: 'Anketler',
    description: 'Anket bildirimleri, 3 soruluk anket akışı ve tamamlama kuralları.'
  },
  {
    icon: '⭐',
    title: 'Profil Puanı',
    description: 'Profil Puanı (Profile Score) kazanımı, puan seviyeleri ve bildirim önceliği.'
  },
  {
    icon: '💸',
    title: 'Ödüller',
    description: 'Nakit ödül havuzları, hediye çekleri (voucher) ve derece sıralama kuralları.'
  },
  {
    icon: '📱',
    title: 'Telefon Doğrulama',
    description: 'SMS doğrulama adımları, telefon numarası güncelleme ve +200 Profil Puanı kazanımı.'
  },
  {
    icon: '💳',
    title: 'IBAN / Ödeme',
    description: 'Nakit bakiye çekim şartları, IBAN / TCKN doğrulaması ve banka transfer süreçleri.'
  },
  {
    icon: '🔒',
    title: 'Gizlilik ve Kişisel Veriler',
    description: 'KVKK hakları, PII gizliliği, veri güvenliği standartları ve anonim raporlama.'
  },
  {
    icon: '🗑️',
    title: 'Hesap Silme',
    description: 'Uygulama içi Profil sekmesinden hesap ve kişisel verilerin kalıcı silinmesi.'
  },
  {
    icon: '⚙️',
    title: 'Teknik Sorunlar',
    description: 'Bildirim izinleri, internet bağlantısı, ekran yükleme ve uygulama güncellemesi.'
  }
];

const faqs = [
  {
    q: '1. Profil Puanı nedir?',
    a: 'Profil Puanı (Profile Score), PAG içerisindeki profilleme düzeyinizi ve katılım gücünüzü gösteren dinamik bir puandır. Profil bilgilerinizi tamamladıkça, telefonunuzu doğruladıkça ve anketleri yanıtladıkça artar. Profil Puanı kesinlikle para, elektronik para veya kripto varlık değildir.'
  },
  {
    q: '2. Profil Puanımı paraya çevirebilir miyim?',
    a: 'Hayır. Profil Puanı nakit paraya dönüştürülemez, satılamaz ve devredilemez. Profil Puanınız ne kadar yüksek olursa, gelecekteki anket ve ödüllü kampanya bildirimlerini diğer kullanıcılardan daha önce alma önceliği elde edersiniz.'
  },
  {
    q: '3. Nasıl para veya hediye çeki kazanabilirim?',
    a: 'Yalnızca ödül havuzu tanımlanmış anketleri ve kampanyaları süresi içerisinde ve geçerli kurallara uygun olarak tamamlayarak ödül kazanabilirsiniz. Ödül türü (nakit bakiye veya hediye çeki), ödül sıralaması ve kazanım şartları her anketin detay ekranında şeffaf bir şekilde gösterilir.'
  },
  {
    q: '4. Her anket ödüllü mü?',
    a: 'Hayır. Platformdaki anketlerin bir kısmı yalnızca Profil Puanı kazandırırken, bazı özel genel veya kurumsal sponsorlu anketler nakit veya hediye çeki ödülü sunar. Her anketin ödül durumu anket kartında açıkça belirtilir.'
  },
  {
    q: '5. Ankete katılmak için ödeme yapmam gerekiyor mu?',
    a: 'Hayır. PAG’a kayıt olmak, profil oluşturmak ve anketlere katılmak tamamen ücretsizdir. Kullanıcılardan hiçbir aşamada giriş ücreti, depozito veya katılım bedeli talep edilmez.'
  },
  {
    q: '6. PAG’ı kimler kullanabilir?',
    a: 'PAG, yalnızca 18 yaşını doldurmuş (18+) kullanıcılar içindir. Yaş uygunluğu kayıt esnasında beyan edilen doğum tarihi üzerinden kontrol edilir.'
  },
  {
    q: '7. Hesabımı nasıl silebilirim?',
    a: 'PAG mobil uygulamasında (iOS veya Android) "Profil" sekmesine giderek ekranın en altında yer alan "Hesabımı ve Verilerimi Sil" butonuna basabilir veya kayıtlı e-postanızdan info@alafteknoloji.com adresine hesap silme talebinizi iletebilirsiniz. İşlem sonucunda kişisel verileriniz sistemlerimizden kalıcı olarak silinir.'
  },
  {
    q: '8. Verilerim hakkında nasıl başvuruda bulunabilirim?',
    a: '6698 sayılı KVKK kapsamındaki bilgi alma, düzeltme veya silme haklarınız için /user-privacy sayfamızdaki Aydınlatma Metnini inceleyebilir ve Veri Sorumlusu Alaf Teknoloji A.Ş.’ye info@alafteknoloji.com adresi üzerinden yazılı başvuruda bulunabilirsiniz.'
  }
];

export default function SupportPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, padding: '56px 0 88px 0' }}>
        <div className="container" style={{ maxWidth: '1100px' }}>
          {/* Header / Hero */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div className="badge-lime">Yardım & Destek Merkezi</div>
            <h1 style={{ fontSize: '40px', fontWeight: '900', marginTop: '16px', color: 'white', letterSpacing: '-0.5px' }}>
              PAG Destek
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '10px', fontSize: '17px', maxWidth: '600px', margin: '10px auto 0 auto' }}>
              PAG kullanırken yardıma mı ihtiyacınız var? Sıkça sorulan soruları inceleyebilir veya destek ekibimizle iletişime geçebilirsiniz.
            </p>
          </div>

          {/* Quick Legal Notice Navigation */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'center',
            marginBottom: '48px'
          }}>
            <Link href="/privacy" className="btn-outline" style={{ padding: '8px 18px', fontSize: '13px' }}>
              🔒 Gizlilik Politikası
            </Link>
            <Link href="/user-privacy" className="btn-outline" style={{ padding: '8px 18px', fontSize: '13px' }}>
              📜 KVKK Aydınlatma Metni
            </Link>
            <Link href="/age-suitability" className="btn-outline" style={{ padding: '8px 18px', fontSize: '13px' }}>
              🔞 Yaş Uygunluğu (18+)
            </Link>
          </div>

          {/* 10 Support Categories Grid */}
          <div style={{ marginBottom: '64px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'white', marginBottom: '24px', textAlign: 'center' }}>
              Destek Konuları
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {supportCategories.map((cat, idx) => (
                <div key={idx} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '4px' }}>{cat.icon}</div>
                  <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'white' }}>{cat.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{cat.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div style={{ marginBottom: '64px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div className="badge-blue">Merak Edilenler</div>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'white', marginTop: '12px' }}>
                Sıkça Sorulan Sorular (SSS)
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '880px', margin: '0 auto' }}>
              {faqs.map((faq, idx) => (
                <div key={idx} className="glass-card" style={{ padding: '24px 28px', borderLeft: '3px solid var(--brand-lime)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'white', marginBottom: '10px' }}>
                    {faq.q}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.65' }}>
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact / Helpdesk Card */}
          <div className="glass-card" style={{
            padding: '36px',
            maxWidth: '880px',
            margin: '0 auto',
            border: '1px solid var(--border-highlight)',
            backgroundColor: 'rgba(10, 30, 77, 0.55)',
            boxShadow: '0 0 30px rgba(183, 243, 74, 0.08)'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: '1 1 340px' }}>
                <div className="badge-lime" style={{ marginBottom: '12px' }}>Doğrudan İletişim</div>
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>
                  Sorunuzun yanıtını bulamadınız mı?
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Hesabınız, ödülleriniz veya anket deneyiminiz ile ilgili her türlü geri bildirim ve yardım taleplerinizi e-posta ile iletebilirsiniz.
                </p>
                <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  <p><strong>Alaf Teknoloji A.Ş.</strong></p>
                  <p>Yakacık Çarşı Mah. Panorama Sok. No: 26, Kartal / İstanbul, 34876, Türkiye</p>
                  {/* TODO: İleride tahsis edilecek kurumsal telefon hattı veya özel destek e-postası (örn. destek@ / support@) buraya eklenecektir */}
                </div>
              </div>

              <div style={{
                flex: '0 0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '24px',
                backgroundColor: 'var(--bg-surface-secondary)',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                  Resmi Destek E-Postası
                </span>
                <a
                  href="mailto:info@alafteknoloji.com"
                  style={{
                    fontSize: '18px',
                    fontWeight: '800',
                    color: 'var(--brand-lime)',
                    fontFamily: 'monospace',
                    textDecoration: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(183, 243, 74, 0.1)'
                  }}
                >
                  info@alafteknoloji.com
                </a>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  En kısa sürede dönüş sağlanır.
                </span>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
