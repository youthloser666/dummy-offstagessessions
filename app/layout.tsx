import type { Metadata } from 'next';
import './globals.css';
import CustomCursor from '@/components/CustomCursor';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ClientShell from '@/components/ClientShell';
import SmoothScroll from '@/components/SmoothScroll';
import GlobalBackgroundCanvas from '@/components/GlobalBackgroundCanvas';
import SocialDock from '@/components/SocialDock';
import TrafficTracker from '@/components/TrafficTracker';

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
      <head>
        {/* Synchronous 0ms*/}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var isHome = window.location.pathname === '/';
                  var seen = sessionStorage.getItem('splashSeen') === 'true';
                  if (isHome && !seen) {
                    document.documentElement.classList.add('splash-pending');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="bg-black text-white cursor-none overflow-x-hidden">
        {/* LAYER 1: Fixed Background Root (3D Canvas + Radial Mask) */}
        <div
          id="fixed-background-root"
          style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden', backgroundColor: '#000000' }}
        >
          {/* LAYER 1A: 3D Canvas */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
            <GlobalBackgroundCanvas />
          </div>

          {/* LAYER 1B: Radial Gradient Vignette */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              pointerEvents: 'none',
              backgroundImage:
                'radial-gradient(ellipse at center, transparent 35%, rgba(0, 0, 0, 0.45) 75%, #000000 100%)',
            }}
          />
        </div>

        {/* Fixed Navigation */}
        <Nav />

        {/* LAYER 2: Client Shell (Splash Screen) & Smooth Scroll (Lenis) */}
        <ClientShell>
          <SmoothScroll>
            {/* LAYER 3: App Viewport & Page Content */}
            <div
              id="app-viewport"
              style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                width: '100%',
              }}
            >
              <main style={{ flex: 1, width: '100%', position: 'relative', zIndex: 10 }}>
                {children}
              </main>
              <Footer footerBigText="Offstage Sessions" />
            </div>
          </SmoothScroll>
        </ClientShell>

        {/* Desktop Fixed Floating Social Media Dock */}
        <SocialDock />

        {/* Site Traffic & Visitor Tracking */}
        <TrafficTracker />

        {/* Custom Cursor Overlay */}
        <CustomCursor />
      </body>
    </html>
  );
}
