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
    const [splashState, setSplashState] = useState<'active' | 'revealing' | 'done'>('done');
    const contentRef = useRef<HTMLDivElement>(null);

    // Evaluasi apakah splash screen perlu dijalankan pada initial load
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const isHomePage = pathname === '/';
        const alreadySeen = sessionStorage.getItem('splashSeen') === 'true';

        // Hanya jalankan splash jika berada di root '/' dan belum pernah dilihat di sesi ini
        if (isHomePage && !alreadySeen) {
            setSplashState('active');
            document.body.style.overflow = 'hidden';
        } else {
            setSplashState('done');
            document.body.style.overflow = '';
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Triggered saat animasi splash mulai menarik tirai ke atas
    const handleSplashReveal = useCallback(() => {
        setSplashState('revealing');
        if (contentRef.current) {
            gsap.fromTo(
                contentRef.current,
                { y: 60, opacity: 0.95 },
                { 
                    y: 0, 
                    opacity: 1, 
                    duration: 0.9, 
                    ease: 'power3.out', 
                    force3D: true,
                    onComplete: () => {
                        if (contentRef.current) {
                            gsap.set(contentRef.current, { clearProps: 'transform' });
                        }
                    }
                }
            );
        }
    }, []);

    // Triggered saat animasi splash selesai total
    const handleSplashComplete = useCallback(() => {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('splashSeen', 'true');
        }
        setSplashState('done');
        document.body.style.overflow = '';

        setTimeout(() => {
            if (typeof window !== 'undefined') {
                gsap.registerPlugin(ScrollTrigger);
                ScrollTrigger.refresh();
            }
        }, 80);
    }, []);

    return (
        <SplashContext.Provider value={{ splashState }}>
            {splashState !== 'done' && (
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
