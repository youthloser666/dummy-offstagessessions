'use client';

import { useState, useEffect } from 'react';

export function useSiteReadiness(): boolean {
  const [isDataReady, setIsDataReady] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function verifyReadiness() {
      try {
        const fontPromise = typeof document !== 'undefined' && document.fonts
          ? document.fonts.ready
          : Promise.resolve();

        const showsPromise = fetch('/api/shows')
          .then((res) => res.json())
          .catch(() => null);

        const shopifyPromise = fetch('/api/shopify/products')
          .then((res) => res.json())
          .catch(() => null);

        const mediaPromise = fetch('/api/media')
          .then((res) => res.json())
          .catch(() => null);

        const windowPromise = typeof window !== 'undefined' && document.readyState === 'complete'
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              if (typeof window !== 'undefined') {
                window.addEventListener('load', () => resolve(), { once: true });
                setTimeout(resolve, 2500);
              } else {
                resolve();
              }
            });

        await Promise.allSettled([fontPromise, showsPromise, shopifyPromise, mediaPromise, windowPromise]);
      } catch (err) {
        console.warn('Readiness check notice:', err);
      } finally {
        if (!isCancelled) {
          setIsDataReady(true);
        }
      }
    }

    verifyReadiness();

    return () => {
      isCancelled = true;
    };
  }, []);

  return isDataReady;
}
