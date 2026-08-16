import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Yaş Uygunluğu | PAG',
  description: 'PAG 18+ Yaş Uygunluğu ve Hizmet Katılım Politikası. Kullanıcı yaş sınırı, ödül koşulları ve ebeveyn bilgilendirmesi.',
  alternates: {
    canonical: 'https://www.pagapp.com.tr/age-suitability'
  },
  openGraph: {
    title: 'Yaş Uygunluğu | PAG',
    description: 'PAG 18+ Yaş Uygunluğu ve Hizmet Katılım Politikası. Kullanıcı yaş sınırı, ödül koşulları ve ebeveyn bilgilendirmesi.',
    url: 'https://www.pagapp.com.tr/age-suitability',
    siteName: 'PAG',
    locale: 'tr_TR',
    type: 'website'
  }
};

export default function AgeSuitabilityPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, padding: '56px 0 88px 0' }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          {/* Top Badge & Header */}
          <div style={{ marginBottom: '36px' }}>
            <div className="badge-lime">App Store & Platform Standartları</div>
            <h1 style={{ fontSize: '38px', fontWeight: '900', marginTop: '14px', color: 'white', letterSpacing: '-0.5px' }}>
              Yaş Uygunluğu ve Katılım Politikası
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: 'var(--text-secondary)', marginTop: '10px', fontSize: '13px' }}>
              <span>📅 <strong>Son Güncelleme:</strong> 16 Ağustos 2026</span>
              <span>🔞 <strong>Yaş Kriteri:</strong> 18 Yaş ve Üzeri (18+)</span>
              <span>🏢 <strong>İşletici:</strong> Alaf Teknoloji A.Ş.</span>
            </div>
          </div>

          {/* Primary Age Requirement Highlight Box */}
          <div className="glass-card" style={{
            padding: '28px 32px',
            marginBottom: '36px',
            border: '2px solid var(--brand-lime)',
            backgroundColor: 'rgba(183, 243, 74, 0.08)',
            boxShadow: '0 0 30px rgba(183, 243, 74, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
              <div style={{
                fontSize: '28px',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-lime)',
                color: '#010C26',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900'
              }}>
                18+
              </div>
              <h2 style={{ color: 'white', fontSize: '22px', fontWeight: '900', margin: 0 }}>
                PAG yalnızca 18 yaşını doldurmuş kullanıcılar içindir.
              </h2>
            </div>
            <p style={{ fontSize: '15px', color: '#E2E8F0', lineHeight: '1.65', marginTop: '8px' }}>
              PAG mobil uygulamasını (iOS / Android) indirmek, hesap oluşturmak ve platformdaki anketlere veya ödüllü aktivitelere katılmak için kullanıcıların en az 18 yaşında olmaları şarttır. 18 yaşın altındaki kişilerin platforma üye olması PAG Hizmet Politikası kapsamında kabul edilmemektedir.
            </p>
          </div>

          {/* Detailed Policy Document */}
          <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px', lineHeight: '1.75', color: 'var(--text-secondary)', fontSize: '15px' }}>
            
            {/* Section 1 */}
            <section id="hizmet-politikasi">
              <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>
                1. 18+ Yaş Uygunluğu İlkesi
              </h2>
              <p>
                PAG platformunda yer alan içerikler; tüketici araştırmaları, marka tercih anketleri, profilleme soruları, nakit ödül havuzları ve hediye çeki (voucher) kazanım imkanları içermektedir. Finansal ödül tahsislerinin güvenliği, yasal muhataplık ehliyeti ve kurumsal araştırma standartlarının gereği olarak <strong>18 yaş sınırı PAG’ın temel hizmet politikası</strong> olarak belirlenmiştir.
              </p>
              <p style={{ marginTop: '10px' }}>
                Kullanıcının yaş uygunluğu, kayıt esnasında veya temel profil doldurma adımında beyan edilen <strong>Doğum Tarihi</strong> bilgisi üzerinden kontrol edilir.
              </p>
            </section>

            {/* Section 2 */}
            <section id="ucretsiz-katilim">
              <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>
                2. Ücretsiz Katılım ve Kumar / Bahis Olmadığına Dair Açıklama
              </h2>
              <ul style={{ paddingLeft: '22px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li>
                  <strong>Herhangi Bir Satın Alma Zorunluluğu Yoktur:</strong> PAG platformundaki anketlere katılmak için hiçbir ürün veya hizmet satın alınması gerekmez.
                </li>
                <li>
                  <strong>Katılım / Giriş Ücreti Yoktur:</strong> Kullanıcılardan anketlere girmek veya hesap açmak için kesinlikle hiçbir ücret, depozito veya bakiye yüklemesi talep edilmez.
                </li>
                <li>
                  <strong>Kumar veya Bahis Hizmeti Değildir:</strong> PAG bir şans oyunu, bahis, loto veya kumar uygulaması <em>kesinlikle değildir</em>. Platformda şansa dayalı para yatırma veya para kaybetme mekanizması bulunmaz.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="profil-puani-ve-oduller">
              <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>
                3. Profil Puanı ve Ödül Mekanizması
              </h2>
              <p>
                Platformun işleyişi ile ilgili kullanıcılarımızın ve uygulama mağazası denetçilerinin bilmesi gereken temel kurallar:
              </p>
              <ul style={{ paddingLeft: '22px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>
                  <strong>Profil Puanı Nakit Değildir:</strong> Kullanıcıların anket tamamlayarak veya profil doldurarak kazandıkları Profil Puanı (Profile Score); nakit paraya çevrilemez, satılamaz ve devredilemez. Yalnızca platform içi profilleme gücünü temsil eder ve anket bildirimlerinde öncelik sağlar.
                </li>
                <li>
                  <strong>Ödül Garantisi Bulunmaz:</strong> Sadece uygulamayı indirmek veya hesap açmak doğrudan para ödülü kazanılmasını garanti etmez. Ödül olanakları yalnızca ilgili ankette/kampanyada açıkça belirtilen kurallar, süre ve derece/sıralama şartları dahilinde geçerlidir.
                </li>
                <li>
                  <strong>Anket Bazlı Kurallar:</strong> Her anketin ödül türü (Profil Puanı, Nakit Para veya Hediye Çeki), havuz büyüklüğü ve tamamlama şartları ilgili anket kartında şeffafça ilan edilir.
                </li>
                <li>
                  <strong>Kimlik ve Ödeme Doğrulaması:</strong> Hak edilen nakit ödüllerin kullanıcıya transfer edilebilmesi için mevzuat gereği ad-soyad ile uyuşan geçerli bir IBAN ve T.C. Kimlik Numarası (TCKN) doğrulaması istenebilir.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="sponsorlu-icerikler">
              <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>
                4. Sponsorlu ve Tanıtım Amaçlı İçerikler
              </h2>
              <p>
                PAG, PAG’ın kendi genel kamuoyu araştırmalarının yanı sıra kurumsal iş ortaklarına ait marka tanıtımları, ürün memnuniyet testleri ve pazar araştırması anketleri barındırabilir. Bu araştırmalar yetişkin tüketicilerin satın alma ve marka tercih eğilimlerini ölçmeyi hedefler.
              </p>
            </section>

            {/* Section 5 */}
            <section id="ebeveyn-bilgilendirmesi">
              <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>
                5. Ebeveyn ve Yasal Vasilere Yönelik Bilgilendirme
              </h2>
              <div style={{ padding: '16px 20px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'white', fontWeight: 'bold', marginBottom: '6px' }}>👨‍👩‍👧 Ebeveyn Sorumluluğu ve Bildirim:</p>
                <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  PAG hizmetleri çocuklara veya 18 yaş altındaki bireylere yönelik tasarlanmamıştır. Bir ebeveyn veya yasal vasi, gözetimi altındaki 18 yaşından küçük bir bireyin platformda hesap açtığını tespit ederse, derhal <a href="mailto:info@alafteknoloji.com" style={{ color: 'var(--brand-lime)', fontWeight: 600 }}>info@alafteknoloji.com</a> adresi üzerinden bizimle iletişime geçmelidir. İnceleme neticesinde 18 yaşından küçük olduğu anlaşılan hesaplar derhal kapatılır ve toplanan veriler sistemden silinir.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="iletisim-destek">
              <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>
                6. Sorular ve İletişim
              </h2>
              <p>
                Yaş uygunluğu politikamız veya hesap onay süreçleriyle ilgili sorularınız için Alaf Teknoloji A.Ş. destek ekibine ulaşabilirsiniz:
              </p>
              <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '10px', marginTop: '12px', fontSize: '14px' }}>
                <p><strong>Alaf Teknoloji A.Ş.</strong></p>
                <p>Yakacık Çarşı Mah. Panorama Sok. No: 26, Kartal / İstanbul, 34876, Türkiye</p>
                <p style={{ marginTop: '4px' }}>
                  E-posta: <a href="mailto:info@alafteknoloji.com" style={{ color: 'var(--brand-lime)', fontFamily: 'monospace' }}>info@alafteknoloji.com</a>
                </p>
              </div>
            </section>

          </div>

          {/* Quick Navigation Footer */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginTop: '36px', fontSize: '14px' }}>
            <Link href="/privacy" className="btn-outline" style={{ padding: '10px 20px' }}>
              🔒 Gizlilik Politikası →
            </Link>
            <Link href="/user-privacy" className="btn-outline" style={{ padding: '10px 20px' }}>
              📜 KVKK Aydınlatma Metni →
            </Link>
            <Link href="/support" className="btn-outline" style={{ padding: '10px 20px' }}>
              💬 PAG Destek →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
