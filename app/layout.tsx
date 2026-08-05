import type { Metadata } from 'next';
import './globals.css';
import Cursor from '@/components/Cursor';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ClientShell from '@/components/ClientShell';

export const metadata: Metadata = {
  title: 'Offstage Sessions — Home of Baltimore & DC Dance Music',
  description:
    'House. Techno. Bass. And everything in between. The underground scene of the DMV.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientShell>
          <Cursor />
          <Nav />
          {children}
          <Footer footerBigText="Offstage Sessions" />
        </ClientShell>
      </body>
    </html>
  );
}
