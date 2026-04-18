import type { Metadata, Viewport } from 'next';
import * as React from 'react';
import './globals.css';
import { TopBar } from '@/components/layout/TopBar';
import { UndoSnackbar } from '@/components/layout/UndoSnackbar';
import { ServiceWorkerRegister } from '@/components/layout/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'Crimson Ledger',
  description:
    'A lightweight tracker for Vampire: The Masquerade-style sessions — Hunger, Humanity, Health, Willpower, stains, and other temporary values.',
  applicationName: 'Crimson Ledger',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Crimson Ledger',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#0B0B0D',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-dvh bg-ink-0 text-bone antialiased">
        <TopBar />
        <main className="mx-auto w-full max-w-5xl px-4 py-5">{children}</main>
        <UndoSnackbar />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
