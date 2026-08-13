'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
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
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            backgroundColor: 'rgba(183, 243, 74, 0.15)',
            border: '1px solid var(--brand-lime)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontWeight: '900', color: 'var(--brand-lime)', fontSize: '20px', letterSpacing: '-0.5px' }}>PAG</span>
          </div>
          <span style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.5px' }}>PAG</span>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="desktop-nav">
          <Link href="/#nedir" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}>
            PAG Nedir?
          </Link>
          <Link href="/#nasil-calisir" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}>
            Nasıl Çalışır?
          </Link>
          <Link href="/#oduller" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}>
            Ödüller
          </Link>
          <Link href="/firmalar" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, transition: 'color 0.2s' }}>
            Firmalar İçin
          </Link>
          <Link href="/iletisim" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}>
            İletişim
          </Link>
        </nav>

        {/* Action CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href="https://app.pagapp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            🏢 Firma Girişi
          </a>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer'
            }}
            className="mobile-toggle"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-color)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <Link href="/#nedir" onClick={() => setMobileOpen(false)} style={{ color: 'white', fontSize: '15px', fontWeight: 500 }}>
            PAG Nedir?
          </Link>
          <Link href="/#nasil-calisir" onClick={() => setMobileOpen(false)} style={{ color: 'white', fontSize: '15px', fontWeight: 500 }}>
            Nasıl Çalışır?
          </Link>
          <Link href="/#oduller" onClick={() => setMobileOpen(false)} style={{ color: 'white', fontSize: '15px', fontWeight: 500 }}>
            Ödüller
          </Link>
          <Link href="/firmalar" onClick={() => setMobileOpen(false)} style={{ color: 'var(--brand-lime)', fontSize: '15px', fontWeight: 600 }}>
            Firmalar İçin
          </Link>
          <Link href="/firma-basvuru" onClick={() => setMobileOpen(false)} style={{ color: 'white', fontSize: '15px', fontWeight: 500 }}>
            Firma Başvurusu
          </Link>
          <Link href="/iletisim" onClick={() => setMobileOpen(false)} style={{ color: 'white', fontSize: '15px', fontWeight: 500 }}>
            İletişim
          </Link>
        </div>
      )}
    </header>
  );
}
