import './globals.css';
import React from 'react';

export const metadata = {
  title: 'PAG — Kurumsal & Bireysel Anket ve Profilleme Platformu',
  description: 'Markalar ve kullanıcılar arasında yüksek kalitede, hedeflenmiş ve ödüllü veri ekosistemi.'
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
