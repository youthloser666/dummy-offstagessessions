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
    // 1. Registrasi plugin ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // 2. Inisialisasi Lenis instance dengan inertia & smooth damping mewah
    const lenis = new Lenis({
      lerp: 0.065,
      duration: 1.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.88,
      touchMultiplier: 1.5,
      syncTouch: true,
      infinite: false,
    });

    lenisRef.current = lenis;
    (window as any).__lenis = lenis;

    // 3. Update ScrollTrigger setiap kali Lenis melakukan scroll
    lenis.on('scroll', ScrollTrigger.update);

    // 4. Sinkronkan requestAnimationFrame Lenis ke GSAP Ticker
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

  // Penanganan transisi rute: reset scroll ke atas secara instan tanpa mengunci UI
  useEffect(() => {
    // 1. Reset posisi scroll native browser dan Lenis ke paling atas secara instan
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }

    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    }

    // 2. Refresh ScrollTrigger setelah frame berikutnya agar layout DOM baru sudah siap
    const rafId = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [pathname]);

  return <>{children}</>;
}
