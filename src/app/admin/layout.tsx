import type { ReactNode } from 'react';
import { Instrument_Sans, Manrope } from 'next/font/google';
import '@/app/globals.css';

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata = {
  title: 'Nordic Atlas — Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="da" className={`${instrumentSans.variable} ${manrope.variable}`}>
      <body className="font-body antialiased bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
