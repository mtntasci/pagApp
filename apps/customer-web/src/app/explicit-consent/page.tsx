import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Açık Rıza Metni | PAG',
  description: '6698 Sayılı KVKK Kapsamında PAG Açık Rıza Metni. İsteğe bağlı kişisel veri işleme ve özel araştırma onayları.',
  alternates: {
    canonical: 'https://www.pagapp.com.tr/explicit-consent'
  },
  openGraph: {
    title: 'Açık Rıza Metni | PAG',
    description: '6698 Sayılı KVKK Kapsamında PAG Açık Rıza Metni. İsteğe bağlı kişisel veri işleme ve özel araştırma onayları.',
    url: 'https://www.pagapp.com.tr/explicit-consent',
    siteName: 'PAG',
    locale: 'tr_TR',
    type: 'website'
  }
};

export default function ExplicitConsentPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, padding: '56px 0 88px 0' }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          {/* Header Section */}
          <div style={{ marginBottom: '36px' }}>
            <div className="badge-lime">KVKK Kapsamında Rıza</div>
            <h1 style={{ fontSize: '36px', fontWeight: '900', marginTop: '14px', color: 'white', letterSpacing: '-0.5px' }}>
              Açık Rıza Metni
            </h1>
            <p style={{ color: 'var(--brand-lime)', fontSize: '15px', fontWeight: 600, marginTop: '6px' }}>
              6698 Sayılı KVKK Uyarınca İsteğe Bağlı Veri İşleme Faaliyetlerine İlişkin Açık Rıza Beyanı
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: 'var(--text-secondary)', marginTop: '12px', fontSize: '13px' }}>
              <span>📅 <strong>Son Güncelleme:</strong> 17 Ağustos 2026</span>
              <span>🏢 <strong>Veri Sorumlusu:</strong> Alaf Teknoloji A.Ş.</span>
            </div>
          </div>

          {/* Legal Notice Box */}
          <div className="glass-card" style={{ padding: '24px 28px', marginBottom: '32px', borderLeft: '4px solid #60A5FA', backgroundColor: 'rgba(10, 30, 77, 0.45)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#60A5FA', marginBottom: '8px' }}>
              Aydınlatma ve Açık Rıza Ayrımı
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              PAG’ın temel üyelik ve genel anket süreçleri, 6698 sayılı KVKK’nın 5/2 maddesindeki kanuni istisnalar (sözleşmenin kurulması/ifası, meşru menfaat ve hukuki yükümlülük) kapsamında yürütülmektedir. İşbu Açık Rıza Metni, yalnızca kanun gereği <strong>açık rıza verilmesi zorunlu olan istisnai ve ihtiyari veri işleme faaliyetlerini</strong> kapsamakta olup genel bir toptan rıza içermez.
            </p>
          </div>

          {/* Document Content */}
          <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px', lineHeight: '1.75', color: 'var(--text-secondary)', fontSize: '15px' }}>
            
            {/* Section 1 */}
            <section id="kapsam-ve-amac">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                1. Kapsam ve İhtiyari Nitelik
              </h2>
              <p>
                Açık rıza, Kullanıcının belirli bir konuya ilişkin, bilgilendirilmeye dayanan ve özgür iradesiyle açıkladığı rızadır. İşbu metin kapsamında onay verilmesi <strong>tamamen isteğe bağlıdır</strong>. Rıza verilmemesi, Kullanıcının PAG platformuna üye olmasını veya genel anketlere katılmasını hiçbir surette engellemez.
              </p>
            </section>

            {/* Section 2 */}
            <section id="riza-konulari">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                2. Açık Rızaya Konu Spesifik İşleme Faaliyetleri
              </h2>
              <p>
                Aşağıda belirtilen faaliyetler yalnızca Kullanıcının açık onay vermesi halinde icra edilir:
              </p>
              <ul style={{ paddingLeft: '22px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li>
                  <strong>Yurt Dışı Bulut Altyapısı Aktarımı:</strong> Veritabanı, oturum güvenliği ve push bildirim iletim altyapısı sağlayıcılarımız olan Google Cloud Platform / Firebase (Google LLC) ve Apple Inc. sunucularının yurt dışında bulunması sebebiyle, teknik altyapı işletimi amacıyla sınırlı olmak üzere verilerin yurt dışı veri merkezlerinde güvenli olarak barındırılması,
                </li>
                <li>
                  <strong>İsteğe Bağlı Özelleştirilmiş Pazar Araştırması Katılımı:</strong> Kullanıcının kendi isteğiyle profilinde cevapladığı özel ilgi alanları, marka tercihleri ve tüketim alışkanlıkları verilerinin, kullanıcının doğrudan kimliği gizli tutularak özel kurumsal pazar araştırması hedef kitle havuzlarında eşleştirilmesi.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="riza-geri-alma">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                3. Açık Rızanın Geri Alınması (İptal Hakkı)
              </h2>
              <p>
                Kullanıcı, vermiş olduğu açık rızayı dilediği zaman hiçbir gerekçe göstermeksizin ve herhangi bir olumsuz yaptırıma uğramaksızın geri alma hakkına sahiptir:
              </p>
              <ul style={{ paddingLeft: '22px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Mobil uygulama içerisindeki <strong>Profil &gt; Sözleşmeler ve İzinler</strong> bölümünden tercihlerini güncelleyebilir,</li>
                <li>Veya <strong>info@alafteknoloji.com</strong> adresine e-posta göndererek rızasını geri çektiğini bildirebilir.</li>
              </ul>
              <p style={{ marginTop: '8px' }}>
                Rızanın geri alınması, geri alma anından önceki veri işleme faaliyetlerinin hukuka uygunluğunu etkilemez.
              </p>
            </section>

            {/* Section 4 */}
            <section id="iletisim">
              <h2 style={{ color: 'white', fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>
                4. Veri Sorumlusu İletişim Bilgileri
              </h2>
              <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '10px', marginTop: '12px', fontSize: '13px', lineHeight: '1.6' }}>
                <p><strong>Veri Sorumlusu:</strong> Alaf Teknoloji A.Ş.</p>
                <p><strong>Adres:</strong> Yakacık Çarşı Mah. Panorama Sok. No: 26, Kartal / İstanbul, 34876, Türkiye</p>
                <p><strong>E-posta:</strong> info@alafteknoloji.com</p>
              </div>
            </section>

          </div>

          {/* Quick Links */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginTop: '36px', fontSize: '14px' }}>
            <Link href="/user-privacy" className="btn-outline" style={{ padding: '10px 20px' }}>
              📜 KVKK Aydınlatma Metni →
            </Link>
            <Link href="/terms" className="btn-outline" style={{ padding: '10px 20px' }}>
              ⚖️ Kullanım Koşulları →
            </Link>
            <Link href="/commercial-communication" className="btn-outline" style={{ padding: '10px 20px' }}>
              📣 Ticari Elektronik İleti İzni →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
