import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PAG Mobile - Persona Analytics & Geotargeting",
  description: "Gerçek zamanlı lokasyon bazlı görevler ve ödüller.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased bg-[#030712] text-slate-100 min-h-screen selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
