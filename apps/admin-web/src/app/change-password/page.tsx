'use client';

import React, { useState } from 'react';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
  const { user, portalUser, refreshPortalUser } = useAuth();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isForced = portalUser?.mustChangePassword === true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user || !user.email) {
      setErrorMsg('Oturum açmış bir kullanıcı bulunamadı.');
      return;
    }

    if (!currentPassword) {
      setErrorMsg('Lütfen mevcut şifrenizi giriniz.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('Yeni şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Yeni şifre ve şifre tekrarı eşleşmiyor.');
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMsg('Yeni şifreniz mevcut şifrenizle aynı olamaz.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Re-authenticate user with Firebase Auth
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // 2. Update Firebase Auth Password
      await updatePassword(user, newPassword);

      // 3. Mark mustChangePassword = false in backend Firestore
      const completeChangeFn = httpsCallable(functions, 'completePasswordChangePortalUser');
      await completeChangeFn({});

      // 4. Refresh auth context portalUser state
      await refreshPortalUser();

      // 5. Redirect to Dashboard
      router.push('/');
    } catch (err: any) {
      console.error('Change Password Error:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Mevcut şifreniz hatalı.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Yeni şifreniz çok zayıf. Lütfen daha güçlü bir şifre seçin.');
      } else if (err.code === 'auth/requires-recent-login') {
        setErrorMsg('Güvenlik nedeniyle tekrar giriş yapmanız gerekmektedir.');
      } else {
        setErrorMsg('Şifre değiştirilirken bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
      }
    } finally {
      setIsSubmitting(false);
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
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            backgroundColor: 'rgba(183, 243, 74, 0.1)',
            borderRadius: '16px',
            border: '1px solid var(--brand-lime)',
            marginBottom: '16px'
          }}>
            <span style={{ fontSize: '24px' }}>🔒</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: 'white' }}>
            {isForced ? 'Şifrenizi Değiştirin' : 'Hesap Şifresini Değiştir'}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>
            {isForced
              ? 'İlk girişiniz sebebiyle hesabınızın güvenliği için lütfen yeni bir şifre belirleyin.'
              : 'Güvenliğiniz için mevcut şifrenizi ve yeni şifrenizi giriniz.'}
          </p>
        </div>

        {isForced && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid #F59E0B',
            color: '#F59E0B',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '13px'
          }}>
            ⚠️ İlk girişiniz için şifrenizi değiştirmeniz zorunludur.
          </div>
        )}

        {errorMsg && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(240, 68, 56, 0.15)',
            border: '1px solid var(--error-color)',
            color: 'var(--error-color)',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '13px'
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Mevcut Şifre / Geçici Şifre *
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
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
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Yeni Şifre *
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="En az 6 karakter"
              required
              minLength={6}
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
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Yeni Şifre Tekrar *
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Yeni şifrenizi tekrar giriniz"
              required
              minLength={6}
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

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: 'var(--brand-lime)',
              color: '#011033',
              fontWeight: 'bold',
              fontSize: '14px',
              borderRadius: '10px',
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
              marginTop: '8px'
            }}
          >
            {isSubmitting ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
          </button>
        </form>
      </div>
    </div>
  );
}
