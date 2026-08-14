'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DeviceMockups from '@/components/DeviceMockups';
import InteractiveSurveyDemo from '@/components/InteractiveSurveyDemo';
import PushPrioritySimulator from '@/components/PushPrioritySimulator';
import AudienceTargetingDemo from '@/components/AudienceTargetingDemo';

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden' }}>
      <Header />

      <main style={{ flex: 1, width: '100%' }}>
        {/* HERO SECTION */}
        <section className="bg-mesh-radial" style={{
          padding: '90px 0 70px 0',
          width: '100%',
          position: 'relative'
        }}>
          <div className="container" style={{ textAlign: 'center', maxWidth: '920px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px' }}>
              
              <div className="badge-lime animate-float">
                ⚡ Mobil Anket & Profil Puanlama Ekosistemi
              </div>

              <h1 style={{ fontSize: '54px', fontWeight: '900', lineHeight: '1.15', letterSpacing: '-1.5px', color: 'white' }}>
                Soruları Yanıtla, Profil Puanını Katla, <br />
                <span className="text-gradient">Ödüllü Anketleri</span> İlk Sen Gör!
              </h1>

              <p style={{ fontSize: '19px', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '780px' }}>
                PAG; sıkıcı formları tarihe gömen, <strong>maksimum 3 soruda</strong> gerçek nakit TL ve hediye çekleri kazandıran, yüksek <strong>Profil Puanı</strong> ile bildirimlerde sana öncelik sağlayan yeni nesil mobil platformdur.
              </p>

              {/* Action Buttons */}
              <div className="hero-buttons">
                <a href="#simulasyon" className="btn-lime" style={{ padding: '16px 32px', fontSize: '15px' }}>
                  🎮 Canlı Demosunu Dene ↓
                </a>
                <a href="#kurumsal" className="btn-blue" style={{ padding: '16px 32px', fontSize: '15px' }}>
                  🏢 Kurumsal Markalar
                </a>
                <Link href="/firmalar" className="btn-outline" style={{ padding: '16px 32px', fontSize: '15px' }}>
                  Detaylı Çözümler →
                </Link>
              </div>

              {/* High-level feature highlights */}
              <div className="responsive-hero-stats">
                <div style={{ padding: '10px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--brand-lime)' }}>Maks. 3 Soru</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Hızlı ve yormayan mikro-sorular</div>
                </div>
                <div style={{ padding: '10px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#60A5FA' }}>Kademeli Push</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Puanına göre erken bildirim alma</div>
                </div>
                <div style={{ padding: '10px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#FBBF24' }}>Nakit & Çekler</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Dereceye gir, gerçek kazanç sağla</div>
                </div>
                <div style={{ padding: '10px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#C084FC' }}>%100 Güvenli</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Şeffaf defter & KVKK güvencesi</div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* LIVE TICKER MARQUEE */}
        <div className="ticker-wrapper">
          <div className="ticker-content">
            <div className="ticker-item">
              <span>🔥</span> <span>Son Anket: <strong>Ford Elektrikli Araç Araştırması (100 TL Ödüllü)</strong></span>
            </div>
            <div className="ticker-item">
              <span>⚡</span> <span>Ortalama Yanıtlama Süresi: <strong>24 Saniye</strong></span>
            </div>
            <div className="ticker-item">
              <span>⭐</span> <span>Dağıtılan Toplam Profil Puanı: <strong>1,850,000+ P</strong></span>
            </div>
            <div className="ticker-item">
              <span>🍔</span> <span>Marka Hediye Çekleri: <strong>McDonald’s, Kahve Dünyası & Daha Fazlası</strong></span>
            </div>
            <div className="ticker-item">
              <span>🎯</span> <span>Standart Kural: <strong>Maksimum 3 Soru (Single Select)</strong></span>
            </div>
            {/* Repeated for seamless loop */}
            <div className="ticker-item">
              <span>🔥</span> <span>Son Anket: <strong>Ford Elektrikli Araç Araştırması (100 TL Ödüllü)</strong></span>
            </div>
            <div className="ticker-item">
              <span>⚡</span> <span>Ortalama Yanıtlama Süresi: <strong>24 Saniye</strong></span>
            </div>
            <div className="ticker-item">
              <span>⭐</span> <span>Dağıtılan Toplam Profil Puanı: <strong>1,850,000+ P</strong></span>
            </div>
          </div>
        </div>

        {/* SECTION 1: İNTERAKTİF ANKET DEMOSU */}
        <section id="simulasyon" style={{ padding: '90px 0', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 48px auto' }}>
              <div className="badge-lime">🎮 Canlı Etkileşim</div>
              <h2 style={{ fontSize: '38px', fontWeight: '900', marginTop: '12px', color: 'white' }}>
                PAG Deneyimini Hemen Test Et
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '16px' }}>
                Aşağıdaki 3 soruluk canlı demoyu çözerek puan topla ve PAG'ın ne kadar hızlı ve eğlenceli olduğunu keşfet!
              </p>
            </div>

            <div style={{ maxWidth: '780px', margin: '0 auto' }}>
              <InteractiveSurveyDemo />
            </div>
          </div>
        </section>

        {/* SECTION 2: NASIL ÇALIŞIR */}
        <section id="nasil-calisir" style={{ padding: '90px 0', borderTop: '1px solid var(--border-color)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 56px auto' }}>
              <div className="badge-lime">⚡ 4 Adımlı Döngü</div>
              <h2 style={{ fontSize: '38px', fontWeight: '900', marginTop: '12px', color: 'white' }}>
                PAG Nasıl Çalışır?
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '16px' }}>
                Katılım sağladıkça Profil Puanı kazandıran, puanınız yükseldikçe bildirimlerde sizi 1. Sıraya taşıyan adil mekanizma.
              </p>
            </div>

            <div className="responsive-grid-4">
              {[
                {
                  step: '01',
                  title: 'Profilini Doldur',
                  desc: 'Temel demografik ve ilgi alanı sorularını yanıtla. İl/ilçe ve tercihlerini eksiksiz tamamla.',
                  icon: '👤'
                },
                {
                  step: '02',
                  title: 'Profil Puanı Topla',
                  desc: 'Tamamladığın her profil sorusu, anket ve günlük video sana auditable Profil Puanı kazandırır.',
                  icon: '⭐'
                },
                {
                  step: '03',
                  title: 'Erken Bildirim Al',
                  desc: 'Yeni anketler yayınlandığında yüksek puanlı kullanıcılar bildirimi ilk 60 saniyede alır.',
                  icon: '🚀'
                },
                {
                  step: '04',
                  title: 'Hızlı Çöz & Ödülü Kap',
                  desc: 'Maksimum 3 soruyu hızla tamamla; nakit para (TL), hediye çeki veya ekstra puan kazan!',
                  icon: '💸'
                }
              ].map((card, idx) => (
                <div key={idx} className="glass-card" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '32px' }}>{card.icon}</span>
                    <span style={{ fontSize: '28px', fontWeight: '900', color: 'var(--brand-lime)', opacity: 0.8 }}>{card.step}</span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>{card.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3: PROFİL PUANI & PUSH SIRALAMA SİMÜLATÖRÜ */}
        <section id="profil-puani" style={{ padding: '90px 0', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
          <div className="container">
            <div className="responsive-grid-2" style={{ alignItems: 'center' }}>
              <div>
                <div className="badge-blue">⭐ Öncelik & Sıralama Otoritesi</div>
                <h2 style={{ fontSize: '36px', fontWeight: '900', marginTop: '14px', color: 'white', lineHeight: 1.2 }}>
                  Profil Puanı Nedir? <br />
                  <span className="text-gradient">Para Değildir, En Büyük Avantajdır!</span>
                </h2>

                <p style={{ color: 'var(--text-secondary)', marginTop: '16px', fontSize: '16px', lineHeight: '1.7' }}>
                  <strong>Profil Puanı (Profile Score)</strong> harcanabilir nakit para değildir. PAG platformunda kullanıcının aktifliğini, doğrulanmışlığını ve güvenilirliğini temsil eden dinamik bildirim sıralama puanıdır.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(183, 243, 74, 0.2)', color: 'var(--brand-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>✓</div>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>Elmas & Yakut Bildirim Önceliği</h4>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        PAG bildirimleri değer sırasına göre <strong>Elmas (00:00)</strong>, <strong>Yakut (+60s)</strong>, <strong>Altın (+120s)</strong> ve <strong>Gümüş (+180s)</strong> gruplarına kademeli gönderilir.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(183, 243, 74, 0.2)', color: 'var(--brand-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>✓</div>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>Zaman ve Derece Avantajı</h4>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Bildirimi erken alan kullanıcı anketi erken bitirir ve nakit para ödüllerinde dereceye girme şansını katlar.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(183, 243, 74, 0.2)', color: 'var(--brand-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>✓</div>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>İzlenebilir Defter (Score Ledger)</h4>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Kazanılan her puan şeffaf event defterine işlenir, sunucu doğrulamasıyla haksız kazanç engellenir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Push Simulator */}
              <div>
                <PushPrioritySimulator />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: ÖDÜLLER */}
        <section id="oduller" style={{ padding: '90px 0', borderTop: '1px solid var(--border-color)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 56px auto' }}>
              <div className="badge-lime">🎁 Ödül Ekosistemi</div>
              <h2 style={{ fontSize: '38px', fontWeight: '900', marginTop: '12px', color: 'white' }}>
                PAG'da Ne Kazanabilirsin?
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '16px' }}>
                Anket sahibinin kurgusuna göre tanımlanmış gerçek kazanç kategorileri.
              </p>
            </div>

            <div className="responsive-grid-3">
              <div className="glass-card" style={{ padding: '36px 28px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '48px' }}>💵</div>
                <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: 'white' }}>Nakit Para Ödülü (TL)</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Belirli firma anketlerinde ilk sıralarda doğru tamamlayan kullanıcılara derece bazlı veya eşit havuz nakit para aktarılır. Minimum eşiğe ulaştığında IBAN ile çekilebilir.
                </p>
              </div>

              <div className="glass-card" style={{ padding: '36px 28px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '48px' }}>🎟️</div>
                <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: 'white' }}>Hediye Çekleri (Voucher)</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Anlaşmalı markaların (Örn: Restoran, Teknoloji, Kahve zincirleri) indirim ve menü hediye çekleri doğrudan mobil cüzdanınıza dijital kod olarak tanımlanır.
                </p>
              </div>

              <div className="glass-card" style={{ padding: '36px 28px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '48px' }}>⭐</div>
                <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: 'white' }}>Profil Puanı</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Her anket katılımı Profil Puanınızı artırır. Puanınız yükseldikçe sonraki yüksek ödüllü kampanyaların bildirimini ilk alan elit grupta yer alırsınız.
                </p>
              </div>
            </div>

            <div style={{
              marginTop: '36px',
              padding: '18px 24px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '14px',
              border: '1px solid var(--border-color)',
              textAlign: 'center',
              fontSize: '13px',
              color: 'var(--text-muted)'
            }}>
              ℹ️ <strong>Önemli Bilgilendirme:</strong> Her ankette parasal ödül bulunması zorunlu değildir. Ödül havuzu ve türü anket sahibi marka veya PAG tarafından belirlenir.
            </div>
          </div>
        </section>

        {/* SECTION 5: UYGULAMAYI TANIYIN */}
        <section id="uygulamayi-taniyin" style={{ padding: '90px 0', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 48px auto' }}>
              <div className="badge-lime">📱 Mobil Deneyim</div>
              <h2 style={{ fontSize: '38px', fontWeight: '900', marginTop: '12px', color: 'white' }}>
                Mobil Uygulamayı Keşfet
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '16px' }}>
                Aşağıdaki interaktif cihaz simülatöründe sekmeleri değiştirerek akışı canlı inceleyin.
              </p>
            </div>

            <DeviceMockups />
          </div>
        </section>

        {/* SECTION 6: KURUMSAL BÖLÜM (ENTERPRISE SOLUTIONS) */}
        <section id="kurumsal" className="bg-corporate-mesh" style={{ padding: '100px 0', borderTop: '1px solid var(--border-color)' }}>
          <div className="container">
            
            {/* Corporate Header */}
            <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 60px auto' }}>
              <div className="badge-blue">🏢 Kurumsal & Marka Çözümleri</div>
              <h2 style={{ fontSize: '42px', fontWeight: '900', marginTop: '14px', color: 'white', lineHeight: '1.2' }}>
                Markanız İçin Doğru Hedef Kitleye <br />
                <span className="text-gradient-blue">Dakikalar İçinde Doğrudan Ulaşın</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '16px', fontSize: '18px', lineHeight: '1.6' }}>
                PAG, markaların hedeflediği mikro-segmentlere (yaş, il/ilçe/mahalle, medeni durum, çocuk) maksimum 3 soruluk hızlı anketlerle doğrudan ulaşmasını sağlayan kurumsal araştırma platformudur.
              </p>
            </div>

            {/* Interactive Audience Targeting Playground */}
            <div style={{ marginBottom: '64px' }}>
              <AudienceTargetingDemo />
            </div>

            {/* Enterprise Comparison: Geleneksel vs. PAG Kurumsal */}
            <div style={{ marginBottom: '64px' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>
                  Neden PAG Kurumsal?
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '6px' }}>
                  Geleneksel pazar araştırmaları ile yeni nesil PAG mobil mikro-anket farkı.
                </p>
              </div>

              <div className="responsive-grid-2">
                {/* Traditional */}
                <div className="glass-card" style={{ padding: '32px', opacity: 0.85 }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#F04438', marginBottom: '12px' }}>
                    ❌ Geleneksel Anket Şirketleri
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <li>• 40-50 soruluk yorucu formlar ve %80 yarıda bırakma oranı</li>
                    <li>• Günler süren yavaş veri toplama ve analitik gecikmeleri</li>
                    <li>• Sahte hesaplar, botlar ve manipüle edilmiş demografik veriler</li>
                    <li>• Mahalle/İlçe seviyesinde mikro-hedefleme yetersizliği</li>
                  </ul>
                </div>

                {/* PAG Enterprise */}
                <div className="glass-card" style={{ padding: '32px', border: '1px solid var(--brand-lime)' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--brand-lime)', marginBottom: '12px' }}>
                    ✅ PAG Kurumsal Mikro-Ekosistem
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', color: '#FFFFFF' }}>
                    <li>• <strong>Maksimum 3 soru</strong> ile %95+ tamamlanma oranı</li>
                    <li>• <strong>Kademeli push bildirimleri</strong> ile 15 dakikada anlık sonuçlar</li>
                    <li>• <strong>%100 doğrulanmış aktif cihazlar</strong> ve motivasyonu yüksek kitle</li>
                    <li>• <strong>İl, İlçe ve Mahalle</strong> kırılımında hassas AND/OR filtreleme</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Zero PII & Super Admin Security */}
            <div className="responsive-grid-2" style={{ marginBottom: '64px' }}>
              <div className="glass-card" style={{ padding: '32px' }}>
                <div className="badge-blue" style={{ marginBottom: '12px' }}>🔒 Sıfır PII Sızıntısı</div>
                <h4 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                  Tam Anonimlik & KVKK Güvencesi
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Kurumsal markalara bireysel kullanıcıların ad, telefon veya e-posta gibi kişisel verileri (PII) kesinlikle verilmez. Tüm veriler toplu istatistik (aggregate) ve anonim grafikler olarak sunulur.
                </p>
              </div>

              <div className="glass-card" style={{ padding: '32px' }}>
                <div className="badge-lime" style={{ marginBottom: '12px' }}>🛡️ Super Admin Onay Standardı</div>
                <h4 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                  Kalite ve Güvenlik Denetimi
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Kullanıcı deneyimini korumak adına tüm kurumsal anketler PAG Super Admin ekibi tarafından incelenir ve onaylandıktan sonra (APPROVED) yayına alınır.
                </p>
              </div>
            </div>

            {/* Final Corporate CTA Card */}
            <div className="glass-card-blue" style={{ padding: '48px 32px', textAlign: 'center', border: '1px solid var(--border-blue-highlight)' }}>
              <h3 style={{ fontSize: '32px', fontWeight: '900', color: 'white', marginBottom: '12px' }}>
                Markanız İçin Hemen Başvurun
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '640px', margin: '0 auto 32px auto', lineHeight: '1.6' }}>
                Kurumsal temsilcimiz başvuru formunuzu inceleyerek kurumsal e-postanız üzerinden sizinle iletişime geçecektir.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <Link href="/firma-basvuru" className="btn-lime" style={{ padding: '16px 36px', fontSize: '15px' }}>
                  🚀 Kurumsal Başvuru Formunu Doldur
                </Link>
                <a href="https://app.pagapp.com.tr" target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ padding: '16px 36px', fontSize: '15px' }}>
                  🏢 Kurumsal Portal Girişi →
                </a>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
