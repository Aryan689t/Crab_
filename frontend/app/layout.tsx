import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { inter, jakarta } from './fonts';

export const metadata: Metadata = {
  title: 'CRAB — Creators Reaching Aligned Brands',
  description: 'AI-Powered Two-Sided Creator-Brand Opportunity Engine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
      </head>
      <body className={`min-h-screen bg-background text-text-primary antialiased font-sans ${inter.variable} ${jakarta.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
