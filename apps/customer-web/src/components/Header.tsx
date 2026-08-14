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
        backgroundColor: 'rgba(1, 12, 38, 0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '76px'
        }}>
          {/* Brand Logo & Tag */}
          <Link href="/" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #B7F34A 0%, #3977F6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '20px',
              color: '#010C26',
              boxShadow: '0 0 16px rgba(183, 243, 74, 0.35)'
            }}>
              P
            </div>
            <div>
              <span style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px', color: 'white' }}>
                PAG<span style={{ color: 'var(--brand-lime)' }}>.</span>
              </span>
              <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginTop: '-3px' }}>
                Mobil & Kurumsal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }} className="desktop-nav">
            <Link href="/#nasil-calisir" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, transition: 'color 0.2s' }}>
              Nasıl Çalışır?
            </Link>
            <Link href="/#simulasyon" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, transition: 'color 0.2s' }}>
              Canlı Simülatör
            </Link>
            <Link href="/#oduller" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, transition: 'color 0.2s' }}>
              Ödül Dünyası
            </Link>
            <Link href="/#kurumsal" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, transition: 'color 0.2s' }}>
              Kurumsal Kitle
            </Link>
            <Link
              href="/firmalar"
              style={{
                color: '#60A5FA',
                fontSize: '13px',
                fontWeight: 700,
                padding: '6px 14px',
                backgroundColor: 'rgba(57, 119, 246, 0.12)',
                border: '1px solid rgba(57, 119, 246, 0.3)',
                borderRadius: '10px',
                transition: 'all 0.2s ease'
              }}
            >
              🏢 Kurumsal Çözümler
            </Link>
          </nav>

          {/* Action CTAs & Mobile Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              href="/firma-basvuru"
              className="btn-lime mobile-hide-btn"
              style={{ padding: '10px 18px', fontSize: '13px' }}
            >
              Kurumsal Başvuru
            </Link>

            <a
              href="https://app.pagapp.com.tr"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline mobile-hide-btn"
              style={{ padding: '10px 18px', fontSize: '13px' }}
            >
              Portal Girişi →
            </a>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menü"
              style={{
                display: 'none',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
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
            top: '76px',
            left: 0,
            right: 0,
            backgroundColor: '#010C26',
            borderBottom: '1px solid var(--border-color)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
            zIndex: 99
          }}>
            <Link href="/#nasil-calisir" onClick={closeMenu} style={{ color: 'white', fontSize: '16px', fontWeight: 600, padding: '6px 0' }}>
              Nasıl Çalışır?
            </Link>
            <Link href="/#simulasyon" onClick={closeMenu} style={{ color: 'white', fontSize: '16px', fontWeight: 600, padding: '6px 0' }}>
              Canlı Simülatör
            </Link>
            <Link href="/#oduller" onClick={closeMenu} style={{ color: 'white', fontSize: '16px', fontWeight: 600, padding: '6px 0' }}>
              Ödül Dünyası
            </Link>
            <Link href="/#kurumsal" onClick={closeMenu} style={{ color: 'white', fontSize: '16px', fontWeight: 600, padding: '6px 0' }}>
              Kurumsal Kitle
            </Link>
            <Link href="/firmalar" onClick={closeMenu} style={{ color: 'var(--brand-lime)', fontSize: '16px', fontWeight: 700, padding: '6px 0' }}>
              🏢 Kurumsal Çözümler
            </Link>
            <Link href="/firma-basvuru" onClick={closeMenu} style={{ color: 'white', fontSize: '16px', fontWeight: 600, padding: '6px 0' }}>
              Kurumsal Başvuru
            </Link>
            <Link href="/iletisim" onClick={closeMenu} style={{ color: 'white', fontSize: '16px', fontWeight: 600, padding: '6px 0' }}>
              İletişim
            </Link>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link href="/firma-basvuru" onClick={closeMenu} className="btn-lime" style={{ justifyContent: 'center' }}>
                🚀 Kurumsal Başvuru Yap
              </Link>
              <a
                href="https://app.pagapp.com.tr"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className="btn-outline"
                style={{ justifyContent: 'center' }}
              >
                🏢 Portal Girişi
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
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 98
          }}
        />
      )}
    </>
  );
}
