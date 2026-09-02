'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import styles from './SplashScreen.module.css';

interface SplashScreenProps {
    onReveal?: () => void;
    onComplete: () => void;
}

export default function SplashScreen({ onReveal, onComplete }: SplashScreenProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const noiseRef = useRef<HTMLDivElement>(null);
    const centerContentRef = useRef<HTMLDivElement>(null);
    const logoWrapRef = useRef<HTMLDivElement>(null);
    const logoRef = useRef<HTMLImageElement>(null);
    const accentRef = useRef<HTMLDivElement>(null);
    const taglineRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 1. Ultra-smooth GPU-accelerated GSAP timeline
        const tl = gsap.timeline({
            defaults: { ease: 'power3.out', force3D: true },
        });

        // Initial setup
        gsap.set(noiseRef.current, { opacity: 0 });
        gsap.set(logoRef.current, { opacity: 0, scale: 0.94, y: 14 });
        gsap.set(accentRef.current, { width: 0 });
        gsap.set(taglineRef.current, { opacity: 0, y: 8 });

        // Phase 1: Smooth TV Noise Fade in & Phosphor warm-up (0.45s)
        tl.to(noiseRef.current, {
            opacity: 0.75,
            duration: 0.45,
            ease: 'power2.out',
        });

        // Phase 2: Logo RGB Glitch Reveal (0.6s)
        tl.to(logoRef.current, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.6,
            onStart: () => {
                logoWrapRef.current?.classList.add(styles.glitchActive);
            },
        }, '+=0.1');

        // Phase 3: Acid line expand + Tagline fade in (0.65s)
        tl.to(accentRef.current, {
            width: 140,
            duration: 0.6,
            ease: 'power2.inOut',
        }, '-=0.2');

        tl.to(taglineRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.45,
        }, '-=0.35');

        // Phase 4: Hold with organic analog grain jitter (0.85s)
        tl.to({}, { duration: 0.85 });

        // Phase 5: THEATRICAL CURTAIN PULL (Tirai ditarik serentak ke atas secara utuh)
        tl.add(() => {
            if (onReveal) onReveal();
        });

        // Parallax logo drift as the stage curtain rises
        tl.to(centerContentRef.current, {
            y: -100,
            opacity: 0.2,
            duration: 0.95,
            ease: 'power2.in',
            force3D: true,
        }, 'curtainSweep');

        // The entire TV Screen + Noise + Scanlines pulls upward like a dramatic curtain!
        tl.to(overlayRef.current, {
            yPercent: -100,
            duration: 1.15,
            ease: 'power3.inOut',
            force3D: true,
            onComplete: () => {
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('splashSeen', 'true');
                }
                onComplete();
            },
        }, 'curtainSweep');

        return () => {
            tl.kill();
            if (typeof window !== 'undefined') {
                document.body.style.overflow = '';
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            ref={overlayRef}
            className={styles.splashOverlay}
            aria-hidden="true"
        >
            {/* 1. Organic Analog TV Grain Noise (100% GPU accelerated) */}
            <div ref={noiseRef} className={styles.analogGrainNoise} />

            {/* 2. TV Phosphor Flicker */}
            <div className={styles.tvPhosphorFlicker} />

            {/* 3. CRT Scanlines & Vignette */}
            <div className={styles.scanlines} />
            <div className={styles.vignette} />

            {/* 4. VHS Horizontal Tracking Bars */}
            <div className={styles.glitchBars}>
                <div className={styles.glitchBar} />
                <div className={styles.glitchBar} />
                <div className={styles.glitchBar} />
            </div>

            {/* 5. Broadcast Corner Marks */}
            <div className={`${styles.cornerMark} ${styles.topLeft}`} />
            <div className={`${styles.cornerMark} ${styles.topRight}`} />
            <div className={`${styles.cornerMark} ${styles.bottomLeft}`} />
            <div className={`${styles.cornerMark} ${styles.bottomRight}`} />

            {/* 6. Center Logo & Content */}
            <div ref={centerContentRef} className={styles.centerContent}>
                <div ref={logoWrapRef} className={styles.logoGlitchWrap}>
                    {/* Main White Logo */}
                    <Image
                        ref={logoRef}
                        src="/logo.svg"
                        alt="Offstage Sessions"
                        width={900}
                        height={180}
                        priority
                        className={styles.mainLogo}
                    />
                    {/* RGB Red Channel Glitch */}
                    <Image
                        src="/logo.svg"
                        alt=""
                        width={900}
                        height={180}
                        aria-hidden
                        className={styles.glitchChannelR}
                    />
                    {/* RGB Cyan Channel Glitch */}
                    <Image
                        src="/logo.svg"
                        alt=""
                        width={900}
                        height={180}
                        aria-hidden
                        className={styles.glitchChannelC}
                    />
                </div>

                {/* Acid Accent Line */}
                <div ref={accentRef} className={styles.accentLine} />

                {/* Tagline */}
                <div ref={taglineRef} className={styles.tagline}>
                    Born in Baltimore &middot; Est 2023
                </div>
            </div>
        </div>
    );
}
