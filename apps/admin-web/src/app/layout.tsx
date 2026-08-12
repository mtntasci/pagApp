import './globals.css';
import Link from 'next/link';
import React from 'react';

export const metadata = {
  title: 'PAG Admin Portal',
  description: 'Server-Authoritative PAG Management Console'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
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
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Yönetim Portalı</p>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/" style={{
                padding: '12px 16px',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 500,
                backgroundColor: 'rgba(255,255,255,0.05)'
              }}>
                📊 Dashboard
              </Link>
              <Link href="/surveys" style={{
                padding: '12px 16px',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 500
              }}>
                📝 Anket Yönetimi
              </Link>
              <Link href="/vouchers" style={{
                padding: '12px 16px',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 500
              }}>
                🎟️ Hediye Çekleri
              </Link>
              <Link href="/stories" style={{
                padding: '12px 16px',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 500
              }}>
                ⭐ Story Bar
              </Link>
            </nav>

            <div style={{ marginTop: 'auto', padding: '12px', borderTop: '1px solid var(--border-color)' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Masaüstü Yönetim v1.0</p>
            </div>
          </aside>

          {/* Main Content Area */}
          <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
