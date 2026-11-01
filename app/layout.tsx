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
import Analytics from '@/components/Analytics';

export const metadata: Metadata = {
  title: 'Offstage Sessions — Home of Baltimore & DC Dance Music',
  description:
    'House. Techno. Bass. And everything in between. The underground scene of the DMV.',
  icons: {
    icon: [
      { url: '/favicon_io/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon_io/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon_io/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/favicon_io/favicon.ico',
    apple: [
      { url: '/favicon_io/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/favicon_io/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-black text-white">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon_io/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon_io/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon_io/favicon-16x16.png" />
        <link rel="manifest" href="/favicon_io/site.webmanifest" />
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
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html.splash-pending nav,
              html.splash-pending #fixed-background-root,
              html.splash-pending #app-viewport,
              html.splash-pending aside,
              html.splash-pending .cursor-dot,
              html.splash-pending .cursor-pill {
                opacity: 0 !important;
                visibility: hidden !important;
                pointer-events: none !important;
              }
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="bg-black text-white cursor-none overflow-x-hidden">
        {/* LAYER 1: Fixed Background Root (3D Canvas + Radial Mask) */}
        <div
          id="fixed-background-root"
          suppressHydrationWarning
          style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden', backgroundColor: '#000000' }}
        >
          {/* LAYER 1A: 3D Canvas */}
          <div suppressHydrationWarning style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
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

        {/* Analytics: Meta Pixel + Google Analytics 4 */}
        <Analytics />

        {/* Site Traffic & Visitor Tracking */}
        <TrafficTracker />

        {/* Custom Cursor Overlay */}
        <CustomCursor />
      </body>
    </html>
  );
}
