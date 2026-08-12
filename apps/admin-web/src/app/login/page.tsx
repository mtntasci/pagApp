'use client';

import React, { useState, Suspense } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, appleProvider } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginContent() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const isUnauthorizedQuery = searchParams.get('error') === 'unauthorized';

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const email = (res.user.email || '').toLowerCase();

      if (email === 'mtntasci@gmail.com') {
        router.push('/');
      } else {
        await signOut(auth);
        setErrorMsg('Erişim Reddedildi: Yalnızca yetkili yönetici hesapları (mtntasci@gmail.com) giriş yapabilir.');
      }
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setErrorMsg('Giriş yapılırken bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await signInWithPopup(auth, appleProvider);
      // Phase 1 rule: Apple login does not grant admin access in V1
      await signOut(auth);
      setErrorMsg('Erişim Reddedildi: V1 versiyonunda Apple ile yetkili yönetici girişi yapılamaz. Lütfen Google hesabı kullanın.');
    } catch (err: any) {
      console.error('Apple Sign In Error:', err);
      setErrorMsg('Apple ile giriş yapılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Admin Yönetim Portalı</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>Güvenli Yönetici Girişi (V1)</p>
        </div>

        {(errorMsg || isUnauthorizedQuery) && (
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
            ⚠️ {errorMsg || 'Erişim Reddedildi: Bu hesaba admin yetkisi verilmemiştir.'}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 20px',
              backgroundColor: '#FFFFFF',
              color: '#000000',
              fontWeight: 600,
              fontSize: '14px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Google ile Giriş Yap
          </button>

          <button
            onClick={handleAppleLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 20px',
              backgroundColor: '#1E293B',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '14px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              border: '1px solid var(--border-color)',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
          >
             Apple ile Giriş Yap
          </button>
        </div>

        <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Yetkili Admin: <span style={{ color: 'var(--brand-lime)', fontFamily: 'monospace' }}>mtntasci@gmail.com</span>
          </p>
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
