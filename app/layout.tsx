import '@/app/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'I.Y. | Enterprise AI & Analytics Leader',
  description: 'Interactive resume and AI interview assistant for an enterprise AI workflow, automation, analytics, and governance leader.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
