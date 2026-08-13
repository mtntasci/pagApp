'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Automatically close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const closeMenu = () => setMobileOpen(false);

  return (
    <>
      <header style={{
        backgroundColor: 'rgba(1, 16, 51, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '72px'
        }}>
          {/* Brand Logo */}
          <Link href="/" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/logo.png"
              alt="PAG Logo"
              style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'contain' }}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }} className="desktop-nav">
            <Link href="/#nedir" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}>
              PAG Nedir?
            </Link>
            <Link href="/#nasil-calisir" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}>
              Nasıl Çalışır?
            </Link>
            <Link href="/#oduller" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}>
              Ödüller
            </Link>
            <Link
              href="/firmalar"
              style={{
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                padding: '6px 14px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              Kurumsal
            </Link>
            <Link href="/iletisim" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}>
              İletişim
            </Link>
          </nav>

          {/* Action CTAs & Mobile Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a
              href="https://app.pagapp.com.tr"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline mobile-hide-btn"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              🏢 Kurumsal Giriş
            </a>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menü"
              style={{
                display: 'none',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '22px',
                width: '42px',
                height: '42px',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              className="mobile-toggle"
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Navigation */}
        {mobileOpen && (
          <div style={{
            position: 'absolute',
            top: '72px',
            left: 0,
            right: 0,
            backgroundColor: '#011033',
            borderBottom: '1px solid var(--border-color)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            zIndex: 99
          }}>
            <Link href="/#nedir" onClick={closeMenu} style={{ color: 'white', fontSize: '16px', fontWeight: 600, padding: '8px 0' }}>
              PAG Nedir?
            </Link>
            <Link href="/#nasil-calisir" onClick={closeMenu} style={{ color: 'white', fontSize: '16px', fontWeight: 600, padding: '8px 0' }}>
              Nasıl Çalışır?
            </Link>
            <Link href="/#oduller" onClick={closeMenu} style={{ color: 'white', fontSize: '16px', fontWeight: 600, padding: '8px 0' }}>
              Ödüller
            </Link>
            <Link href="/firmalar" onClick={closeMenu} style={{ color: 'var(--brand-lime)', fontSize: '16px', fontWeight: 700, padding: '8px 0' }}>
              Kurumsal Çözümler
            </Link>
            <Link href="/firma-basvuru" onClick={closeMenu} style={{ color: 'white', fontSize: '16px', fontWeight: 600, padding: '8px 0' }}>
              Kurumsal Başvuru
            </Link>
            <Link href="/iletisim" onClick={closeMenu} style={{ color: 'white', fontSize: '16px', fontWeight: 600, padding: '8px 0' }}>
              İletişim
            </Link>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '8px' }}>
              <a
                href="https://app.pagapp.com.tr"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className="btn-lime"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                🏢 Kurumsal Portal Girişi
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Backdrop overlay to close menu when tapping outside */}
      {mobileOpen && (
        <div
          onClick={closeMenu}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 98
          }}
        />
      )}
    </>
  );
}
