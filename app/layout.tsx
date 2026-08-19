import type { Metadata } from 'next';
import './globals.css';
import CustomCursor from '@/components/CustomCursor';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ClientShell from '@/components/ClientShell';
import SmoothScroll from '@/components/SmoothScroll';

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
      <body className="cursor-none">
        <ClientShell>
          <SmoothScroll>
            <CustomCursor />
            <Nav />
            {children}
            <Footer footerBigText="Offstage Sessions" />
          </SmoothScroll>
        </ClientShell>
      </body>
    </html>
  );
}

