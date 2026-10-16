'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { trackPageView } from '@/lib/analytics';

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Analytics — Meta Pixel + Google Analytics 4
 *
 * Renders the base <script> tags for both Meta Pixel and GA4,
 * and fires a PageView event on every client-side route change.
 *
 * Place this component once in the root layout.
 */
export default function Analytics() {
  const pathname = usePathname();

  // ---- Automatic PageView on route change ----
  useEffect(() => {
    // Skip admin routes
    if (pathname && pathname.startsWith('/offstageadminv')) return;

    // Meta Pixel PageView
    trackPageView();

    // GA4 page_view (gtag handles this automatically for the first load,
    // but we need to manually fire it on SPA navigations)
    if (typeof window !== 'undefined' && typeof window.gtag === 'function' && GA_MEASUREMENT_ID) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: pathname,
      });
    }
  }, [pathname]);

  // Don't render scripts if IDs are missing
  if (!META_PIXEL_ID && !GA_MEASUREMENT_ID) return null;

  return (
    <>
      {/* ============================================= */}
      {/* META PIXEL (Facebook Pixel)                   */}
      {/* ============================================= */}
      {META_PIXEL_ID && (
        <>
          <Script
            id="meta-pixel-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${META_PIXEL_ID}');
                fbq('track', 'PageView');
              `,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {/* ============================================= */}
      {/* GOOGLE ANALYTICS 4 (gtag.js)                  */}
      {/* ============================================= */}
      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script
            id="google-analytics-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}
    </>
  );
}
