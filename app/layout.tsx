// app/layout.tsx — MediForm Haiti
// ⚠️ SPÉCIFIQUE À MEDIFORM HAITI

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { TenantProvider } from '@/lib/tenantContext';
import Navbar from '@/components/layout/Navbar';
import InitAuth from '@/components/layout/InitAuth';
import Chatbot from '@/components/chatbot/Chatbot';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MediForm Haiti — Formation Médicale & Paramédicale',
  description: 'La plateforme de formation professionnelle pour les infirmiers, aides-soignants et professionnels de santé haïtiens. Protocoles OMS, MSPP, simulations cliniques.',
  keywords: 'formation infirmière Haïti, soins infirmiers, protocoles médicaux MSPP, OIIH, formation paramédicale',
  openGraph: {
    title: 'MediForm Haiti — Formation Médicale',
    description: 'Formation professionnelle pour les soignants haïtiens',
    siteName: 'MediForm Haiti',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#1B6B45" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <TenantProvider>
          <InitAuth />
          <Navbar />
          <main style={{ minHeight: '100vh', background: '#F8FAFB', overflowX: 'hidden' }}>
            {children}
          </main>
          <Chatbot />
          <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#1B6B45', color: 'white', fontFamily: "'Inter',sans-serif", fontSize: '13px', borderRadius: '10px' } }} />
        </TenantProvider>
      </body>
    </html>
  );
}
