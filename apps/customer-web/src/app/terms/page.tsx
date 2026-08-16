import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları ve Üyelik Sözleşmesi | PAG',
  description: 'PAG Kullanım Koşulları ve Üyelik Sözleşmesi. 18+ yaş kuralı, Profil Puanı kuralları, anket ve ödül katılım şartları.',
  alternates: {
    canonical: 'https://www.pagapp.com.tr/terms'
  },
  openGraph: {
    title: 'Kullanım Koşulları ve Üyelik Sözleşmesi | PAG',
    description: 'PAG Kullanım Koşulları ve Üyelik Sözleşmesi. 18+ yaş kuralı, Profil Puanı kuralları, anket ve ödül katılım şartları.',
    url: 'https://www.pagapp.com.tr/terms',
    siteName: 'PAG',
    locale: 'tr_TR',
    type: 'website'
  }
};

export default function TermsOfServicePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, padding: '56px 0 88px 0' }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          {/* Header Section */}
          <div style={{ marginBottom: '36px' }}>
            <div className="badge-lime">Yasal Sözleşme</div>
            <h1 style={{ fontSize: '36px', fontWeight: '900', marginTop: '14px', color: 'white', letterSpacing: '-0.5px' }}>
              Kullanım Koşulları ve Üyelik Sözleşmesi
            </h1>
            <p style={{ color: 'var(--brand-lime)', fontSize: '15px', fontWeight: 600, marginTop: '6px' }}>
              PAG Platformu Kullanım ve Üyelik Şartları
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: 'var(--text-secondary)', marginTop: '12px', fontSize: '13px' }}>
              <span>📅 <strong>Son Güncelleme:</strong> 17 Ağustos 2026</span>
              <span>🏢 <strong>Platform İşleticisi:</strong> Alaf Teknoloji A.Ş.</span>
              <span>🔞 <strong>Yaş Şartı:</strong> 18 Yaş ve Üzeri</span>
            </div>
          </div>

          {/* Important Summary Highlight Box */}
          <div className="glass-card" style={{ padding: '24px 28px', marginBottom: '32px', borderLeft: '4px solid var(--brand-lime)', backgroundColor: 'rgba(183, 243, 74, 0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--brand-lime)', marginBottom: '8px' }}>
              Özet ve Temel İlkeler
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              PAG, Alaf Teknoloji A.Ş. tarafından işletilen mobil anket ve pazar araştırması platformudur. PAG’a katılım yalnızca <strong>18 yaşını doldurmuş bireylere</strong> açıktır. Platformdaki anketlere katılmak için herhangi bir ödeme veya satın alma zorunluluğu yoktur. Kazanılan <strong>Profil Puanı (Profile Score) para, elektronik para veya kripto para değildir</strong>; doğrudan nakde çevrilemez, satılamaz veya devredilemez.
            </p>
          </div>

          {/* Legal Content Container */}
          <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px', lineHeight: '1.75', color: 'var(--text-secondary)', fontSize: '15px' }}>
            
            {/* Section 1 */}
            <section id="taraflar-ve-tanimlar">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                1. Taraflar ve Tanımlar
              </h2>
              <p>
                İşbu Kullanım Koşulları ve Üyelik Sözleşmesi (“Sözleşme”), Yakacık Çarşı Mah. Panorama Sok. No: 26, Kartal / İstanbul adresinde mukim <strong>Alaf Teknoloji A.Ş.</strong> (“Şirket” veya “PAG”) ile PAG mobil uygulamalarını (iOS / Android) veya web hizmetlerini kullanan gerçek kişi (“Kullanıcı” veya “Üye”) arasında akdedilmiştir.
              </p>
              <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '10px', marginTop: '12px', fontSize: '13px', lineHeight: '1.6' }}>
                <p><strong>Şirket Unvanı:</strong> Alaf Teknoloji A.Ş.</p>
                <p><strong>Adres:</strong> Yakacık Çarşı Mah. Panorama Sok. No: 26, Kartal / İstanbul, 34876, Türkiye</p>
                <p><strong>E-posta:</strong> info@alafteknoloji.com</p>
                <p><strong>Resmi İnternet Sitesi:</strong> https://www.pagapp.com.tr</p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="yas-siniri">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                2. 18 Yaş Sınırı ve Üyelik Şartları
              </h2>
              <p>
                PAG, münhasıran <strong>18 yaşını tamamlamış (reşit) gerçek kişiler</strong> için tasarlanmış bir hizmettir.
              </p>
              <ul style={{ paddingLeft: '22px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Platforma üye olan her Kullanıcı, en az 18 yaşında olduğunu gayrikabili rücu kabul, beyan ve taahhüt eder.</li>
                <li>Kullanıcının 18 yaşın altında olduğunun tespit edilmesi halinde (örn. profil doğum tarihi veya kimlik doğrulaması neticesinde) kullanıcının hesabı derhal askıya alınır veya kapatılır; varsa hak edilmemiş bakiyeler iptal edilir.</li>
                <li>Her Kullanıcı yalnızca tek bir PAG hesabı açabilir. Çoklu hesap açılması, sahte kimlik veya başkasına ait hesap kullanımı kesinlikle yasaktır.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="ucretsiz-katilim-ve-hizmet-kapsami">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                3. Ücretsiz Katılım ve Hizmetin Niteliği
              </h2>
              <p>
                PAG platformundaki kamuoyu ve pazar araştırması anketlerine katılım tamamen <strong>ücretsizdir</strong>:
              </p>
              <ul style={{ paddingLeft: '22px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Anketlere katılmak, hesap oluşturmak veya platform özelliklerini kullanmak için hiçbir ödeme, aidat, depozito veya ürün satın alma şartı bulunmaz.</li>
                <li>PAG bir şans oyunu, bahis veya kumar platformu değildir. Kullanıcıların maddi kayıp yaşama riski içeren hiçbir oyunu veya bahsi barındırmaz.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="profil-puani-kurallari">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                4. Profil Puanı (Profile Score) Kuralları
              </h2>
              <p>
                Profil Puanı, kullanıcının platform içi profilleme eksiksizliğini, doğrulama durumunu ve araştırma güvenilirliğini gösteren dinamik bir puanlama metriğidir:
              </p>
              <ul style={{ paddingLeft: '22px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>Mali Varlık Değildir:</strong> Profil Puanı bir para birimi, elektronik para, kripto varlık veya finansal menkul kıymet değildir.</li>
                <li><strong>Doğrudan Nakde Çevrilemez:</strong> Profil Puanı doğrudan nakit paraya dönüştürülemez, üçüncü şahıslara satılamaz, kiralanamaz veya devredilemez.</li>
                <li><strong>Öncelik ve Sıralama Fonksiyonu:</strong> Yüksek Profil Puanı, sonraki anket ve araştırma kampanyalarında bildirimlerin daha öncelikli gruplarda alınması ve hedef kitle eşleşmelerinde avantaj elde edilmesini sağlar.</li>
                <li><strong>Defter (Ledger) Modeli:</strong> Tüm Profil Puanı kazanımları sunucu tarafında doğrulanabilir ve denetlenebilir bir işlem defterinde (ledger) saklanır. Hileli işlem tespitinde geriye dönük silinebilir.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="anketler-ve-oduller">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                5. Anket Katılımı, Yanıtlar ve Ödüller
              </h2>
              <p>
                PAG üzerindeki anketler PAG genel araştırmaları ve kurumsal müşteri araştırmaları olmak üzere iki ana kategoride yürütülür:
              </p>
              <ul style={{ paddingLeft: '22px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>Anket Yapısı:</strong> Anketler kural olarak en fazla 3 tekil seçimli sorudan oluşur. Kısmen tamamlanıp çıkılan anketlerde yanıtlar saklanmaz; yeniden başlandığında baştan alınır.</li>
                <li><strong>Yanıtların Değişmezliği:</strong> Genel ve kurumsal anketlere verilen yanıtlar sunucuya kaydedildikten sonra manipülasyonu önlemek amacıyla değiştirilemez. Profil anketlerindeki yanıtlar ise profil sayfasından güncellenebilir.</li>
                <li><strong>Ödül Koşulları:</strong> Her anket nakit veya hediye çeki ödülü içermek zorunda değildir. Ödüllü anketlerde ödül miktarı, havuz büyüklüğü ve derece şartları ilgili anket detayında belirtilir.</li>
                <li><strong>Sunucu Otoritesi:</strong> Ödül hak edişinde anketin sunucuya ulaşma anındaki resmi zaman damgası ve sunucu sıralama algoritması esastır. Cihaz saati manipülasyonları geçersizdir.</li>
                <li><strong>Çekim ve Doğrulama:</strong> Kazanılan nakit bakiyelerin çekilebilmesi için asgari çekim tutarına ulaşılması ve mevzuat gereği T.C. Kimlik Numarası (TCKN) ile Kullanıcı adına açılmış geçerli bir banka IBAN bilgisi doğrulanması zorunludur.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="kullanici-yukumlulukleri-ve-yasaklar">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                6. Kullanıcı Yükümlülükleri ve Yasaklı Faaliyetler
              </h2>
              <p>
                Kullanıcı aşağıdaki fiilleri gerçekleştirmeyeceğini peşinen taahhüt eder:
              </p>
              <ul style={{ paddingLeft: '22px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Otomatik yazılım, bot, emülatör, makro veya benzeri yöntemlerle anket yanıtlamak veya puan kasmak,</li>
                <li>Sahte kimlik, başkasına ait TCKN/IBAN veya sahte iletişim bilgileriyle hesap açmak,</li>
                <li>GPS / konum bilgilerini sahte konum (mock location) yazılımlarıyla manipüle etmek,</li>
                <li>PAG mobil uygulamalarının veya sunucu altyapısının kaynak kodunu tersine mühendislik (reverse engineering) ile çözmeye çalışmak, ağ trafiğini değiştirmek,</li>
                <li>Hak edilmemiş ödül veya hediye kodu elde etmeye yönelik her türlü hileli girişimde bulunmak.</li>
              </ul>
              <p style={{ marginTop: '8px' }}>
                Bu maddelerin ihlali halinde Alaf Teknoloji A.Ş., Kullanıcı hesabını derhal askıya alma, feshetme, kazanımları iptal etme ve yasal mercilere başvurma hakkını saklı tutar.
              </p>
            </section>

            {/* Section 7 */}
            <section id="sirket-sorumlulugu">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                7. Şirketin Hak ve Sorumlulukları
              </h2>
              <p>
                Alaf Teknoloji A.Ş.; platformun kesintisiz, hatasız ve güvenli çalışması için makul tüm teknik önlemleri alır. Ancak internet altyapısından, telekomünikasyon sağlayıcılarından veya mücbir sebeplerden kaynaklanan geçici kesintilerden ötürü doğrudan veya dolaylı zararlardan sorumlu tutulamaz. Şirket, mevzuata veya işbu Sözleşmeye aykırı hareket eden hesapları tek taraflı olarak kısıtlama veya sonlandırma yetkisine sahiptir.
              </p>
            </section>

            {/* Section 8 */}
            <section id="gizlilik-ve-hesap-silme">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                8. Gizlilik, KVKK ve Hesap Silme
              </h2>
              <p>
                Kişisel verilerinizin işlenmesine ilişkin detaylı kurallar <strong>KVKK Aydınlatma Metni</strong> ve <strong>Gizlilik Politikası</strong> sayfalarımızda yer almaktadır. Kullanıcılar diledikleri zaman mobil uygulama üzerinden <strong>Profil &gt; Hesabımı ve Verilerimi Sil</strong> adımlarını izleyerek üyeliklerini sonlandırabilir ve kişisel verilerinin mevzuattaki yasal saklama süreleri haricinde silinmesini talep edebilirler.
              </p>
            </section>

            {/* Section 9 */}
            <section id="degisiklikler-ve-yururluk">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                9. Sözleşme Değişiklikleri ve Yürürlük
              </h2>
              <p>
                Alaf Teknoloji A.Ş., yasal mevzuat değişiklikleri veya platform geliştirmeleri doğrultusunda işbu Sözleşmeyi güncelleme hakkını saklı tutar. Önemli değişikliklerde Kullanıcılar mobil uygulama üzerinden bilgilendirilir ve gerektiğinde yeniden onay talep edilir.
              </p>
            </section>

            {/* Section 10 */}
            <section id="yetkili-mahkeme">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                10. Uygulanacak Hukuk ve Uyuşmazlıkların Çözümü
              </h2>
              <p>
                İşbu Sözleşmenin uygulanmasında ve yorumlanmasında Türk Hukuku uygulanır. Sözleşmeden doğabilecek uyuşmazlıklarda <strong>İstanbul Anadolu Mahkemeleri ve İcra Daireleri</strong> yetkilidir.
              </p>
            </section>

          </div>

          {/* Bottom Quick Links */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginTop: '36px', fontSize: '14px' }}>
            <Link href="/user-privacy" className="btn-outline" style={{ padding: '10px 20px' }}>
              📜 KVKK Aydınlatma Metni →
            </Link>
            <Link href="/reward-terms" className="btn-outline" style={{ padding: '10px 20px' }}>
              🎁 Ödül ve Kampanya Koşulları →
            </Link>
            <Link href="/age-suitability" className="btn-outline" style={{ padding: '10px 20px' }}>
              🔞 18+ Yaş Politikası →
            </Link>
            <Link href="/commercial-communication" className="btn-outline" style={{ padding: '10px 20px' }}>
              📣 İleti İzinleri →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
