'use client';

import { useState, useCallback } from 'react';
import SplashScreen from './SplashScreen';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * ClientShell manages the splash screen overlay.
 * Renders children cleanly while SplashScreen is active.
 * When splash finishes, unmounts splash and refreshes GSAP ScrollTrigger.
 */
export default function ClientShell({ children }: { children: React.ReactNode }) {
    const [splashDone, setSplashDone] = useState(false);

    const handleSplashComplete = useCallback(() => {
        setSplashDone(true);
        document.body.style.overflow = '';

        // Refresh GSAP ScrollTrigger so all pins/scroll triggers calculate perfectly
        setTimeout(() => {
            if (typeof window !== 'undefined') {
                gsap.registerPlugin(ScrollTrigger);
                ScrollTrigger.refresh();
            }
        }, 100);
    }, []);

    return (
        <>
            {!splashDone && (
                <SplashScreen
                    onComplete={handleSplashComplete}
                />
            )}
            {children}
        </>
    );
}
