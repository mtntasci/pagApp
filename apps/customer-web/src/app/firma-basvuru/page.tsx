'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

export default function FirmaBasvuruPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.companyName.trim() || !formData.contactName.trim() || !formData.contactEmail.trim() || !formData.contactPhone.trim()) {
      setErrorMsg('Lütfen zorunlu alanları doldurunuz.');
      return;
    }

    setIsSubmitting(true);

    try {
      const submitFn = httpsCallable(functions, 'submitCompanyApplication');
      const res: any = await submitFn({
        companyName: formData.companyName,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        website: formData.website,
        message: formData.message
      });

      if (res.data?.success) {
        setSubmitSuccess(true);
        setFormData({
          companyName: '',
          contactName: '',
          contactEmail: '',
          contactPhone: '',
          website: '',
          message: ''
        });
      }
    } catch (err: any) {
      console.error('Company Application Error:', err);
      setErrorMsg('Başvuru gönderilirken bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, padding: '60px 0 80px 0' }}>
        <div className="container" style={{ maxWidth: '680px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div className="badge-lime">🏢 Kurumsal İletişim & Başvuru</div>
            <h1 style={{ fontSize: '36px', fontWeight: '900', marginTop: '12px', color: 'white' }}>
              Firma Başvuru Formu
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '15px', lineHeight: '1.6' }}>
              PAG platformunda markanız için özel anket ve pazar araştırması kurgulamak üzere başvuruda bulunun. Talebiniz incelenerek kurumsal e-postanız üzerinden dönülecektir.
            </p>
          </div>

          {submitSuccess ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', border: '1px solid var(--brand-lime)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--brand-lime)', marginBottom: '8px' }}>
                Başvurunuz Alındı
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6' }}>
                Firma başvurunuz backend sistemimize başarıyla kaydedilmiştir. İnceleme sonrası yetkili e-posta adresiniz üzerinden tarafınıza bilgilendirme yapılacaktır.
              </p>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="btn-outline"
                style={{ marginTop: '24px' }}
              >
                Yeni Başvuru Formu
              </button>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '40px' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {errorMsg && (
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(240, 68, 56, 0.15)',
                    border: '1px solid var(--error-color)',
                    color: 'var(--error-color)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}>
                    ⚠️ {errorMsg}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Firma / Kurum Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Örn: Ford Otosan A.Ş."
                    required
                    style={{
                      width: '100%',
                      padding: '14px',
                      backgroundColor: 'var(--bg-surface-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Yetkili Ad Soyad *
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="Örn: Ahmet Yılmaz"
                    required
                    style={{
                      width: '100%',
                      padding: '14px',
                      backgroundColor: 'var(--bg-surface-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Kurumsal E-posta *
                    </label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      placeholder="ahmet@kurum.com"
                      required
                      style={{
                        width: '100%',
                        padding: '14px',
                        backgroundColor: 'var(--bg-surface-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Telefon Numarası *
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="+90 5xx xxx xx xx"
                      required
                      style={{
                        width: '100%',
                        padding: '14px',
                        backgroundColor: 'var(--bg-surface-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Web Sitesi (Opsiyonel)
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://kurum.com"
                    style={{
                      width: '100%',
                      padding: '14px',
                      backgroundColor: 'var(--bg-surface-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Kısa Mesaj / Talep (Opsiyonel)
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Hangi marka / ürün için anket kurgulamak istediğinizi belirtebilirsiniz..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '14px',
                      backgroundColor: 'var(--bg-surface-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-lime"
                  style={{ width: '100%', padding: '16px', marginTop: '8px' }}
                >
                  {isSubmitting ? 'Başvuru Gönderiliyor...' : 'Firma Başvurusunu Gönder →'}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
