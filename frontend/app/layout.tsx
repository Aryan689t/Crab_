import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { inter, jakarta } from './fonts';

export const metadata: Metadata = {
  title: {
    default: 'CRAB — Creator & Brand Collaboration',
    template: '%s | CRAB',
  },
  description:
    'CRAB connects creators and brands to discover, manage, and build meaningful collaborations.',
  icons: {
    icon: [
      { url: '/crab-logo.png', type: 'image/png' },
      { url: '/icon.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/crab-logo.png',
    apple: '/crab-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/crab-logo.png" />
        <link rel="shortcut icon" type="image/png" href="/crab-logo.png" />
        <link rel="apple-touch-icon" href="/crab-logo.png" />
      </head>
      <body className={`min-h-screen bg-background text-text-primary antialiased font-sans ${inter.variable} ${jakarta.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
