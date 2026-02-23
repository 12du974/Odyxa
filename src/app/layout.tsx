import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Odixa — Audit UI/UX Automatise',
  description: 'Plateforme SaaS d\'audit automatise UI/UX pour sites web et webapps par Odixa',
  icons: {
    icon: '/icon-odixa-black.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
