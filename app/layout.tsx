import '@/app/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Igor Yezhov | Interactive Resume MVP',
  description: 'Interactive resume dashboard and AI interview assistant for Igor Yezhov.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
