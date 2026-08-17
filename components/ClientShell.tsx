'use client';

import { useState, useCallback, useRef, useEffect, createContext, useContext } from 'react';
import SplashScreen from './SplashScreen';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface SplashContextType {
    splashState: 'active' | 'revealing' | 'done';
}

const SplashContext = createContext<SplashContextType>({ splashState: 'active' });

export function useSplash() {
    return useContext(SplashContext);
}

export default function ClientShell({ children }: { children: React.ReactNode }) {
    const [splashState, setSplashState] = useState<'active' | 'revealing' | 'done'>('active');
    const contentRef = useRef<HTMLDivElement>(null);

    // Triggered exactly when SplashScreen starts pulling up
    const handleSplashReveal = useCallback(() => {
        setSplashState('revealing');
        if (contentRef.current) {
            gsap.fromTo(
                contentRef.current,
                { y: 80, opacity: 0.9, scale: 0.985 },
                { y: 0, opacity: 1, scale: 1, duration: 1.0, ease: 'power3.inOut', force3D: true }
            );
        }
    }, []);

    // Triggered when SplashScreen has completely faded out and can be unmounted
    const handleSplashComplete = useCallback(() => {
        setSplashState('done');
        document.body.style.overflow = '';

        setTimeout(() => {
            if (typeof window !== 'undefined') {
                gsap.registerPlugin(ScrollTrigger);
                ScrollTrigger.refresh();
            }
        }, 100);
    }, []);

    return (
        <SplashContext.Provider value={{ splashState }}>
            {splashState !== 'done' && (
                <SplashScreen 
                    onReveal={handleSplashReveal}
                    onComplete={handleSplashComplete} 
                />
            )}
            
            <div ref={contentRef}>
                {children}
            </div>
        </SplashContext.Provider>
    );
}
