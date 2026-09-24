import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PulseBI | Revenue Intelligence',
  description:
    'Production-style business intelligence dashboard built with Next.js, React and TypeScript.',
  applicationName: 'PulseBI',
  authors: [{ name: 'Leonardo Santos Custódio' }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
