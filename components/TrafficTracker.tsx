'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function TrafficTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Avoid tracking admin console visits
    if (pathname && pathname.startsWith('/offstageadminv')) return;

    try {
      const payload = {
        path: pathname || '/',
        referrer: typeof document !== 'undefined' ? document.referrer || null : null,
      };

      // Use sendBeacon if available, otherwise fetch
      if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon('/api/track', blob);
      } else {
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => {});
      }
    } catch {
      // Non-blocking
    }
  }, [pathname]);

  return null;
}
