'use client';

import React, { useState, Suspense } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { authError, clearAuthError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isUnauthorizedQuery = searchParams.get('error') === 'unauthorized';

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Lütfen e-posta adresi ve şifrenizi giriniz.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);
    clearAuthError();

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push('/');
    } catch (err: any) {
      console.error('Portal Sign In Error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('E-posta adresi veya şifre hatalı.');
      } else {
        setErrorMsg('Giriş yapılırken bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email || !email.includes('@')) {
      setErrorMsg('Lütfen önce geçerli e-posta adresinizi yukarıdaki alana yazınız.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfoMsg('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
    } catch (err: any) {
      console.error('Password Reset Error:', err);
      setErrorMsg('Şifre sıfırlama e-postası gönderilemedi: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  const displayError = errorMsg || authError || (isUnauthorizedQuery ? 'Bu hesap için PAG Portal erişimi bulunmuyor.' : null);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '40px 36px',
        boxShadow: 'var(--shadow-lg)',
        textAlign: 'center'
      }}>
        {/* Brand Logo & Title */}
        <div style={{ marginBottom: '32px' }}>
          <img
            src="/logo.png"
            alt="PAG Logo"
            style={{ height: '52px', width: 'auto', marginBottom: '16px', borderRadius: '10px' }}
          />
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            PAG Portal
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '6px', fontWeight: 500 }}>
            Kurumsal Yönetim Portalı Girişi
          </p>
        </div>

        {displayError && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'var(--error-bg)',
            border: '1px solid var(--error-border)',
            color: 'var(--error-color)',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '13px',
            textAlign: 'left',
            fontWeight: 500
          }}>
            ⚠️ {displayError}
          </div>
        )}

        {infoMsg && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'var(--success-bg)',
            border: '1px solid var(--success-border)',
            color: 'var(--success-color)',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '13px',
            textAlign: 'left',
            fontWeight: 500
          }}>
            ℹ️ {infoMsg}
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailPasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'left' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              E-posta Adresi
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@kurum.com"
              required
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '6px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-highlight)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '6px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-highlight)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 20px',
              backgroundColor: 'var(--brand-navy)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '14px',
              borderRadius: '8px',
              marginTop: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Şifremi Unuttum
          </button>

          <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Kurumsal hesabınız yok mu?
            </p>
            <a
              href="https://www.pagapp.com.tr/firma-basvuru"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--brand-navy)',
                textDecoration: 'none'
              }}
            >
              Kurumsal Başvuru Yap →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ color: 'var(--text-primary)', padding: '40px', textAlign: 'center' }}>Yükleniyor...</div>}>
      <LoginContent />
    </Suspense>
  );
}
