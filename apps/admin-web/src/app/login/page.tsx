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
        maxWidth: '420px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '40px 32px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        textAlign: 'center'
      }}>
        {/* Brand Logo & Title */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            backgroundColor: 'rgba(183, 243, 74, 0.1)',
            borderRadius: '16px',
            border: '1px solid var(--brand-lime)',
            marginBottom: '16px'
          }}>
            <span style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--brand-lime)' }}>PAG</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>PAG Portal</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>Kurumsal Portal Girişi</p>
        </div>

        {displayError && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(240, 68, 56, 0.15)',
            border: '1px solid var(--error-color)',
            color: 'var(--error-color)',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '13px',
            textAlign: 'left'
          }}>
            ⚠️ {displayError}
          </div>
        )}

        {infoMsg && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(183, 243, 74, 0.15)',
            border: '1px solid var(--brand-lime)',
            color: 'var(--brand-lime)',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '13px',
            textAlign: 'left'
          }}>
            ℹ️ {infoMsg}
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailPasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>E-posta Adresi</label>
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
                backgroundColor: 'var(--bg-surface-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Şifre</label>
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
                backgroundColor: 'var(--bg-surface-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'white',
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
              backgroundColor: 'var(--brand-lime)',
              color: '#011033',
              fontWeight: 'bold',
              fontSize: '14px',
              borderRadius: '10px',
              marginTop: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '13px',
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
                fontWeight: 600,
                color: 'var(--brand-lime)',
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
    <Suspense fallback={<div style={{ color: 'white', padding: '40px', textAlign: 'center' }}>Yükleniyor...</div>}>
      <LoginContent />
    </Suspense>
  );
}
