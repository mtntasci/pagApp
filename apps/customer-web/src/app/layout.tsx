import './globals.css';
import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.pagapp.com.tr'),
  title: 'PAG — Kurumsal & Bireysel Anket ve Profilleme Platformu',
  description: 'Markalar ve kullanıcılar arasında yüksek kalitede, hedeflenmiş ve ödüllü veri ekosistemi.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' }
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  alternates: {
    canonical: 'https://www.pagapp.com.tr'
  },
  openGraph: {
    title: 'PAG — Kurumsal & Bireysel Anket ve Profilleme Platformu',
    description: 'Markalar ve kullanıcılar arasında yüksek kalitede, hedeflenmiş ve ödüllü veri ekosistemi.',
    url: 'https://www.pagapp.com.tr',
    siteName: 'PAG',
    locale: 'tr_TR',
    type: 'website'
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/icon.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180" />
      </head>
      <body>{children}</body>
    </html>
  );
}
