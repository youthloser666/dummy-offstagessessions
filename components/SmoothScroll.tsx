'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface SmoothScrollProps {
  children: React.ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const isAdmin = pathname?.startsWith('/offstageadminv');

    // Detect touch-first mobile & tablet devices
    const isMobileTouch =
      typeof window !== 'undefined' &&
      (window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
       (window.innerWidth < 840 && ('ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0)));

    // On mobile touch devices: Always use native hardware touch momentum scrolling (120Hz smooth, no virtualization)
    if (isMobileTouch) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
        if ((window as any).__lenis) {
          delete (window as any).__lenis;
        }
      }

      const onNativeScroll = () => {
        ScrollTrigger.update();
      };
      window.addEventListener('scroll', onNativeScroll, { passive: true });

      return () => {
        window.removeEventListener('scroll', onNativeScroll);
      };
    }

    let isCancelled = false;
    let tickerAdded = false;
    let tickerCallback: ((time: number) => void) | null = null;

    const setupLenis = () => {
      if (isCancelled) return;

      let wrapper: Window | HTMLElement = window;
      let content: HTMLElement = document.documentElement;
      let eventsTarget: Window | HTMLElement = window;

      if (isAdmin) {
        const adminMain = document.getElementById('admin-main-scroll');
        if (!adminMain) {
          // Retry on next animation frame if admin container is still rendering
          requestAnimationFrame(setupLenis);
          return;
        }
        const adminContent =
          document.getElementById('admin-main-scroll-content') ||
          (adminMain.firstElementChild as HTMLElement) ||
          adminMain;

        wrapper = adminMain;
        content = adminContent;
        eventsTarget = window;
      }

      // Initialize Lenis for luxurious smooth mouse wheel damping
      const lenis = new Lenis({
        wrapper,
        content,
        eventsTarget,
        lerp: 0.085,
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1.0,
        syncTouch: false, // Never virtualize touch on mobile
        touchMultiplier: 1.0,
        infinite: false,
      });

      lenisRef.current = lenis;
      (window as any).__lenis = lenis;

      // Sync ScrollTrigger on every Lenis scroll event
      lenis.on('scroll', ScrollTrigger.update);

      // Synchronize Lenis RAF to GSAP Ticker
      tickerCallback = (time: number) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);
      tickerAdded = true;
    };

    setupLenis();

    return () => {
      isCancelled = true;
      if (tickerAdded && tickerCallback) {
        gsap.ticker.remove(tickerCallback);
      }
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
        if ((window as any).__lenis) {
          delete (window as any).__lenis;
        }
      }
    };
  }, [pathname]);

  // Route transition: instantly reset scroll position without blocking UI
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }

    const adminMain = document.getElementById('admin-main-scroll');
    if (adminMain) {
      adminMain.scrollTo(0, 0);
    }

    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    }

    // Refresh ScrollTrigger after next frame to ensure new DOM layout is ready
    const rafId = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [pathname]);

  return <>{children}</>;
}
