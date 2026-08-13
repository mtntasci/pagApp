import './globals.css';
import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.pagapp.com.tr'),
  title: 'PAG — Kurumsal & Bireysel Anket ve Profilleme Platformu',
  description: 'Markalar ve kullanıcılar arasında yüksek kalitede, hedeflenmiş ve ödüllü veri ekosistemi.',
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
      <body>{children}</body>
    </html>
  );
}
