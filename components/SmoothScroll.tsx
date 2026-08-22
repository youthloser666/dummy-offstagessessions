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

    // 2. Inisialisasi Lenis instance
    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
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

  // Penanganan transisi rute: stop saat animasi transisi halaman, lalu reset & start kembali
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    // 1. Hentikan kalkulasi scroll saat transisi rute dimulai
    lenis.stop();

    // 2. Tunggu transisi keluar (exit) selesai (250ms)
    const timeout = setTimeout(() => {
      // 3. Reset scroll ke paling atas tanpa animasi
      lenis.scrollTo(0, { immediate: true });
      
      // 4. Nyalakan kembali Lenis dan refresh ScrollTrigger untuk DOM halaman baru
      lenis.start();
      ScrollTrigger.refresh();
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [pathname]);

  return <>{children}</>;
}
