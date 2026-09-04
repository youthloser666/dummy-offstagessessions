'use client';

import { useState, useCallback, useRef, createContext, useContext, useEffect, useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
import SplashScreen from './SplashScreen';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface SplashContextType {
    splashState: 'active' | 'revealing' | 'done';
}

const SplashContext = createContext<SplashContextType>({ splashState: 'done' });

export function useSplash() {
    return useContext(SplashContext);
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function ClientShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [splashState, setSplashState] = useState<'active' | 'revealing' | 'done'>('done');
    const [shouldRenderSplash, setShouldRenderSplash] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    // Evaluasi sinkron sebelum paint browser untuk menentukan apakah splash screen aktif
    useIsomorphicLayoutEffect(() => {
        if (typeof window === 'undefined') return;

        const isHomePage = pathname === '/';
        const alreadySeen = sessionStorage.getItem('splashSeen') === 'true';

        if (isHomePage && !alreadySeen) {
            setSplashState('active');
            setShouldRenderSplash(true);
            document.body.style.overflow = 'hidden';

            // Kunci scroll Lenis selama splash screen aktif
            const lenis = (window as any).__lenis;
            if (lenis) {
                lenis.stop();
            }
        } else {
            // Jika bukan di homepage atau sudah pernah dilihat, pastikan class splash-pending dibersihkan
            document.documentElement.classList.remove('splash-pending');
            setSplashState('done');
            setShouldRenderSplash(false);
            document.body.style.overflow = '';
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Triggered saat animasi splash mulai menarik tirai ke atas
    const handleSplashReveal = useCallback(() => {
        setSplashState('revealing');

        // Buka mask pre-hydration agar landing page terlihat persis di balik tirai yang terangkat
        if (typeof document !== 'undefined') {
            document.documentElement.classList.remove('splash-pending');
        }

        // Buka kembali Lenis scroll dan pastikan posisi di 0
        const lenis = (window as any).__lenis;
        if (lenis) {
            lenis.start();
            lenis.scrollTo(0, { immediate: true });
        }

        // Transisi fade lembut pada content tanpa CSS transform agar position:fixed pada Nav tidak rusak
        if (contentRef.current) {
            gsap.fromTo(
                contentRef.current,
                { opacity: 0.85 },
                { 
                    opacity: 1, 
                    duration: 0.7, 
                    ease: 'power2.out',
                    clearProps: 'transform',
                }
            );
        }
    }, []);

    // Triggered saat animasi splash selesai total
    const handleSplashComplete = useCallback(() => {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('splashSeen', 'true');
            document.documentElement.classList.remove('splash-pending');
        }
        setSplashState('done');
        setShouldRenderSplash(false);
        document.body.style.overflow = '';

        const lenis = (window as any).__lenis;
        if (lenis) {
            lenis.start();
        }

        setTimeout(() => {
            if (typeof window !== 'undefined') {
                gsap.registerPlugin(ScrollTrigger);
                ScrollTrigger.refresh();
            }
        }, 80);
    }, []);

    return (
        <SplashContext.Provider value={{ splashState }}>
            {shouldRenderSplash && (
                <SplashScreen 
                    onReveal={handleSplashReveal}
                    onComplete={handleSplashComplete} 
                />
            )}
            <div ref={contentRef} style={{ width: '100%', minHeight: '100vh' }}>
                {children}
            </div>
        </SplashContext.Provider>
    );
}


