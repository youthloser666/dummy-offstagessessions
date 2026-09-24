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

    // Detect touch-first mobile & tablet devices
    const isMobileTouch =
      typeof window !== 'undefined' &&
      (window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
       (window.innerWidth < 840 && ('ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0)));

    // On mobile touch devices: Use browser's native hardware momentum scrolling!
    // This eliminates:
    // 1. "Floaty" / disconnected finger drag (1:1 direct finger tracking)
    // 2. Micro-stutters and 60Hz/120Hz display refresh mismatches across different phone brands
    // 3. Inertia fighting with native browser gestures
    if (isMobileTouch) {
      const onNativeScroll = () => {
        ScrollTrigger.update();
      };
      window.addEventListener('scroll', onNativeScroll, { passive: true });

      return () => {
        window.removeEventListener('scroll', onNativeScroll);
      };
    }

    // On Desktop: Initialize Lenis for luxurious smooth mouse wheel damping
    const lenis = new Lenis({
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
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisRef.current = null;
      if ((window as any).__lenis === lenis) {
        delete (window as any).__lenis;
      }
    };
  }, []);

  // Route transition: instantly reset scroll position without blocking UI
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
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
