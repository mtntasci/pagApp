import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'KVKK ve Kullanıcı Gizliliği | PAG',
  description: '6698 Sayılı KVKK Kapsamında PAG Kullanıcı Gizliliği ve Kişisel Verilerin Korunması Aydınlatma Metni.',
  alternates: {
    canonical: 'https://www.pagapp.com.tr/user-privacy'
  },
  openGraph: {
    title: 'KVKK ve Kullanıcı Gizliliği | PAG',
    description: '6698 Sayılı KVKK Kapsamında PAG Kullanıcı Gizliliği ve Kişisel Verilerin Korunması Aydınlatma Metni.',
    url: 'https://www.pagapp.com.tr/user-privacy',
    siteName: 'PAG',
    locale: 'tr_TR',
    type: 'website'
  }
};

export default function UserPrivacyKvkkPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, padding: '56px 0 88px 0' }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          {/* Header Section */}
          <div style={{ marginBottom: '36px' }}>
            <div className="badge-lime">Yasal Aydınlatma & KVKK</div>
            <h1 style={{ fontSize: '36px', fontWeight: '900', marginTop: '14px', color: 'white', letterSpacing: '-0.5px' }}>
              Kullanıcı Gizliliği ve Kişisel Verilerin Korunması
            </h1>
            <p style={{ color: 'var(--brand-lime)', fontSize: '15px', fontWeight: 600, marginTop: '6px' }}>
              6698 Sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) Kapsamında Aydınlatma Metni
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: 'var(--text-secondary)', marginTop: '12px', fontSize: '13px' }}>
              <span>📅 <strong>Son Güncelleme:</strong> 16 Ağustos 2026</span>
              <span>🏢 <strong>Veri Sorumlusu:</strong> Alaf Teknoloji A.Ş.</span>
            </div>
          </div>

          {/* Core Principles Summary Box */}
          <div className="glass-card" style={{ padding: '24px 28px', marginBottom: '32px', borderLeft: '4px solid var(--brand-blue)', backgroundColor: 'rgba(10, 30, 77, 0.45)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#60A5FA', marginBottom: '8px' }}>
              Önemli İlke ve Taahhütlerimiz
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Alaf Teknoloji A.Ş. olarak, PAG kullanıcılarımızın kişisel verilerini 6698 sayılı KVKK ilkelerine tam uyum içerisinde işliyoruz. Anket düzenleyen üçüncü taraf marka veya kurumlara kullanıcılarımızın doğrudan kimlik veya iletişim bilgileri <strong>asla aktarılmaz</strong>; yalnızca anonimleştirilmiş toplu araştırma raporları sunulur.
            </p>
          </div>

          {/* Legal Document Container */}
          <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px', lineHeight: '1.75', color: 'var(--text-secondary)', fontSize: '15px' }}>
            
            {/* Section 1 */}
            <section id="veri-sorumlusu">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                1. Veri Sorumlusunun Kimliği
              </h2>
              <p>
                6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, PAG mobil uygulaması ve ilişkili web hizmetleri kapsamında toplanan kişisel verileriniz; veri sorumlusu sıfatıyla <strong>Alaf Teknoloji A.Ş.</strong> (“Şirket”) tarafından aşağıda izah edilen kapsam ve meşru amaçlarla işlenmektedir.
              </p>
              <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '10px', marginTop: '12px', fontSize: '13px', lineHeight: '1.6' }}>
                <p><strong>Şirket Unvanı:</strong> Alaf Teknoloji A.Ş.</p>
                <p><strong>Adres:</strong> Yakacık Çarşı Mah. Panorama Sok. No: 26, Kartal / İstanbul, 34876, Türkiye</p>
                <p><strong>E-posta:</strong> info@alafteknoloji.com</p>
                <p><strong>Resmi Web Sitesi:</strong> https://www.pagapp.com.tr</p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="islenen-veriler">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                2. İşlenen Kişisel Veri Kategorileri
              </h2>
              <p>
                PAG hizmetlerinden yararlanmanız sırasında aşağıdaki kategorilerde kişisel verileriniz işlenmektedir:
              </p>
              <ul style={{ paddingLeft: '22px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>Kimlik Verileri:</strong> Ad, soyad, doğum tarihi, cinsiyet. Nakit ödül çekimi talep edildiğinde mevzuat gereği T.C. Kimlik Numarası (TCKN).</li>
                <li><strong>İletişim Verileri:</strong> E-posta adresi, cep telefonu numarası.</li>
                <li><strong>Yerleşim ve Demografi Verileri:</strong> İkamet edilen il, ilçe, mahalle bilgisi, memleket/doğum yeri, medeni durum ve çocuk sahipliği durumu.</li>
                <li><strong>Profil ve İlgi Alanı Verileri:</strong> Tercih edilen markalar, alışkanlıklar, hobiler ve dinamik profil sorularına verilen yanıtlar.</li>
                <li><strong>Anket Yanıt Verileri:</strong> Tamamlanan tekil seçimli genel ve kurumsal anket yanıtları.</li>
                <li><strong>Profil Puanı ve Sıralama Verileri:</strong> Profil tamamlama ve onay işlemleriyle kazanılan Profil Puanı (Profile Score) işlem kayıtları (ledger) ve kampanya sıralama kayıtları.</li>
                <li><strong>Ödül ve Finansal Veriler:</strong> Kazanılan nakit bakiyeler, tahsis edilen hediye çekleri (voucher) ve çekim taleplerinde kullanılan IBAN bilgisi.</li>
                <li><strong>Cihaz ve Güvenlik Verileri:</strong> FCM bildirim jetonu, işletim sistemi (iOS/Android), cihaz modeli, IP adresi, oturum belirteçleri ve güvenlik doğrulama kayıtları.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="islenme-amaclari">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                3. Kişisel Verilerin İşlenme Amaçları
              </h2>
              <p>
                Kişisel verileriniz KVKK’nın 4., 5. ve 6. maddelerinde belirtilen ilkelere uygun olarak aşağıdaki amaçlarla işlenmektedir:
              </p>
              <ul style={{ paddingLeft: '22px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Kullanıcı hesabı oluşturulması, kimlik ve oturum doğrulamasının gerçekleştirilmesi,</li>
                <li>Profil Puanı (Profile Score) algoritmasının işletilmesi ve güvenli defterde (ledger) tutulması,</li>
                <li>Demografik özellikler ve ilgi alanlarına göre uygun anket hedef kitlelerinin belirlenmesi,</li>
                <li>Anket davetlerinin ve push bildirimlerinin hakkaniyetli sıra ile iletilmesi,</li>
                <li>Anket tamamlama zaman damgalarının doğrulanması ve ödül sıralamasının belirlenmesi,</li>
                <li>Hak edilen nakit ödüllerin ve hediye çeklerinin hesaba tanımlanması ve transferi,</li>
                <li>Platform güvenliğinin sağlanması, sahte hesap, bot veya çoklu kayıt suistimallerinin önlenmesi,</li>
                <li>Yasal düzenlemelerden doğan bilgi saklama ve bildirim yükümlülüklerinin yerine getirilmesi.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="profil-ve-anket-verileri">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                4. Profil ve Anket Verilerinin İşlenme Esasları
              </h2>
              <p>
                Platformumuzda toplanan veriler iki temel kategoride yönetilir:
              </p>
              <ul style={{ paddingLeft: '22px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>
                  <strong>Dinamik Profil Verileri:</strong> Kullanıcılarımızın temel profil (şehir, ilçe, medeni durum vb.) ve profil geliştirme anketlerindeki yanıtları zaman içinde değişebilir. Kullanıcı yanıtını güncellediğinde yeni yanıt gelecekteki anket hedeflemelerinde ve anlık raporlarda geçerli olur; daha önce kazanılmış Profil Puanları geriye dönük olarak silinmez.
                </li>
                <li>
                  <strong>Değişmez (Immutable) Anket Yanıtları:</strong> Genel PAG anketleri veya kurumsal firma anketlerine verilen yanıtlar, araştırma metodolojisinin güvenilirliği gereği sunucuya iletildikten sonra değiştirilemez ve tekil olarak tescillenir.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="konum-yerlesim">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                5. Konum ve Yerleşim Bilgileri
              </h2>
              <p>
                PAG, cihazın hassas anlık GPS konumunu sürekli takip etmez. Kullanıcının kayıt sırasında veya profilinde kendi beyan ettiği İl, İlçe ve Mahalle seçimleri; yalnızca o bölgeye özel pazar araştırmalarının (örneğin belirli bir şehirdeki tüketici eğilimi) ilgili kullanıcılara ulaştırılması amacıyla işlenir.
              </p>
            </section>

            {/* Section 6 */}
            <section id="odul-surecleri">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                6. Ödül Süreçleri ve Finansal İşlemler
              </h2>
              <p>
                PAG sisteminde Profil Puanı ve Ödüller birbirinden bağımsız alanlardır:
              </p>
              <ul style={{ paddingLeft: '22px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>
                  <strong>Profil Puanı:</strong> Nakit veya finansal varlık değildir; doğrudan paraya çevrilemez.
                </li>
                <li>
                  <strong>Nakit & Hediye Çeki Ödülleri:</strong> Yalnızca ödül havuzu tanımlanmış anketleri tamamlayan ve sıralama şartlarını karşılayan kullanıcılara verilir. Ödül hak edişi sunucu otoritesiyle belirlenir.
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="kimlik-iban-dogrulama">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                7. Kimlik, IBAN ve Doğrulama Süreçleri
              </h2>
              <p>
                Sıradan anket katılımı ve Profil Puanı kazanımı için kimlik belgesi ibrazı zorunlu değildir. Ancak kullanıcı nakit bakiye çekim talebinde bulunduğunda; vergi mevzuatı, mali suçların önlenmesi ve ödülün gerçek hak sahibine ödendiğinin teyidi amacıyla ad-soyad ile eşleşen <strong>IBAN</strong> ve <strong>T.C. Kimlik Numarası (TCKN)</strong> doğrulaması talep edilebilir. Bu veriler yalnızca transfer ve yasal uyum amacıyla kullanılır.
              </p>
            </section>

            {/* Section 8 */}
            <section id="aktarim">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                8. Kişisel Verilerin Aktarılması
              </h2>
              <p>
                Kişisel verileriniz üçüncü kişilere <strong>satılmaz</strong> veya ticari amaçla devredilmez. Aktarım yapılan taraflar şunlardır:
              </p>
              <ul style={{ paddingLeft: '22px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>
                  <strong>Kurumsal Müşteriler (Firmalar):</strong> Firmalara yalnızca toplulaştırılmış, grafiksel ve anonim pazar araştırması istatistikleri aktarılır. Kullanıcılarımızın doğrudan kimlik veya iletişim bilgileri firmalara verilmez.
                </li>
                <li>
                  <strong>Teknoloji ve Altyapı Sağlayıcıları:</strong> Verilerin güvenli saklanması ve bildirim iletimi amacıyla Google Cloud / Firebase (veritabanı, oturum ve FCM bildirim) ve Apple Inc. (APNs bildirim ve Apple ile Giriş) servisleri kullanılmaktadır.
                </li>
                <li>
                  <strong>Yetkili Kamu Kurum ve Kuruluşları:</strong> Mevzuattan kaynaklanan yasal zorunluluklar halinde mahkemeler, icra daireleri ve yetkili idari mercilerle paylaşılabilir.
                </li>
              </ul>
            </section>

            {/* Section 9 */}
            <section id="hukuki-sebepler">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                9. Kişisel Veri Toplamanın Hukuki Sebepleri
              </h2>
              <p>
                Kişisel verileriniz elektronik ortamda mobil uygulama ve web sitemiz vasıtasıyla, KVKK’nın 5. maddesinde yer alan şu hukuki sebeplere dayanılarak toplanır:
              </p>
              <ul style={{ paddingLeft: '22px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması (PAG Kullanıcı Koşulları),</li>
                <li>Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması,</li>
                <li>İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması,</li>
                <li>Açık rızanın arandığı özel durumlarda kullanıcının açık rızası.</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section id="saklama-ve-silme">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                10. Kişisel Verilerin Saklanması ve Silinmesi
              </h2>
              <p>
                Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve Türk Ticaret Kanunu, Vergi Usul Kanunu ve Elektronik Ticaret mevzuatındaki yasal zamanaşımı süreleri dikkate alınarak saklanır.
              </p>
              <p style={{ marginTop: '8px' }}>
                Kullanıcılarımız diledikleri zaman mobil uygulamamızdaki <strong>Profil &gt; "Hesabımı ve Verilerimi Sil"</strong> butonunu kullanarak veya <strong>info@alafteknoloji.com</strong> adresine e-posta göndererek hesaplarının ve kişisel verilerinin silinmesini talep edebilirler.
              </p>
            </section>

            {/* Section 11 */}
            <section id="veri-guvenligi-tedbirleri">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                11. Veri Güvenliği Tedbirleri
              </h2>
              <p>
                Şirketimiz; kişisel verilerin hukuka aykırı olarak işlenmesini ve erişilmesini önlemek amacıyla SSL/TLS şifreli veri iletimi, sunucu taraflı yetkilendirme mimarisi, erişim loglaması ve veritabanı güvenlik kuralları dahil olmak üzere gerekli tüm teknik ve idari güvenlik önlemlerini almaktadır.
              </p>
            </section>

            {/* Section 12 */}
            <section id="kvkk-haklari">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                12. KVKK’nın 11. Maddesi Kapsamındaki Haklarınız
              </h2>
              <p>
                KVKK’nın 11. maddesi uyarınca veri sahibi olarak;
              </p>
              <ul style={{ paddingLeft: '22px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
                <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
                <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
                <li>Yurt içinde veya yurt dışında aktarıldığı 3. kişileri bilme,</li>
                <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
                <li>KVKK 7. maddesi çerçevesinde silinmesini veya yok edilmesini isteme,</li>
                <li>Düzeltme ve silme işlemlerinin aktarıldığı 3. kişilere bildirilmesini isteme,</li>
                <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,</li>
                <li>Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme haklarına sahipsiniz.</li>
              </ul>
            </section>

            {/* Section 13 */}
            <section id="basvuru-usulu">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                13. Başvuru Usulü ve İletişim
              </h2>
              <p>
                Yukarıda belirtilen haklarınızı kullanmak için taleplerinizi; Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ uyarınca yazılı olarak veya sistemimizde kayıtlı e-posta adresiniz üzerinden Şirketimize iletebilirsiniz:
              </p>
              <div style={{ padding: '16px 20px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '12px', marginTop: '12px', fontSize: '14px', lineHeight: '1.6' }}>
                <p style={{ color: 'white', fontWeight: 'bold' }}>Alaf Teknoloji A.Ş. — KVKK Başvuru Masası</p>
                <p>Yakacık Çarşı Mah. Panorama Sok. No: 26, Kartal / İstanbul, 34876, Türkiye</p>
                <p style={{ marginTop: '6px' }}>
                  E-posta: <a href="mailto:info@alafteknoloji.com" style={{ color: 'var(--brand-lime)', fontFamily: 'monospace' }}>info@alafteknoloji.com</a>
                </p>
              </div>
            </section>

          </div>

          {/* Bottom Links */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginTop: '36px', fontSize: '14px' }}>
            <Link href="/privacy" className="btn-outline" style={{ padding: '10px 20px' }}>
              🔒 Gizlilik Politikası →
            </Link>
            <Link href="/age-suitability" className="btn-outline" style={{ padding: '10px 20px' }}>
              🔞 Yaş Uygunluğu →
            </Link>
            <Link href="/support" className="btn-outline" style={{ padding: '10px 20px' }}>
              💬 Destek Merkezi →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
