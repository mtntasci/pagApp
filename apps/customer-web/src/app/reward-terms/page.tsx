import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Ödül ve Kampanya Katılım Koşulları | PAG',
  description: 'PAG Ödül ve Kampanya Katılım Koşulları. Nakit ödüller, hediye çekleri, sıralama kuralları, Profil Puanı ve ödeme şartları.',
  alternates: {
    canonical: 'https://www.pagapp.com.tr/reward-terms'
  },
  openGraph: {
    title: 'Ödül ve Kampanya Katılım Koşulları | PAG',
    description: 'PAG Ödül ve Kampanya Katılım Koşulları. Nakit ödüller, hediye çekleri, sıralama kuralları, Profil Puanı ve ödeme şartları.',
    url: 'https://www.pagapp.com.tr/reward-terms',
    siteName: 'PAG',
    locale: 'tr_TR',
    type: 'website'
  }
};

export default function RewardTermsPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, padding: '56px 0 88px 0' }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          {/* Header Section */}
          <div style={{ marginBottom: '36px' }}>
            <div className="badge-lime">Ödül & Kampanya Standartları</div>
            <h1 style={{ fontSize: '36px', fontWeight: '900', marginTop: '14px', color: 'white', letterSpacing: '-0.5px' }}>
              Ödül ve Kampanya Katılım Koşulları
            </h1>
            <p style={{ color: 'var(--brand-lime)', fontSize: '15px', fontWeight: 600, marginTop: '6px' }}>
              PAG Platformu Nakit Ödül, Hediye Çeki (Voucher) ve Sıralama Esasları
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: 'var(--text-secondary)', marginTop: '12px', fontSize: '13px' }}>
              <span>📅 <strong>Son Güncelleme:</strong> 17 Ağustos 2026</span>
              <span>🏢 <strong>İşletici:</strong> Alaf Teknoloji A.Ş.</span>
              <span>🔞 <strong>Yaş Kriteri:</strong> 18 Yaş ve Üzeri</span>
            </div>
          </div>

          {/* Highlight Box */}
          <div className="glass-card" style={{ padding: '24px 28px', marginBottom: '32px', borderLeft: '4px solid var(--brand-lime)', backgroundColor: 'rgba(183, 243, 74, 0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--brand-lime)', marginBottom: '8px' }}>
              Önemli Bilgilendirme
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              PAG platformunda kazanılan <strong>Profil Puanı (Profile Score) nakit para değildir</strong>; doğrudan paraya dönüştürülemez. Nakit ödüller ve hediye çekleri yalnızca ödül havuzu tanımlanmış belirli anket/kampanyaları başarıyla ve sıralama şartlarına uygun tamamlayan kullanıcılara sunucu yetkisiyle tahsis edilir.
            </p>
          </div>

          {/* Document Content */}
          <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px', lineHeight: '1.75', color: 'var(--text-secondary)', fontSize: '15px' }}>
            
            {/* Section 1 */}
            <section id="odul-turleri-ve-tanimlar">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                1. Ödül Türleri ve Temel Esaslar
              </h2>
              <p>
                PAG platformundaki ödül mekanizması birbirinden bağımsız üç temel alandan oluşur:
              </p>
              <ul style={{ paddingLeft: '22px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>
                  <strong>Profil Puanı (Profile Score):</strong> Kullanıcının anket tamamlama, profil doldurma veya hesap doğrulama adımlarıyla kazandığı platform içi itibar ve sıralama puanıdır. Mali bir değeri yoktur; gelecekteki anket bildirimlerinde öncelik sağlar.
                </li>
                <li>
                  <strong>Nakit Ödül Bakiyesi:</strong> Belirli kurumsal veya genel anketlerde tanımlanan Türk Lirası (TL) cinsinden ödül havuzudur. Anket koşullarını ve sıralama şartlarını karşılayan kullanıcıların PAG Ödül Bakiyesine yansıtılır.
                </li>
                <li>
                  <strong>Hediye Çekleri ve Kodlar (Voucher):</strong> Anlaşmalı marka ve kurumlara ait tek kullanımlık dijital indirim veya hediye kodlarıdır.
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section id="ucretsiz-katilim">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                2. Ücretsiz Katılım ve Satın Alma Zorunluluğunun Bulunmaması
              </h2>
              <p>
                PAG üzerindeki hiçbir ankete veya ödül havuzuna katılmak için kullanıcılardan herhangi bir ücret, depozito veya satın alma talep edilmez. PAG bir şans oyunu veya kumar uygulaması değildir; ödül kazanımı şansa değil, kullanıcının geçerli araştırma kriterlerine ve doğru anket yanıtlamasına dayanır.
              </p>
            </section>

            {/* Section 3 */}
            <section id="siralama-ve-sunucu-otoritesi">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                3. Ödül Sıralaması ve Sunucu Otoritesi (Server Authority)
              </h2>
              <p>
                Ödül hak edişinde ve sıralamalarında şu ilkeler bağlayıcıdır:
              </p>
              <ul style={{ paddingLeft: '22px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>Push Sırası ile Ödül Sırası Ayrımı:</strong> Push bildirimini daha önce almak, ankete erken erişim avantajı sağlar ancak ödül sıralamasını doğrudan belirlemez. Ödül sıralaması, anket yanıtlarının PAG sunucularına ulaştığı ve doğrulandığı <strong>sunucu zaman damgası</strong> sırasına göre belirlenir.</li>
                <li><strong>Cihaz Saati Güvensizliği:</strong> Kullanıcının cihazındaki yerel saat bilgisi dikkate alınmaz; yalnızca sunucu tarafından atanan atomik zaman damgası geçerlidir.</li>
                <li><strong>Hakkaniyetli Dağıtım:</strong> Derece ödüllü anketlerde (örn. 1., 2., 3. ve sonraki sıralar) sunucu işlem sırası kesin ve cứu kabul edilir.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="dogrulama-ve-iban">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                4. Nakit Bakiye Çekimi ve Kimlik / IBAN Doğrulaması
              </h2>
              <p>
                Kullanıcıların biriken nakit ödül bakiyelerini banka hesaplarına transfer edebilmeleri için:
              </p>
              <ul style={{ paddingLeft: '22px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>PAG tarafından belirlenen asgari çekim tutarına ulaşılmış olması,</li>
                <li>Kullanıcının 18 yaşını doldurmuş olması,</li>
                <li>Vergi mevzuatı ve mali suçlarla mücadele yasal düzenlemeleri uyarınca Kullanıcının kendi adına kayıtlı <strong>T.C. Kimlik Numarası (TCKN)</strong> ve <strong>TR ile başlayan geçerli bir banka IBAN</strong> bilgisini ibraz ve teyit etmesi zorunludur.</li>
              </ul>
              <p style={{ marginTop: '8px' }}>
                Başkasına ait banka hesabına veya 18 yaş altı hesaplara çekim talepleri işleme alınmaz.
              </p>
            </section>

            {/* Section 5 */}
            <section id="hediye-cekleri">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                5. Hediye Çekleri (Voucher) Kullanım Kuralları
              </h2>
              <p>
                Tahsis edilen dijital hediye çekleri ve kuponlar:
              </p>
              <ul style={{ paddingLeft: '22px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Yalnızca ilgili markanın fiziki mağazalarında veya internet sitesinde belirtilen son kullanma tarihine kadar geçerlidir.</li>
                <li>Nakit paraya çevrilemez, iade edilemez veya kısmi para üstü talep edilemez.</li>
                <li>İlgili markanın genel kullanım koşullarına tabidir.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="hile-ve-suistimal">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                6. Hile, Manipülasyon ve İptal Halleri
              </h2>
              <p>
                Aşağıdaki durumların tespiti halinde Alaf Teknoloji A.Ş. ilgili kullanıcının ödül hak edişlerini tek taraflı olarak iptal etme, bakiyesini sıfırlama ve hesabını askıya alma yetkisine sahiptir:
              </p>
              <ul style={{ paddingLeft: '22px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Bot, otomatik yanıtlayıcı, makro veya benzeri yazılımlarla anket yanıtlamak,</li>
                <li>Sahte hesap açarak veya başkalarının adına çoklu anket doldurarak ödül havuzunu tüketmeye çalışmak,</li>
                <li>Sunucu API isteklerini manipüle etmeye çalışmak veya güvenlik kontrollerini atlatmak,</li>
                <li>18 yaşından küçük olmasına rağmen yanlış beyanla ödül talep etmek.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="iletisim">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                7. Destek ve İletişim
              </h2>
              <p>
                Ödül süreçleri veya bakiye çekim taleplerinizle ilgili her türlü soru için destek ekibimizle irtibata geçebilirsiniz:
              </p>
              <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '10px', marginTop: '12px', fontSize: '13px', lineHeight: '1.6' }}>
                <p><strong>Alaf Teknoloji A.Ş. — Ödül ve Operasyon Masası</strong></p>
                <p>Yakacık Çarşı Mah. Panorama Sok. No: 26, Kartal / İstanbul, 34876, Türkiye</p>
                <p>E-posta: <a href="mailto:info@alafteknoloji.com" style={{ color: 'var(--brand-lime)', fontFamily: 'monospace' }}>info@alafteknoloji.com</a></p>
              </div>
            </section>

          </div>

          {/* Quick Links */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginTop: '36px', fontSize: '14px' }}>
            <Link href="/terms" className="btn-outline" style={{ padding: '10px 20px' }}>
              ⚖️ Kullanım Koşulları →
            </Link>
            <Link href="/user-privacy" className="btn-outline" style={{ padding: '10px 20px' }}>
              📜 KVKK Aydınlatma Metni →
            </Link>
            <Link href="/age-suitability" className="btn-outline" style={{ padding: '10px 20px' }}>
              🔞 18+ Yaş Politikası →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
