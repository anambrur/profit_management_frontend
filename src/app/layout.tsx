import { Providers } from '@/components/providers';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const outfit = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Green FBA | Mapel BPO',
  description: 'Green FBA | Mapel BPO',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${outfit.className} antialiased`}
        suppressHydrationWarning={true}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
