'use client';

import { useState, useCallback, useRef, createContext, useContext, useEffect } from 'react';
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

export default function ClientShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [splashState, setSplashState] = useState<'active' | 'revealing' | 'done'>('done');
    const [shouldRenderSplash, setShouldRenderSplash] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    // Run splash evaluation only after client hydration completes
    useEffect(() => {
        setMounted(true);
        if (typeof window === 'undefined') return;

        const isHomePage = pathname === '/';
        const alreadySeen = sessionStorage.getItem('splashSeen') === 'true';

        if (isHomePage && !alreadySeen) {
            setSplashState('active');
            setShouldRenderSplash(true);
            document.body.style.overflow = 'hidden';

            // Lock Lenis scroll while splash screen is active
            const lenis = (window as any).__lenis;
            if (lenis) {
                lenis.stop();
            }
        } else {
            // Not on homepage or already seen — clear splash-pending class
            document.documentElement.classList.remove('splash-pending');
            setSplashState('done');
            setShouldRenderSplash(false);
            document.body.style.overflow = '';
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    // Triggered when splash animation begins pulling the curtain upward
    const handleSplashReveal = useCallback(() => {
        setSplashState('revealing');

        // Remove pre-hydration mask so the landing page is visible behind the rising curtain
        if (typeof document !== 'undefined') {
            document.documentElement.classList.remove('splash-pending');
        }

        // Resume Lenis scroll and reset position to top
        const lenis = (window as any).__lenis;
        if (lenis) {
            lenis.start();
            lenis.scrollTo(0, { immediate: true });
        }

        // Smooth opacity fade on content (no CSS transform to preserve fixed Nav positioning)
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

    // Triggered when splash animation is fully complete
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
            {mounted && shouldRenderSplash && (
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
