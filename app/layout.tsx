import type { Metadata } from 'next';
import './globals.css';
import CustomCursor from '@/components/CustomCursor';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ClientShell from '@/components/ClientShell';
import SmoothScroll from '@/components/SmoothScroll';
import GlobalBackgroundCanvas from '@/components/GlobalBackgroundCanvas';

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
    <html lang="en" suppressHydrationWarning className="bg-black text-white">
      <body className="bg-black text-white cursor-none overflow-x-hidden">
        {/* LAYER 1: Fixed Background Root (3D Canvas + Radial Mask) */}
        <div
          id="fixed-background-root"
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
          style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden', backgroundColor: '#000000' }}
        >
          {/* LAYER 1A: 3D Canvas (Photo Grid + Grid Lines + 3D Hero Typography + 3D Glass OFFSTAGE) */}
          <div className="absolute inset-0 z-0 pointer-events-none" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
            <GlobalBackgroundCanvas />
          </div>

          {/* LAYER 1B: Radial Gradient Vignette: Darkens outer edges seamlessly */}
          <div
            className="absolute inset-0 z-[2] pointer-events-none"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              pointerEvents: 'none',
              backgroundImage:
                'radial-gradient(ellipse at center, transparent 35%, rgba(0, 0, 0, 0.65) 75%, #000000 100%)',
            }}
          />
        </div>

        {/* LAYER 2: Client Shell (Splash Screen State) & Smooth Scroll (Lenis) */}
        <ClientShell>
          <SmoothScroll>
            {/* LAYER 3: App Viewport & Page Content */}
            <div
              id="app-viewport"
              className="relative z-10 flex flex-col min-h-screen w-full"
              style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                width: '100%',
              }}
            >
              <Nav />
              <main className="flex-1 w-full relative z-10" style={{ flex: 1, width: '100%', position: 'relative', zIndex: 10 }}>
                {children}
              </main>
              <Footer footerBigText="Offstage Sessions" />
            </div>
          </SmoothScroll>
        </ClientShell>

        {/* Custom Cursor Overlay */}
        <CustomCursor />
      </body>
    </html>
  );
}
