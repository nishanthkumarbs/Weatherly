import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';
import { PwaRegister } from '@/components/pwa/PwaRegister';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Weatherly - Advanced Hyperlocal Weather & Radar',
  description:
    'Real-time weather forecasting with OpenWeatherMap One Call 3.0, Tomorrow.io minute-by-minute nowcasting, air quality, pollen counts, and interactive meteorological radar.',
  manifest: '/manifest.json',
  keywords: [
    'weather',
    'radar',
    'nowcast',
    'air quality',
    'pollen',
    'OpenWeatherMap',
    'Tomorrow.io',
    'forecast',
  ],
  authors: [{ name: 'Weatherly Team' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">
        <PwaRegister />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
