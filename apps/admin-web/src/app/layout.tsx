'use client';

import './globals.css';
import Link from 'next/link';
import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, signOut } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (pathname === '/login') {
    return <>{children}</>;
  }

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/surveys', label: 'Anket Yönetimi', icon: '📝' },
    { href: '/profile-surveys', label: 'Profil Anketleri', icon: '❓' },
    { href: '/vouchers', label: 'Hediye Çekleri', icon: '🎟️' },
    { href: '/stories', label: 'Story Bar', icon: '⭐' },
    { href: '/applications', label: 'Firma Başvuruları', icon: '🏢' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Mobile Header Bar */}
      <header className="mobile-only" style={{
        height: '60px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 16px',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menü"
            style={{
              padding: '8px 12px',
              backgroundColor: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-highlight)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '18px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ☰
          </button>
          <img
            src="/logo.png"
            alt="PAG Logo"
            style={{ height: '32px', width: 'auto', borderRadius: '6px' }}
          />
          <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--brand-navy)' }}>
            PAG PORTAL
          </span>
        </div>

        {user && (
          <button
            onClick={() => signOut()}
            style={{
              padding: '6px 10px',
              backgroundColor: 'var(--error-bg)',
              color: 'var(--error-color)',
              border: '1px solid var(--error-border)',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700
            }}
          >
            🚪 Çıkış
          </button>
        )}
      </header>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="mobile-only"
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(2px)',
            zIndex: 1500
          }}
        />
      )}

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Sidebar (Desktop Static & Mobile Overlay Drawer) */}
        <aside
          className="admin-sidebar"
          style={{
            width: '260px',
            backgroundColor: 'var(--bg-surface)',
            borderRight: '1px solid var(--border-color)',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            boxShadow: 'var(--shadow-sm)',
            transform: isMobileMenuOpen ? 'translateX(0)' : undefined,
            transition: 'transform 0.3s ease-in-out'
          }}
        >
          {/* Brand Logo & Header (Sidebar top) */}
          <div style={{ padding: '4px 12px 12px 12px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src="/logo.png"
                alt="PAG Logo"
                style={{ height: '36px', width: 'auto', borderRadius: '8px', objectFit: 'contain' }}
              />
              <div>
                <h1 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--brand-navy)', letterSpacing: '-0.3px', margin: 0 }}>
                  PAG PORTAL
                </h1>
                <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)', marginTop: '2px' }}>
                  Kurumsal Yönetim
                </p>
              </div>
            </div>

            <button
              className="mobile-only"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ background: 'none', fontSize: '18px', color: 'var(--text-muted)', minHeight: 'auto', padding: '4px' }}
            >
              ✕
            </button>
          </div>

          {/* Navigation Menu */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    color: isActive ? 'var(--brand-navy)' : 'var(--text-secondary)',
                    fontSize: '14px',
                    fontWeight: isActive ? 700 : 500,
                    backgroundColor: isActive ? 'var(--bg-surface-secondary)' : 'transparent',
                    borderLeft: isActive ? '4px solid var(--brand-navy)' : '4px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom User Controls */}
          <div style={{
            marginTop: 'auto',
            padding: '16px 12px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '12px'
          }}>
            {user && isAdmin && (
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Yönetici Hesabı
                </p>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', wordBreak: 'break-all', marginTop: '2px' }}>
                  {user.email}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <Link
                href="/change-password"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-highlight)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  textAlign: 'center',
                  display: 'inline-block'
                }}
              >
                🔒 Şifre
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  signOut();
                }}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  backgroundColor: 'var(--error-bg)',
                  color: 'var(--error-color)',
                  border: '1px solid var(--error-border)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                🚪 Çıkış
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="admin-main-content" style={{ flex: 1, padding: '32px 40px', overflowY: 'auto', width: '100%', minWidth: 0 }}>
          {children}
        </main>
      </div>
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
      <head>
        <title>PAG Portal — Kurumsal Yönetim</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="description" content="PAG Kurumsal Yönetim Portalı" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/icon.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180" />
      </head>
      <body>
        <AuthProvider>
          <NavigationWrapper>{children}</NavigationWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
