import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PAG Portal - Brand & Admin Dashboard",
  description: "Persona Analytics & Geotargeting Marka Kontrol Paneli.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased bg-[#02040a] text-slate-100 min-h-screen selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
