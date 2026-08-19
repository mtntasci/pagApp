'use client';

import './globals.css';
import Link from 'next/link';
import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

interface SubMenuItem {
  href: string;
  label: string;
  icon: string;
}

interface MenuGroup {
  key: string;
  title: string;
  icon: string;
  items: SubMenuItem[];
}

function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const { user, portalUser, isAdmin, isCallCenterAgent, isOrgUser, signOut } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Accordion Menus State: Kapalı başlar (default false), tıklayınca aşağı açılır
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    surveys: false,
    callcenter: false,
    companies: false,
    settings: false
  });

  const toggleGroup = (groupKey: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Menu Definition structured according to user specification
  const menuGroups: MenuGroup[] = [
    {
      key: 'surveys',
      title: 'Anket Yönetimi',
      icon: '📝',
      items: [
        { href: '/surveys', label: 'Anketler', icon: '📋' },
        { href: '/profile-surveys', label: 'Profil Anketleri', icon: '❓' },
        { href: '/verification-campaigns', label: 'Kalite Doğrulama', icon: '🛡️' },
        { href: '/verification-calls', label: 'Arama Portalı', icon: '📞' }
      ]
    },
    {
      key: 'callcenter',
      title: 'Çağrı Merkezi',
      icon: '📞',
      items: [
        { href: '/verification-calls', label: 'Arama Portalı', icon: '🎧' }
      ]
    },
    {
      key: 'companies',
      title: 'Firmalar',
      icon: '🏢',
      items: [
        { href: '/organizations', label: 'Firma Listesi', icon: '🏢' },
        { href: '/applications', label: 'Başvurular', icon: '📥' },
        { href: '/verification-campaigns', label: 'Kalite Doğrulama', icon: '🛡️' },
        { href: '/users', label: 'Kullanıcı Listesi', icon: '👥' },
        { href: '/roles', label: 'Yetki Yönetimi', icon: '🔐' }
      ]
    },
    {
      key: 'settings',
      title: 'Ayarlar',
      icon: '⚙️',
      items: [
        { href: '/categories', label: 'Kategori Yönetimi', icon: '🏷️' }
      ]
    }
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
            width: '270px',
            backgroundColor: 'var(--bg-surface)',
            borderRight: '1px solid var(--border-color)',
            padding: '20px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: 'var(--shadow-sm)',
            transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease-in-out',
            overflowY: 'auto'
          }}
        >
          {/* Brand Logo & Header (Sidebar top) */}
          <div style={{ padding: '4px 10px 12px 10px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src="/logo.png"
                alt="PAG Logo"
                style={{ height: '34px', width: 'auto', borderRadius: '8px', objectFit: 'contain' }}
              />
              <div>
                <h1 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--brand-navy)', letterSpacing: '-0.3px', margin: 0 }}>
                  PAG PORTAL
                </h1>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginTop: '2px', margin: 0 }}>
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
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* 1. Dashboard (Direct Top Link) */}
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                color: pathname === '/' ? 'var(--brand-navy)' : 'var(--text-secondary)',
                fontSize: '13.5px',
                fontWeight: pathname === '/' ? 800 : 600,
                backgroundColor: pathname === '/' ? 'var(--bg-surface-secondary)' : 'transparent',
                borderLeft: pathname === '/' ? '4px solid var(--brand-navy)' : '4px solid transparent',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ fontSize: '16px' }}>📊</span>
              <span>Dashboard</span>
            </Link>

            {/* 2. Accordion Group: Anket Yönetimi */}
            {menuGroups.map((group) => {
              const isOpen = !!openGroups[group.key];
              const hasActiveChild = group.items.some(item => pathname === item.href);

              return (
                <div key={group.key} style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Group Header Button (Accordion Trigger) */}
                  <button
                    onClick={() => toggleGroup(group.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: hasActiveChild && !isOpen ? 'rgba(57, 119, 246, 0.08)' : 'transparent',
                      color: hasActiveChild ? 'var(--brand-navy)' : 'var(--text-primary)',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '16px' }}>{group.icon}</span>
                      <span>{group.title}</span>
                    </div>
                    <span style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}>
                      ▼
                    </span>
                  </button>

                  {/* Collapsible Submenu Items */}
                  {isOpen && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                      paddingLeft: '18px',
                      marginTop: '4px',
                      marginBottom: '4px',
                      borderLeft: '2px solid var(--border-color)',
                      marginLeft: '14px'
                    }}>
                      {group.items.map((subItem) => {
                        const isSubActive = pathname === subItem.href;
                        return (
                          <Link
                            key={`${group.key}-${subItem.href}-${subItem.label}`}
                            href={subItem.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 10px',
                              borderRadius: '6px',
                              color: isSubActive ? 'var(--brand-navy)' : 'var(--text-secondary)',
                              fontSize: '12.5px',
                              fontWeight: isSubActive ? 800 : 500,
                              backgroundColor: isSubActive ? 'var(--bg-surface-secondary)' : 'transparent',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span style={{ fontSize: '14px' }}>{subItem.icon}</span>
                            <span>{subItem.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* 3. Story Bar (Direct Top Link) */}
            <Link
              href="/stories"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                color: pathname === '/stories' ? 'var(--brand-navy)' : 'var(--text-secondary)',
                fontSize: '13.5px',
                fontWeight: pathname === '/stories' ? 800 : 600,
                backgroundColor: pathname === '/stories' ? 'var(--bg-surface-secondary)' : 'transparent',
                borderLeft: pathname === '/stories' ? '4px solid var(--brand-navy)' : '4px solid transparent',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ fontSize: '16px' }}>⭐</span>
              <span>Story Bar</span>
            </Link>
          </nav>

          {/* Bottom User Controls */}
          <div style={{
            marginTop: 'auto',
            padding: '14px 10px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-navy)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '13px'
              }}>
                {(portalUser?.email || user?.email || 'U')[0].toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }}>
                  {portalUser?.email || user?.email}
                </p>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: portalUser?.role === 'SUPER_ADMIN' ? '#EF4444' : (portalUser?.role === 'CALL_CENTER_AGENT' ? '#10B981' : '#3977F6')
                }}>
                  {portalUser?.role === 'SUPER_ADMIN' ? '👑 Süper Admin' : (portalUser?.role === 'CALL_CENTER_AGENT' ? '📞 Çağrı Merkezi' : (portalUser?.role === 'ORGANIZATION_USER' ? '🏢 Firma Temsilcisi' : '🛡️ PAG Ekibi'))}
                </span>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: 'var(--bg-surface-secondary)',
                color: 'var(--error-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease'
              }}
            >
              🚪 Çıkış Yap
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main
          className="admin-main-content"
          style={{
            flex: 1,
            padding: '32px 36px',
            backgroundColor: 'var(--bg-primary)',
            minHeight: 'calc(100vh - 60px)',
            overflowX: 'hidden'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <title>PAG Admin & Portal Paneli</title>
        <meta name="description" content="PAG Platformu Yönetim ve Kalite Doğrulama Portalı" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <AuthProvider>
          <NavigationWrapper>{children}</NavigationWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
