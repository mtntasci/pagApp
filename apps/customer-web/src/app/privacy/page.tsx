import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası | PAG',
  description: 'PAG Mobil Uygulaması ve Web Platformu Gizlilik Politikası. Kişisel verilerin korunması, profilleme puanı ve veri güvenliği esasları.',
  alternates: {
    canonical: 'https://www.pagapp.com.tr/privacy'
  },
  openGraph: {
    title: 'Gizlilik Politikası | PAG',
    description: 'PAG Mobil Uygulaması ve Web Platformu Gizlilik Politikası. Kişisel verilerin korunması, profilleme puanı ve veri güvenliği esasları.',
    url: 'https://www.pagapp.com.tr/privacy',
    siteName: 'PAG',
    locale: 'tr_TR',
    type: 'website'
  }
};

export default function PrivacyPolicyPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, padding: '56px 0 88px 0' }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          {/* Header Section */}
          <div style={{ marginBottom: '36px' }}>
            <div className="badge-lime">Yasal Doküman & Gizlilik</div>
            <h1 style={{ fontSize: '38px', fontWeight: '900', marginTop: '14px', color: 'white', letterSpacing: '-0.5px' }}>
              Gizlilik Politikası
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: 'var(--text-secondary)', marginTop: '10px', fontSize: '13px' }}>
              <span>📅 <strong>Son Güncelleme:</strong> 16 Ağustos 2026</span>
              <span>🏢 <strong>Veri Sorumlusu / İşletici:</strong> Alaf Teknoloji A.Ş.</span>
              <span>🌐 <strong>Hizmet Alanı:</strong> Mobil Uygulama (iOS & Android) ve Web Platformu</span>
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="glass-card" style={{ padding: '24px 28px', marginBottom: '32px', borderLeft: '4px solid var(--brand-lime)', backgroundColor: 'rgba(10, 30, 77, 0.45)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--brand-lime)', marginBottom: '8px' }}>
              Özet Bilgilendirme
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              PAG bir anket, profilleme ve tüketici araştırması platformudur. Kullanıcılarımızın gizliliğine ve kişisel verilerinin korunmasına en üst düzeyde önem veriyoruz. Kişisel verileriniz ticari anket sahibi üçüncü taraf firmalara satılmaz veya doğrudan kimliğinizi ortaya çıkaracak şekilde devredilmez. Kurumsal iş ortaklarına yalnızca toplu (aggregate) ve anonimleştirilmiş araştırma istatistikleri sunulur.
            </p>
          </div>

          {/* Content Document */}
          <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px', lineHeight: '1.75', color: 'var(--text-secondary)', fontSize: '15px' }}>
            
            {/* Section 1 */}
            <section id="hakkinda">
              <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                1. PAG Platformu ve Hizmetin Niteliği
              </h2>
              <p>
                PAG, <strong>Alaf Teknoloji A.Ş.</strong> (“Şirket” veya “PAG”) tarafından işletilen; kullanıcıların hesap oluşturarak profil bilgilerini doldurabildiği, genel veya sponsorlu araştırmalara/anketlere katılabildiği, Profil Puanı (Profile Score) kazanabildiği ve belirli koşulları sağlayan anketlerde nakit veya hediye çeki ödülü elde edebildiği bir tüketici araştırma ve profilleme ekosistemidir.
              </p>
              <p style={{ marginTop: '10px' }}>
                PAG hizmetlerinin temel ilkeleri şunlardır:
              </p>
              <ul style={{ paddingLeft: '22px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>
                  <strong>Katılım Tamamen Ücretsizdir:</strong> PAG’a üye olmak, profil doldurmak veya anketlere katılmak için herhangi bir ürün satın alma ya da katılım ücreti ödeme şartı aranmaz.
                </li>
                <li>
                  <strong>Profil Puanı Para Değildir:</strong> Platformda kazanılan Profil Puanı (Profile Score); bir para birimi, elektronik para, kripto varlık, nakit karşılığı veya başkasına devredilebilir bir finansal varlık <em>değildir</em>. Profil Puanı, kullanıcının platform içi profilleme gücünü temsil eder ve gelecekteki anket bildirimlerinde öncelik hakkı elde etmesini sağlar.
                </li>
                <li>
                  <strong>Ödül Kuralları:</strong> Bazı anket ve kampanyalar nakit veya hediye çeki ödülü sunabilir. Her anket ödüllü değildir; ödül varlığı, tutarı ve hak ediş sıralama kuralları ilgili anketin detay ekranında şeffaf bir şekilde gösterilir.
                </li>
                <li>
                  <strong>Sponsorlu İçerikler:</strong> Platformda PAG’ın kendi genel araştırma anketlerinin yanı sıra kurumsal markalara ait sponsorlu, tanıtıcı veya pazar araştırması anketleri yer alabilir.
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section id="toplanan-veriler">
              <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>
                2. Toplanan ve İşlenen Kişisel Veriler
              </h2>
              <p>
                Platformumuzu kullandığınızda, hizmetlerimizin işlevselliğini sağlamak ve size uygun araştırmaları ulaştırmak amacıyla yalnızca gerekli veriler toplanır:
              </p>
              <ul style={{ paddingLeft: '22px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li>
                  <strong>Hesap ve Kimlik Bilgileri:</strong> Ad, soyad, e-posta adresi, telefon numarası, doğum tarihi ve cinsiyet bilgisi.
                </li>
                <li>
                  <strong>Temel Profil ve Yerleşim Bilgileri:</strong> İkamet edilen il, ilçe ve mahalle seçimleri, medeni durum, çocuk sahipliği durumu ve memleket/doğum yeri gibi genel demografik tercihler.
                </li>
                <li>
                  <strong>Anket Yanıtları:</strong> Katıldığınız genel veya kurumsal anketlerde işaretlediğiniz tekil seçenekli yanıtlar.
                </li>
                <li>
                  <strong>Profil Anketi Yanıtları:</strong> İlgi alanları, tüketim tercihleri ve yaşam tarzına ilişkin profil geliştirme sorularına verilen yanıtlar (bu yanıtlar güncellenebilir niteliktedir).
                </li>
                <li>
                  <strong>Profil Puanı Kayıtları:</strong> Profil doldurma, anket tamamlama veya onay etkinlikleri neticesinde kazanılan Profil Puanı işlem geçmişi (ledger logları).
                </li>
                <li>
                  <strong>Ödül ve Finansal Bilgiler:</strong> Hak edilen parasal ödüller, hediye çeki (voucher) kodları, bakiye bilgileri ve nakit çekim talebinde bulunulması halinde mevzuat gereği talep edilen IBAN ve T.C. Kimlik Numarası (TCKN).
                </li>
                <li>
                  <strong>Doğrulama Kayıtları:</strong> Telefon doğrulama durumu, e-posta doğrulama durumu ve IBAN doğrulama kayıtları.
                </li>
                <li>
                  <strong>Teknik ve Cihaz Bilgileri:</strong> Firebase Cloud Messaging (FCM) cihaz bildirim jetonu, işletim sistemi türü ve sürümü (iOS/Android), cihaz modeli, uygulama sürümü ve anonim sistem günlükleri.
                </li>
                <li>
                  <strong>Oturum ve Kimlik Doğrulama Bilgileri:</strong> Google Sign-In, Sign in with Apple veya Firebase Authentication altyapısı üzerinden üretilen güvenli oturum belirteçleri (token). Parolalar veya kimlik doğrulama anahtarları veritabanımızda asla düz metin (plaintext) olarak saklanmaz.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="hedefleme-ve-anonimlik">
              <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>
                3. Anket Hedeflemesi ve Anonim İstatistik Ayrımı
              </h2>
              <p>
                PAG, kullanıcılara ilgisiz bildirimler göndermemek ve araştırmaları doğru hedef kitleye ulaştırmak amacıyla temel demografik verileri (yaş grubu, cinsiyet, il/ilçe yerleşim bölgesi, profil tercihleri) akıllı hedefleme kriteri olarak kullanır.
              </p>
              <div style={{ padding: '16px 20px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', marginTop: '12px' }}>
                <p style={{ color: 'white', fontWeight: '700', marginBottom: '6px' }}>🔒 Kesin PII Gizliliği Garantisi:</p>
                <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  Anket düzenleyen kurumsal müşterilerimize veya iş ortaklarımıza hiçbir koşulda kullanıcılarımızın Ad, Soyad, Telefon Numarası, E-posta Adresi veya T.C. Kimlik Numarası gibi doğrudan kimlik belirleyici verileri (PII) aktarılmaz. Kurumsal panellerde sadece toplulaştırılmış, grafiksel ve anonim istatistikler yer alır.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section id="hizmet-saglayicilar">
              <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>
                4. Kullanılan Üçüncü Taraf Altyapı ve Servis Sağlayıcıları
              </h2>
              <p>
                PAG, yüksek güvenlik ve kesintisiz hizmet standartlarını sağlamak amacıyla sektör lideri kurumsal bulut ve kimlik sağlayıcılarının resmi SDK’larını kullanmaktadır:
              </p>
              <ul style={{ paddingLeft: '22px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>
                  <strong>Google Cloud / Firebase (Google LLC):</strong> Güvenli kullanıcı kimlik doğrulaması (Firebase Authentication), şifreli bulut veritabanı (Cloud Firestore), sunucusuz yetkili backend fonksiyonları (Cloud Functions) ve push bildirim dağıtımı (Firebase Cloud Messaging - FCM).
                </li>
                <li>
                  <strong>Apple Inc.:</strong> Apple ile Giriş Yap (Sign in with Apple) ve iOS cihazlara güvenli anlık bildirim iletimi (Apple Push Notification service - APNs).
                </li>
              </ul>
              <p style={{ marginTop: '10px', fontSize: '14px' }}>
                Platformumuzda doğrulanmamış üçüncü taraf reklam izleme ağları veya veri komisyoncuları (data brokers) yer almamaktadır.
              </p>
            </section>

            {/* Section 5 */}
            <section id="veri-guvenligi">
              <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>
                5. Veri Güvenliği ve Sunucu Otoritesi
              </h2>
              <p>
                Kişisel verilerinizin güvenliğini sağlamak için endüstri standardı teknik ve idari tedbirler uygulanmaktadır:
              </p>
              <ul style={{ paddingLeft: '22px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Tüm veri iletimleri uçtan uca TLS 1.3 / SSL şifreleme protokolleri ile korunur.</li>
                <li>Profil Puanı, anket tamamlama zaman damgaları, ödül hak edişleri ve sıralamalar yalnızca sunucu tarafında (backend authoritative) hesaplanır; istemci tarafında manipülasyona izin verilmez.</li>
                <li>Veritabanı erişimleri en düşük yetki prensibine (least privilege) dayalı Firebase Security Rules ile korunur.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="saklama-ve-hesap-silme">
              <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>
                6. Veri Saklama, Hesap Kapatma ve Veri Silme
              </h2>
              <p>
                Kişisel verileriniz, hesabınız aktif olduğu sürece ve yasal yükümlülüklerin gerektirdiği süre boyunca güvenle saklanır.
              </p>
              <p style={{ marginTop: '10px' }}>
                <strong>Hesabınızı ve Verilerinizi Silme Yolları:</strong>
              </p>
              <ul style={{ paddingLeft: '22px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>
                  <strong>Uygulama İçinden:</strong> PAG mobil uygulamasında <em>Profil</em> sekmesine giderek alt kısımdaki <em>"Hesabımı ve Verilerimi Sil"</em> seçeneğini kullanabilirsiniz.
                </li>
                <li>
                  <strong>E-posta Talebi İle:</strong> Kayıtlı e-posta adresinizden <strong>info@alafteknoloji.com</strong> adresine hesap silme talebi iletebilirsiniz.
                </li>
              </ul>
              <p style={{ marginTop: '10px', fontSize: '14px' }}>
                Hesap silme işlemi tamamlandığında kişisel verileriniz veritabanımızdan kalıcı olarak silinir veya anonim hale getirilir; geçmiş anket istatistikleri anonimleştirilmiş toplamlar olarak muhafaza edilir.
              </p>
            </section>

            {/* Section 7 */}
            <section id="yas-siniri">
              <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>
                7. Yaş Sınırı Politikası (18+)
              </h2>
              <p>
                PAG hizmetleri yalnızca <strong>18 yaşını doldurmuş</strong> bireylerin kullanımına uygundur. 18 yaş altındaki bireylerin hesap açması ve platform etkinliklerine katılması hizmet şartlarımıza aykırıdır. Detaylı bilgi için <Link href="/age-suitability" style={{ color: 'var(--brand-lime)', textDecoration: 'underline' }}>Yaş Uygunluğu</Link> sayfamızı inceleyebilirsiniz.
              </p>
            </section>

            {/* Section 8 */}
            <section id="iletisim-ve-basvuru">
              <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>
                8. İletişim ve Veri Sahibi Hakları
              </h2>
              <p>
                Gizlilik politikamız, kişisel verilerinizin işlenmesi veya haklarınız ile ilgili her türlü soru, görüş ve başvurularınız için bizimle iletişime geçebilirsiniz:
              </p>
              <div style={{ padding: '16px 20px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '12px', marginTop: '12px', fontSize: '14px', lineHeight: '1.6' }}>
                <p style={{ color: 'white', fontWeight: 'bold' }}>Alaf Teknoloji A.Ş.</p>
                <p>Yakacık Çarşı Mah. Panorama Sok. No: 26</p>
                <p>Kartal / İstanbul, 34876, Türkiye</p>
                <p style={{ marginTop: '6px' }}>
                  E-posta: <a href="mailto:info@alafteknoloji.com" style={{ color: 'var(--brand-lime)', fontFamily: 'monospace' }}>info@alafteknoloji.com</a>
                </p>
                <p>
                  Resmi Web Sitesi: <a href="https://www.pagapp.com.tr" style={{ color: 'var(--brand-lime)', fontFamily: 'monospace' }}>https://www.pagapp.com.tr</a>
                </p>
              </div>
            </section>

          </div>

          {/* Bottom Navigation Links */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginTop: '36px', fontSize: '14px' }}>
            <Link href="/user-privacy" className="btn-outline" style={{ padding: '10px 20px' }}>
              📜 KVKK Aydınlatma Metni →
            </Link>
            <Link href="/age-suitability" className="btn-outline" style={{ padding: '10px 20px' }}>
              🔞 Yaş Uygunluğu →
            </Link>
            <Link href="/support" className="btn-outline" style={{ padding: '10px 20px' }}>
              💬 PAG Destek Merkezi →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
