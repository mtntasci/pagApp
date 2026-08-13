'use client';

import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

export default function MarketingPage() {
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

  const handleSubmitApplication = async (e: React.FormEvent) => {
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

  const scrollToForm = () => {
    const el = document.getElementById('company-apply');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'rgba(1, 16, 51, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 40px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(183, 243, 74, 0.15)',
            border: '1px solid var(--brand-lime)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontWeight: 'bold', color: 'var(--brand-lime)', fontSize: '18px' }}>PAG</span>
          </div>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>PAG</span>
        </div>

        {/* Business CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a
            href="https://app.pagapp.com"
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
          >
            🏢 Firma Girişi
          </a>

          <button
            onClick={scrollToForm}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              backgroundColor: 'var(--brand-lime)',
              color: '#011033',
              fontSize: '14px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🚀 PAG ile Çalışmak İstiyorum
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '80px 40px',
        maxWidth: '1100px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-block',
          padding: '6px 16px',
          backgroundColor: 'rgba(183, 243, 74, 0.1)',
          border: '1px solid var(--brand-lime)',
          borderRadius: '20px',
          color: 'var(--brand-lime)',
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '24px'
        }}>
          PAG Kurumsal Anket & Profilleme Ekosistemi
        </div>
        <h1 style={{ fontSize: '48px', fontWeight: '800', lineHeight: 1.2, marginBottom: '24px' }}>
          Doğru Hedef Kitleye, Tam Zamanında Ve <br />
          <span style={{ color: 'var(--brand-lime)' }}>Yüksek Verimle</span> Ulaşın
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '750px', margin: '0 auto 40px auto' }}>
          PAG, markalarınız için gerçek zamanlı, mikro-profilleme odaklı ve yüksek yanıt oranına sahip anket ve pazar araştırması platformudur.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <button
            onClick={scrollToForm}
            style={{
              padding: '16px 32px',
              backgroundColor: 'var(--brand-lime)',
              color: '#011033',
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Firma Başvurusu Yap
          </button>
          <a
            href="https://app.pagapp.com"
            style={{
              padding: '16px 32px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: '10px'
            }}
          >
            Kurumsal Portal Girişi
          </a>
        </div>
      </section>

      {/* Company Application Form Section */}
      <section id="company-apply" style={{
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-color)',
        padding: '80px 40px'
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>PAG ile Çalışmak İstiyorum</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '15px' }}>
              Kurumunuz için özel anket ve pazar araştırması kampanyası başlatmak üzere başvuruda bulunun. Ekibimiz sizinle en kısa sürede iletişime geçecektir.
            </p>
          </div>

          {submitSuccess ? (
            <div style={{
              padding: '32px',
              backgroundColor: 'rgba(183, 243, 74, 0.1)',
              border: '1px solid var(--brand-lime)',
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>✅</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--brand-lime)', marginBottom: '8px' }}>
                Firma Başvurunuz Başarıyla Alındı
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Talebinizi aldık. İnceleme sonrasında kurumsal e-posta adresiniz üzerinden sizinle iletişime geçeceğiz.
              </p>
              <button
                onClick={() => setSubmitSuccess(false)}
                style={{
                  marginTop: '24px',
                  padding: '10px 24px',
                  backgroundColor: 'var(--bg-surface-secondary)',
                  color: 'white',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Yeni Başvuru Yap
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitApplication} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                    padding: '12px 16px',
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
                    padding: '12px 16px',
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
                      padding: '12px 16px',
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
                      padding: '12px 16px',
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
                    padding: '12px 16px',
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
                  placeholder="Hangi alanda anket / araştırma yapmak istediğinizi belirtebilirsiniz..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
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
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: 'var(--brand-lime)',
                  color: '#011033',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  marginTop: '8px'
                }}
              >
                {isSubmitting ? 'Başvuru Gönderiliyor...' : 'Firma Başvurusunu Gönder'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-color)',
        padding: '32px 40px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '13px'
      }}>
        © 2026 PAG. Tüm hakları saklıdır.
      </footer>
    </div>
  );
}
