'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './GlitchBanner.module.css';

const BANNER_IMAGES = [
    '/image/1_web.webp',
    '/image/2_web.webp',
    '/image/3_web.webp',
    '/image/4_web.webp',
    '/image/5_web.webp',
    '/image/6_web_web.webp',
    '/image/7_web_web.webp',
    '/image/8_web_web.webp',
    '/image/9_web_web.webp',
    '/image/10_web_web.webp',
];

export default function GlitchBanner() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isGlitching, setIsGlitching] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const isGlitchingRef = useRef(false);

    // Trigger glitch transition and swap to next photo
    const advanceSlide = () => {
        if (isGlitchingRef.current) return;
        isGlitchingRef.current = true;
        setIsGlitching(true);

        // At midpoint of glitch burst (160ms), change the image
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % BANNER_IMAGES.length);
        }, 160);

        // Reset glitch state
        setTimeout(() => {
            setIsGlitching(false);
            isGlitchingRef.current = false;
        }, 360);
    };

    // Auto slideshow every 3.2s
    useEffect(() => {
        const interval = setInterval(() => {
            advanceSlide();
        }, 3200);

        return () => clearInterval(interval);
    }, []);

    const currentSrc = BANNER_IMAGES[currentIndex];

    return (
        <div
            className={`${styles.bannerContainer} reveal`}
            onClick={advanceSlide}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={`${styles.stage} ${isGlitching ? styles.stageGlitching : ''} ${
                    isHovered && !isGlitching ? styles.hoverJitter : ''
                }`}
            >
                {/* Main Base Image */}
                <Image
                    key={currentSrc}
                    src={currentSrc}
                    alt={`Offstage moment ${currentIndex + 1}`}
                    fill
                    sizes="(max-width: 1200px) 100vw, 1200px"
                    priority
                    className={styles.mainImage}
                />

                {/* Glitch Slice Layer 1 (Red/Cyan channel shift) */}
                <Image
                    src={currentSrc}
                    alt=""
                    fill
                    sizes="(max-width: 1200px) 100vw, 1200px"
                    aria-hidden="true"
                    className={styles.sliceA}
                />

                {/* Glitch Slice Layer 2 (Cyan/Acid horizontal tear) */}
                <Image
                    src={currentSrc}
                    alt=""
                    fill
                    sizes="(max-width: 1200px) 100vw, 1200px"
                    aria-hidden="true"
                    className={styles.sliceB}
                />

                {/* Acid Neon Flash Burst */}
                <div className={styles.flashOverlay} />

                {/* VHS Moving Tracking Bar */}
                <div className={styles.trackingBar} />
            </div>

            {/* CRT Fine Scanlines */}
            <div className={styles.scanlines} />

            {/* Bottom-Right Badge */}
            <div className={styles.aboutBadge}>BORN IN BALTIMORE</div>
        </div>
    );
}
