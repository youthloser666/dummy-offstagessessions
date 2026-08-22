'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useAnimationFrame, useScroll, useVelocity } from 'framer-motion';
import Image from 'next/image';

/* ─────────────────────────────────────────────
   Kumpulan aset foto WebP terkompresi
   ───────────────────────────────────────────── */
const PHOTOS: string[] = [
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
  '/image/growgarden_web.webp',
  '/image/honey_web.webp',
  '/image/jackie_web.webp',
  '/image/latecheckout_web.webp',
  '/image/nightswim_web.webp',
  '/image/shipwreck_web.webp',
  '/image/tobehonest_web.webp',
];

export default function CollageBackground() {
  // ── KONSTANTA HELIX ──
  const itemsPerRev = 15;
  const yStep = 50;

  // 1. Duplikasi masif — 8x lipat foto asli agar buffer selalu berlimpah
  const allImages = useMemo(() => {
    const base = [...PHOTOS, ...PHOTOS, ...PHOTOS, ...PHOTOS,
    ...PHOTOS, ...PHOTOS, ...PHOTOS, ...PHOTOS]; // 8x = 136 gambar
    return base;
  }, []);

  // Jumlah item = kelipatan itemsPerRev terdekat (di bawah) dari total gambar
  // Agar rotasi selalu presisi di kelipatan 360°
  const itemCount = Math.floor(allImages.length / itemsPerRev) * itemsPerRev; // 135

  // Jarak 1 "cycle" = jumlah foto asli dibulatkan ke kelipatan itemsPerRev
  const cycleItems = Math.ceil(PHOTOS.length / itemsPerRev) * itemsPerRev; // 30
  const resetDistance = cycleItems * yStep; // 3000px = tepat 2 putaran (720°)

  const degPerPixel = 360 / (itemsPerRev * yStep); // 0.24°/px

  // Ref untuk direct DOM update (bypass Framer Motion lag)
  const sceneRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0); // offset Y terus bertambah

  // Scroll tracking
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);

  // Pre-compute posisi helix statis
  const helixItems = useMemo(() => {
    const startOffset = -Math.floor(itemCount / 2);
    return Array.from({ length: itemCount }, (_, idx) => {
      const stepIndex = startOffset + idx;
      return {
        key: `h-${idx}`,
        src: allImages[idx % allImages.length],
        angle: stepIndex * (360 / itemsPerRev),
        yPos: stepIndex * yStep,
      };
    });
  }, [allImages, itemCount, itemsPerRev, yStep]);

  // ── ANIMATION: Direct DOM, single transform string, ZERO lag ──
  useAnimationFrame((_, delta) => {
    if (!sceneRef.current) return;
    const dt = delta / 1000;

    const fmVel = scrollVelocity.get();
    const lenisVel =
      typeof window !== 'undefined'
        ? (window as any).__lenis?.velocity || 0
        : 0;
    const activeVel =
      Math.abs(fmVel) > Math.abs(lenisVel) ? fmVel : lenisVel;

    const speed = (35 + Math.abs(activeVel) * 0.25) * dt;
    offsetRef.current += speed;

    // Reset dengan overshoot: saat melewati 1 cycle, kurangi resetDistance
    // Ini menjaga presisi sub-pixel DAN memastikan rotasi = kelipatan 720°
    if (offsetRef.current >= resetDistance) {
      offsetRef.current -= resetDistance;
    }

    const currentY = -offsetRef.current;
    const currentRotY = offsetRef.current * degPerPixel;

    // ★ KUNCI: Update Y + rotateY dalam SATU transform string di frame yang SAMA
    // Tidak ada lag 1-frame karena tidak pakai useTransform
    sceneRef.current.style.transform =
      `rotateX(-12deg) rotateY(${currentRotY}deg) translateY(${currentY}px)`;
  });

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        pointerEvents: 'none',
        perspective: '1200px',
        perspectiveOrigin: '50% 50%',
      }}
    >
      {/* 3D Helix Scene — posisi di center body */}
      <div
        ref={sceneRef}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 0,
          height: 0,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
          // Initial transform (akan di-override oleh useAnimationFrame)
          transform: 'rotateX(-12deg) rotateY(0deg) translateY(0px)',
        }}
      >
        {helixItems.map((item) => (
          <div
            key={item.key}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 'clamp(140px, 16vw, 220px)',
              height: 'clamp(185px, 21vw, 290px)',
              marginLeft: 'calc(-1 * clamp(140px, 16vw, 220px) / 2)',
              marginTop: 'calc(-1 * clamp(185px, 21vw, 290px) / 2)',
              transform: `rotateY(${item.angle}deg) translateY(${item.yPos}px) translateZ(clamp(360px, 45vw, 680px))`,
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'visible',
            }}
            className="overflow-hidden rounded-sm pointer-events-none"
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                borderRadius: '2px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                background: '#0a0a0a',
              }}
            >
              <Image
                src={item.src}
                alt=""
                fill
                sizes="(max-width: 768px) 35vw, 18vw"
                priority={false}
                loading="lazy"
                quality={35}
                className="grayscale opacity-20 object-cover w-full h-full"
                style={{
                  objectFit: 'cover',
                  filter: 'grayscale(100%)',
                  opacity: 0.22,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
