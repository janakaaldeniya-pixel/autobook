// app/layout.tsx
import type { Metadata } from 'next';
import { Barlow_Condensed } from 'next/font/google';
import { Navbar } from '@/components/shared/Navbar';
import './globals.css';

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-condensed',
});

export const metadata: Metadata = {
  title: 'Autobook — Sri Lanka\'s Automobile Platform',
  description: 'Garages, spare parts, vehicle buy/sell, diagnostics and more — all in one place.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={barlowCondensed.variable}>
      <body className="bg-[#14181A] text-[#F2EFE9] antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
