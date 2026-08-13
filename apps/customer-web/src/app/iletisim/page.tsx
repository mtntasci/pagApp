'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function IletisimPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, padding: '60px 0 80px 0' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div className="badge-lime">İletişim & Genel Merkez</div>
            <h1 style={{ fontSize: '36px', fontWeight: '900', marginTop: '12px', color: 'white' }}>
              Bizimle İletişime Geçin
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '15px' }}>
              PAG ve Alaf Teknoloji A.Ş. ile ilgili sorularınız, önerileriniz ve iş ortaklığı talepleriniz için ulaşabilirsiniz.
            </p>
          </div>

          <div className="responsive-grid-2">
            {/* Company Info Box */}
            <div className="glass-card" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--brand-lime)' }}>
                Alaf Teknoloji A.Ş.
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                PAG mobil uygulaması ve web portalı Alaf Teknoloji A.Ş. tarafı ürün ve tescilli markasıdır.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '20px', fontSize: '14px' }}>
                <div>
                  <strong style={{ color: 'white', display: 'block' }}>🏢 Genel Merkez Adresi:</strong>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Yakacık Çarşı Mah. Panorama Sok. No: 26 <br />
                    Kartal / İstanbul, 34876, Türkiye
                  </p>
                </div>

                <div>
                  <strong style={{ color: 'white', display: 'block' }}>✉️ E-posta:</strong>
                  <p style={{ color: 'var(--brand-lime)', fontFamily: 'monospace', marginTop: '4px' }}>
                    info@alafteknoloji.com
                  </p>
                </div>

                <div>
                  <strong style={{ color: 'white', display: 'block' }}>🌐 Web Sitesi:</strong>
                  <p style={{ color: 'var(--brand-lime)', fontFamily: 'monospace', marginTop: '4px' }}>
                    alafteknoloji.com
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Inquiry Form */}
            <div className="glass-card" style={{ padding: '36px' }}>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--brand-lime)', marginBottom: '8px' }}>
                    Mesajınız Alındı
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    İletişim talebiniz ekibimize iletilmiştir. En kısa sürede e-posta adresiniz üzerinden dönülecektir.
                  </p>
                  <button onClick={() => setSubmitted(false)} className="btn-outline" style={{ marginTop: '20px' }}>
                    Yeni Mesaj Gönder
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                    İletişim Formu
                  </h3>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Adınız Soyadınız *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ahmet Yılmaz"
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: 'var(--bg-surface-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      E-posta Adresiniz *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ornek@domain.com"
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: 'var(--bg-surface-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Konu
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Genel Bilgi / Öneri / Destek"
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: 'var(--bg-surface-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Mesajınız *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Mesajınızı yazınız..."
                      rows={4}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: 'var(--bg-surface-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '14px',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <button type="submit" className="btn-lime" style={{ width: '100%', padding: '14px', marginTop: '4px' }}>
                    Mesajı Gönder →
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
