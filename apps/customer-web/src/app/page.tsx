'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DeviceMockups from '@/components/DeviceMockups';

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1 }}>
        {/* HERO SECTION — USER FIRST */}
        <section style={{
          padding: '100px 0 80px 0',
          background: 'radial-gradient(circle at 50% 30%, rgba(183, 243, 74, 0.12) 0%, rgba(1, 16, 51, 0) 70%)'
        }}>
          <div className="container" style={{ textAlign: 'center', maxWidth: '840px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
              <div className="badge-lime">
                ⚡ Mobil Anket & Profilleme Ekosistemi
              </div>

              <h1 style={{ fontSize: '52px', fontWeight: '900', lineHeight: '1.15', letterSpacing: '-1px' }}>
                Profil Puanını Yükselt, <br />
                <span className="text-gradient">Öne Geç, Ödüllü Anketleri</span> İlk Sen Gör!
              </h1>

              <p style={{ fontSize: '19px', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '720px' }}>
                PAG; ilgi alanlarınıza uygun anketlere katılarak <strong>Profil Puanı</strong> kazandığınız, yüksek puanla gelecek kampanya ve anket bildirimlerinde <strong>öncelik elde ettiğiniz</strong> yeni nesil mobil platformdur.
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
                <a href="#nasil-calisir" className="btn-lime" style={{ padding: '14px 28px', fontSize: '15px' }}>
                  Nasıl Çalışır? Detayları Gör ↓
                </a>
                <Link href="/firmalar" className="btn-outline" style={{ padding: '14px 28px', fontSize: '15px' }}>
                  🏢 Kurumsal
                </Link>
              </div>

              <div style={{ display: 'flex', gap: '36px', justifyContent: 'center', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: '28px', marginTop: '16px', width: '100%', maxWidth: '600px' }}>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--brand-lime)' }}>Maks. 3 Soru</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Hızlı ve yormayan sorular</div>
                </div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#FFFFFF' }}>Dinamik Sıralama</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Puanına göre bildirim önceliği</div>
                </div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--brand-lime)' }}>Kontrollü Push</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Zamanında ve adil bildirim</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: NASIL ÇALIŞIR */}
        <section id="nasil-calisir" style={{ padding: '80px 0', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 56px auto' }}>
              <div className="badge-lime">Akış & Mekanizma</div>
              <h2 style={{ fontSize: '36px', fontWeight: '800', marginTop: '12px', color: 'white' }}>PAG Nasıl Çalışır?</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '16px' }}>
                Katılım sağladıkça puan kazandıran, puanınız yükseldikçe sonraki kampanyalarda size öncelik kazandıran 4 adımlı döngü.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              {[
                {
                  step: '01',
                  title: 'Profilini Oluştur',
                  desc: 'Temel profil sorularını yanıtla. İlgi alanlarını, demografik bilgilerini tam ve doğru doldur.'
                },
                {
                  step: '02',
                  title: 'Profil Puanı Kazan',
                  desc: 'Tamamladığın her profil anketi ve etkinlik sana Profil Puanı kazandırır. Puanın şeffaf olarak kaydedilir.'
                },
                {
                  step: '03',
                  title: 'Erken Erişim Bildirimi Al',
                  desc: 'Yüksek Profil Puanı olan kullanıcılar, yeni anket bildirimlerini ve sınırlı süreli fırsatları daha erken alır.'
                },
                {
                  step: '04',
                  title: 'Hızlı Yanıtla & Ödül Fırsatı',
                  desc: 'Ankete katılan kullanıcılar ankete özel tanımlanmış Para Ödülü, Hediye Çeki veya Profil Puanı kazanma fırsatı yakalar.'
                }
              ].map((card, idx) => (
                <div key={idx} className="glass-card" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--brand-lime)', opacity: 0.8 }}>{card.step}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>{card.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 2: PROFİL PUANI & YARIŞ / HIZ AVANTAJI */}
        <section id="profil-puani" style={{ padding: '80px 0', borderTop: '1px solid var(--border-color)' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
              <div>
                <div className="badge-lime">⭐ Öncelik & Sıralama Otoritesi</div>
                <h2 style={{ fontSize: '36px', fontWeight: '800', marginTop: '12px', color: 'white', lineHeight: 1.2 }}>
                  Profil Puanı Nedir? <br />
                  <span style={{ color: 'var(--brand-lime)' }}>Para Değildir, Avantajdır!</span>
                </h2>

                <p style={{ color: 'var(--text-secondary)', marginTop: '16px', fontSize: '16px', lineHeight: '1.7' }}>
                  <strong>Profil Puanı (Profile Score)</strong> nakit para veya harcanabilir bakiye değildir. PAG ekosisteminde kullanıcıların güvenilirliğini, aktifliğini ve profil doluluğunu temsil eden dinamik sıralama puandır.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(183, 243, 74, 0.2)', color: 'var(--brand-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>✓</div>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>Erken Erişim & Bildirim Önceliği</h4>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        PAG push bildirimleri kontrollü ve sıralı gönderilir. Yüksek puanlı kullanıcılar bildirimi ilk alan grupta yer alır.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(183, 243, 74, 0.2)', color: 'var(--brand-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>✓</div>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>Hız ve Sıralama Avantajı</h4>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Bildirimi erken alan kullanıcılar anketi daha hızlı tamamlama şansı elde eder. Katılım zamanı derece ödüllerinde belirleyicidir.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(183, 243, 74, 0.2)', color: 'var(--brand-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>✓</div>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>Şeffaf ve İzlenebilir Defter (Ledger)</h4>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Earned score events are logged auditably. Duplicate score allocation is strictly prevented by the backend.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informative Card */}
              <div className="glass-card" style={{ padding: '36px', border: '1px solid var(--border-highlight)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--brand-lime)', marginBottom: '16px' }}>
                  🎯 Rekabet & Zamanlama Mantığı
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '20px' }}>
                  PAG'da her anket sınırlı bütçe veya kontenjana sahip olabilir. Bildirimi erken almak, anket henüz tamamlanmadan katılım sağlama şansınızı artırır.
                </p>
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '13px' }}>
                  <span style={{ color: 'var(--brand-lime)', fontWeight: 'bold' }}>Formül:</span> <br />
                  Yüksek Profil Puanı → Erken Bildirim → Hızlı Katılım → Derece Ödülü Şansı!
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: UYGULAMAYI TANIYIN */}
        <section id="uygulamayi-taniyin" style={{ padding: '80px 0', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
              <div className="badge-lime">📱 Mobil Ekranlar</div>
              <h2 style={{ fontSize: '36px', fontWeight: '800', marginTop: '12px', color: 'white' }}>Uygulamayı Tanıyın</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '16px' }}>
                PAG mobil uygulamasını keşfedin. Ekranları değiştirerek ana sayfa, story akışı, anketler, ödüller ve profil özelliklerini canlı deneyimleyin.
              </p>
            </div>

            <DeviceMockups />
          </div>
        </section>

        {/* SECTION 4: ÖDÜLLER */}
        <section id="oduller" style={{ padding: '80px 0', borderTop: '1px solid var(--border-color)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
              <div className="badge-lime">Ödül Türleri</div>
              <h2 style={{ fontSize: '36px', fontWeight: '800', marginTop: '12px', color: 'white' }}>PAG Ödül Ekosistemi</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '16px' }}>
                Anketlerin türüne ve kurgusuna göre kazanabileceğiniz ödül kategorileri.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>💵</div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Para Ödülü (TL)</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Belirli firma anketlerinde ilk sıralarda tamamlayan kullanıcılara derece bazlı veya eşit dağıtımlı nakit para ödülleri aktarılır.
                </p>
              </div>

              <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>🎟️</div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Hediye Çekleri (Voucher)</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Markaların hediye kodları (indirim veya ürün çeki) yetkili tamamlama sırasına göre kullanıcının hesabına dijital kod olarak tanımlanır.
                </p>
              </div>

              <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>⭐</div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Profil Puanı</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Her başarılı anket katılımı Profil Puanınızı artırarak gelecekteki anket kampanyalarında daha üst sıralara tırmanmanızı sağlar.
                </p>
              </div>
            </div>

            <div style={{ marginTop: '32px', padding: '16px 24px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
              ℹ️ <strong>Önemli Bilgilendirme:</strong> Her ankette parasal ödül bulunması garanti değildir. Ödül miktarı ve kurgusu anket sahibinin tanımlamasına göre belirlenir.
            </div>
          </div>
        </section>

        {/* SECTION 5: FIRMALAR İÇİN TEASER CARD */}
        <section style={{ padding: '80px 0', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
          <div className="container">
            <div className="glass-card" style={{ padding: '48px', border: '1px solid var(--border-highlight)', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', alignItems: 'center' }}>
              <div>
                <div className="badge-lime">Kurumsal Çözümler</div>
                <h2 style={{ fontSize: '32px', fontWeight: '800', marginTop: '12px', color: 'white' }}>
                  Markanız İçin Doğru Hedef Kitleye Doğrudan Ulaşın
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '12px', fontSize: '16px', lineHeight: '1.6' }}>
                  Yaş, lokasyon (il/ilçe/mahalle), medeni durum ve çocuk durumu gibi mikro-profil filtreleriyle hedef kitlenizi oluşturun, maksimum 3 soruda anında gerçek veri toplayın.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link href="/firmalar" className="btn-lime" style={{ textAlign: 'center' }}>
                  Kurumsal Detaylar →
                </Link>
                <Link href="/firma-basvuru" className="btn-outline" style={{ textAlign: 'center' }}>
                  Kurumsal Başvuru Yap
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
