'use client';

import './globals.css';
import Link from 'next/link';
import React from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';

function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, signOut } = useAuth();
  const pathname = usePathname();

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-color)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <div style={{ padding: '0 12px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--brand-lime)' }}>PAG ADMIN</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Yönetim Portalı V1</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link href="/" style={{
            padding: '12px 16px',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: 500,
            backgroundColor: pathname === '/' ? 'rgba(183, 243, 74, 0.15)' : 'transparent',
            borderLeft: pathname === '/' ? '4px solid var(--brand-lime)' : 'none'
          }}>
            📊 Dashboard
          </Link>
          <Link href="/surveys" style={{
            padding: '12px 16px',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: 500,
            backgroundColor: pathname === '/surveys' ? 'rgba(183, 243, 74, 0.15)' : 'transparent',
            borderLeft: pathname === '/surveys' ? '4px solid var(--brand-lime)' : 'none'
          }}>
            📝 Anket Yönetimi
          </Link>
          <Link href="/vouchers" style={{
            padding: '12px 16px',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: 500,
            backgroundColor: pathname === '/vouchers' ? 'rgba(183, 243, 74, 0.15)' : 'transparent',
            borderLeft: pathname === '/vouchers' ? '4px solid var(--brand-lime)' : 'none'
          }}>
            🎟️ Hediye Çekleri
          </Link>
          <Link href="/stories" style={{
            padding: '12px 16px',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: 500,
            backgroundColor: pathname === '/stories' ? 'rgba(183, 243, 74, 0.15)' : 'transparent',
            borderLeft: pathname === '/stories' ? '4px solid var(--brand-lime)' : 'none'
          }}>
            ⭐ Story Bar
          </Link>
        </nav>

        <div style={{ marginTop: 'auto', padding: '16px 12px', borderTop: '1px solid var(--border-color)' }}>
          {user && isAdmin && (
            <div style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Yönetici Hesabı</p>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                {user.email}
              </p>
            </div>
          )}
          <button
            onClick={() => signOut()}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: 'rgba(240, 68, 56, 0.1)',
              color: 'var(--error-color)',
              border: '1px solid var(--error-color)',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            🚪 Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <AuthProvider>
          <NavigationWrapper>{children}</NavigationWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
