'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import styles from './SplashScreen.module.css';

/**
 * SplashScreen — Noise + Wipe + Glitch Logo
 *
 * Sequence:
 * 1. Full-screen vintage TV static noise with grain (canvas)
 * 2. Horizontal wipe reveals the Offstage logo with glitch effect
 * 3. Accent line + tagline fade in
 * 4. Logo glitch intensifies briefly, then zoom-out transition
 */
export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wipeMaskRef = useRef<HTMLDivElement>(null);
    const accentRef = useRef<HTMLDivElement>(null);
    const taglineRef = useRef<HTMLDivElement>(null);
    const logoWrapRef = useRef<HTMLDivElement>(null);
    const animFrameRef = useRef<number>(0);
    const [isExiting, setIsExiting] = useState(false);

    // ---- VINTAGE TV STATIC NOISE RENDERER ----
    const drawNoise = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;
        const imageData = ctx.createImageData(w, h);
        const data = imageData.data;

        // Vintage grain: warmer tones, variable brightness, occasional bright spots
        const time = Date.now() * 0.001;
        const flickerBase = 0.85 + Math.sin(time * 8) * 0.08; // Subtle brightness flicker

        for (let i = 0; i < data.length; i += 4) {
            const pixelIndex = i / 4;
            const y = Math.floor(pixelIndex / w);
            const x = pixelIndex % w;

            // Base noise
            let v = Math.random() * 255;

            // Vintage grain: add horizontal line artifacts
            if (Math.random() < 0.003) {
                v = Math.random() < 0.5 ? 255 : 0; // Occasional hot/dead pixels
            }

            // Horizontal band interference (VHS tracking lines)
            const bandPos = (time * 40 + y * 0.5) % h;
            if (Math.abs(y - bandPos) < 3) {
                v = Math.min(255, v + 80);
            }

            // Slight sepia/warm vintage tint
            const warmth = v * flickerBase;
            data[i] = Math.min(255, warmth * 1.05);     // R - slightly warmer
            data[i + 1] = Math.min(255, warmth * 1.0);   // G
            data[i + 2] = Math.min(255, warmth * 0.92);  // B - slightly cooler
            data[i + 3] = 210; // A

            // Random horizontal tear/glitch lines
            if (Math.random() < 0.0008) {
                const tearLength = Math.floor(Math.random() * 30) + 5;
                for (let t = 0; t < tearLength && (i + t * 4) < data.length; t++) {
                    const ti = i + t * 4;
                    data[ti] = 200;
                    data[ti + 1] = 200;
                    data[ti + 2] = 180;
                    data[ti + 3] = 255;
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
        animFrameRef.current = requestAnimationFrame(drawNoise);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Size canvas to a smaller resolution for performance + authentic chunky look
        canvas.width = 320;
        canvas.height = 220;

        // Start noise
        animFrameRef.current = requestAnimationFrame(drawNoise);

        // ---- ANIMATION TIMELINE (extended duration) ----
        const tl = gsap.timeline({
            onComplete: () => {
                setIsExiting(true);

                setTimeout(() => {
                    cancelAnimationFrame(animFrameRef.current);
                    onComplete();
                }, 800);
            },
        });

        // Phase 0: Smooth CRT TV Power-On (0.4s)
        tl.fromTo(
            canvasRef.current,
            { opacity: 0, filter: 'brightness(0.2)' },
            { opacity: 1, filter: 'brightness(1)', duration: 0.4, ease: 'power2.out' }
        );

        // Phase 1: Pure vintage noise hold (0.5s)
        tl.to({}, { duration: 0.5 });

        // Phase 2: Fade noise down while wipe reveals (0.8s)
        tl.to(canvasRef.current, {
            opacity: 0.12,
            duration: 0.8,
            ease: 'power2.inOut',
        });

        // Phase 2b: Horizontal wipe open (clip-path from center)
        tl.to(
            wipeMaskRef.current,
            {
                clipPath: 'inset(0 0% 0 0%)',
                duration: 0.9,
                ease: 'power3.inOut',
            },
            '-=0.6'
        );

        // Phase 2c: Start logo glitch animation after wipe begins
        tl.add(() => {
            logoWrapRef.current?.classList.add(styles.glitchActive);
        }, '-=0.5');

        // Phase 3: Accent line expands
        tl.add(() => {
            accentRef.current?.classList.add(styles.expanded);
        }, '-=0.1');

        // Phase 3b: Tagline fades in
        tl.add(() => {
            taglineRef.current?.classList.add(styles.visible);
        }, '+=0.2');

        // Phase 4: Hold logo (0.9s)
        tl.to({}, { duration: 0.9 });

        // Phase 5: Flicker effect before exit
        tl.add(() => {
            overlayRef.current?.classList.add(styles.flickering);
        });

        tl.to({}, { duration: 0.25 });

        return () => {
            cancelAnimationFrame(animFrameRef.current);
            tl.kill();
        };
    }, [drawNoise, onComplete]);

    return (
        <div
            ref={overlayRef}
            className={`${styles.splashOverlay} ${isExiting ? styles.exiting : ''}`}
        >
            {/* Vintage TV Static Noise */}
            <canvas ref={canvasRef} className={styles.noiseCanvas} />

            {/* Film Grain Overlay */}
            <div className={styles.filmGrain} />

            {/* CRT Scanlines */}
            <div className={styles.scanlines} />

            {/* Vignette */}
            <div className={styles.vignette} />

            {/* VHS Glitch Bars */}
            <div className={styles.glitchBars}>
                <div className={styles.glitchBar} />
                <div className={styles.glitchBar} />
                <div className={styles.glitchBar} />
                <div className={styles.glitchBar} />
            </div>

            {/* Broadcast Corner Marks */}
            <div className={`${styles.cornerMark} ${styles.topLeft}`} />
            <div className={`${styles.cornerMark} ${styles.topRight}`} />
            <div className={`${styles.cornerMark} ${styles.bottomLeft}`} />
            <div className={`${styles.cornerMark} ${styles.bottomRight}`} />

            {/* Wipe-reveal Logo with Glitch Effect */}
            <div ref={wipeMaskRef} className={styles.wipeMask}>
                <div ref={logoWrapRef} className={styles.logoGlitchWrap}>
                    {/* Main Logo */}
                    <Image
                        src="/offsatge-logo.svg"
                        alt="Offstage Sessions"
                        width={1500}
                        height={304}
                        priority
                        className={styles.splashLogo}
                    />
                    {/* Glitch Layer — Red Channel */}
                    <Image
                        src="/offsatge-logo.svg"
                        alt=""
                        width={1500}
                        height={304}
                        aria-hidden
                        className={`${styles.splashLogo} ${styles.glitchLayerR}`}
                    />
                    {/* Glitch Layer — Cyan Channel */}
                    <Image
                        src="/offsatge-logo.svg"
                        alt=""
                        width={1500}
                        height={304}
                        aria-hidden
                        className={`${styles.splashLogo} ${styles.glitchLayerC}`}
                    />
                </div>
            </div>

            {/* Acid Green Accent Line */}
            <div ref={accentRef} className={styles.accentLine} />

            {/* Tagline */}
            <div ref={taglineRef} className={styles.tagline}>
                Born in Baltimore &middot; Est 2023
            </div>
        </div>
    );
}
