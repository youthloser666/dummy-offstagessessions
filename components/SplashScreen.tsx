'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import styles from './SplashScreen.module.css';

interface SplashScreenProps {
  onReveal?: () => void;
  onComplete: () => void;
}

// 6 Curated images for smooth cascading (optimized splash assets)
const LAYER_IMAGES = [
  '/image/splash/1.webp',
  '/image/splash/3.webp',
  '/image/splash/5.webp',
  '/image/splash/8_web.webp',
  '/image/splash/9_web.webp',
  '/image/splash/10_web.webp',
];

export default function SplashScreen({ onReveal, onComplete }: SplashScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const blackCardRef = useRef<HTMLDivElement | null>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);

  const ctxRef = useRef<gsap.Context | null>(null);
  const timelineStarted = useRef(false);

  useEffect(() => {
    // If already viewed in this session, skip immediately
    if (typeof window !== 'undefined' && sessionStorage.getItem('splashSeen') === 'true') {
      onComplete();
      return;
    }

    document.body.style.overflow = 'hidden';

    let isCancelled = false;

    // Start animation without React state update to avoid frame drops
    const triggerAnimation = () => {
      if (isCancelled || timelineStarted.current) return;
      timelineStarted.current = true;
      requestAnimationFrame(() => startCascade());
    };

    const preloadImages = async () => {
      try {
        const allAssets = [...LAYER_IMAGES, '/logo.svg'];
        await Promise.all(
          allAssets.map((src) => {
            const img = new Image();
            img.src = src;
            if (typeof img.decode === 'function') {
              return img.decode().catch(() => {});
            }
            return new Promise<void>((res) => {
              img.onload = () => res();
              img.onerror = () => res();
            });
          })
        );
        if (!isCancelled) {
          triggerAnimation();
        }
      } catch {
        if (!isCancelled) triggerAnimation();
      }
    };

    preloadImages();

    const fallbackTimer = setTimeout(() => {
      triggerAnimation();
    }, 1500);

    return () => {
      isCancelled = true;
      clearTimeout(fallbackTimer);
      ctxRef.current?.revert();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCascade = () => {
    ctxRef.current = gsap.context(() => {
      const tl = gsap.timeline();
      const durationPerLayer = 0.45; 
      const staggerDelay = 0.22; 
      const totalDuration = (LAYER_IMAGES.length - 1) * staggerDelay + durationPerLayer;

      // Make stack visible, bypass react state
      gsap.set(stackRef.current, { opacity: 1 });
      gsap.set(layerRefs.current, { opacity: 0 });
      if (logoRef.current) gsap.set(logoRef.current, { opacity: 0, scale: 0.92, y: 15 });
      
      let lastVal = -1;
      const counterObj = { val: 0 };
      tl.to(counterObj, {
        val: 100,
        duration: totalDuration - 0.1,
        ease: 'none',
        onUpdate: () => {
          const rounded = Math.round(counterObj.val);
          if (rounded !== lastVal && counterRef.current) {
            lastVal = rounded;
            counterRef.current.textContent = `[${rounded}]`;
          }
        }
      }, 0);

      layerRefs.current.forEach((layerEl, i) => {
        if (!layerEl) return;
        
        const isFinalLayer = i === LAYER_IMAGES.length;

        if (isFinalLayer) {
          tl.fromTo(
            layerEl,
            { opacity: 0, scale: 1 },
            {
              opacity: 1,
              scale: 1,
              duration: 0.55,
              ease: 'power2.inOut',
              force3D: true,
            },
            LAYER_IMAGES.length * staggerDelay
          );
        } else {
          tl.fromTo(
            layerEl,
            { 
              scale: 1.04, 
              opacity: 0,
            },
            {
              scale: 1,
              opacity: 1,
              duration: durationPerLayer,
              ease: 'power2.out',
              force3D: true, 
            },
            i * staggerDelay
          );
        }
      });

      // Fade out counter when cascade finishes
      tl.to(counterRef.current, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
      }, LAYER_IMAGES.length * staggerDelay);

      // Reveal Offstage Logo smoothly at the center
      tl.fromTo(logoRef.current, {
        opacity: 0,
        scale: 0.92,
        y: 14,
      }, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.55,
        ease: 'power3.out',
        force3D: true,
      }, LAYER_IMAGES.length * staggerDelay + 0.05);

      // Black card expands uniformly from center to immerse full screen
      tl.to(blackCardRef.current, {
        scale: 16,
        duration: 0.8,
        ease: 'power2.inOut',
        force3D: true,
      }, '+=0.05');

      tl.add(() => {
        if (containerRef.current) {
          containerRef.current.style.background = '#000000';
        }
      }, '-=0.6');

      // Showcase logo before launching upward curtain pull
      tl.add(() => {
        if (onReveal) onReveal();
      }, '+=0.2');

      // Parallax upward drift for the logo
      tl.to(logoRef.current, {
        y: -70,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.in',
        force3D: true,
      }, '<');

      // Curtain smooth upward pull animation into the landing page
      tl.to(containerRef.current, {
        yPercent: -100,
        duration: 1.0,
        ease: 'power3.inOut',
        force3D: true,
        onComplete: () => {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('splashSeen', 'true');
          }
          onComplete();
        },
      }, '<');
    });
  };

  return (
    <div
      ref={containerRef}
      className={styles.bootLoader}
      aria-hidden="true"
    >
      <div 
        ref={stackRef}
        className={styles.bootLoaderStack} 
        style={{ opacity: 0 }} // Starts hidden, GSAP will show it
      >

          {LAYER_IMAGES.map((src, idx) => (
            <div
              key={idx}
              ref={(el) => {
                layerRefs.current[idx] = el;
              }}
              className={styles.bootLoaderLayer}
              style={{ zIndex: idx + 1 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className={styles.bootLoaderImg}
                loading="eager"
                decoding="async"
              />
            </div>
          ))}

          <div
            ref={(el) => {
              blackCardRef.current = el;
              layerRefs.current[LAYER_IMAGES.length] = el;
            }}
            className={`${styles.bootLoaderLayer} ${styles.bootLoaderLayerFinal}`}
            style={{ zIndex: LAYER_IMAGES.length + 1 }}
          />

          {/* Offstage Vector Logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={logoRef}
            src="/logo.svg"
            alt="Offstage Sessions"
            className={styles.offstageLogo}
            style={{ zIndex: LAYER_IMAGES.length + 2 }}
          />

          <div
            ref={counterRef}
            className={styles.counter}
            style={{ zIndex: LAYER_IMAGES.length + 3 }}
          >
            [0]
          </div>

        </div>
    </div>
  );
}
