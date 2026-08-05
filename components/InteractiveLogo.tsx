'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import styles from './InteractiveLogo.module.css';

export default function InteractiveLogo() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    // Ambient glow pulse
    const glowEl = glowRef.current;
    if (glowEl) {
      gsap.to(glowEl, {
        opacity: 0.35,
        scale: 1.15,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }

    // Mouse-follow tilt
    const handleMouseMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      gsap.to(wrap, {
        rotateY: dx * 12,
        rotateX: -dy * 8,
        duration: 0.6,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(wrap, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.8,
        ease: 'elastic.out(1, 0.4)',
      });
    };

    wrap.addEventListener('mousemove', handleMouseMove);
    wrap.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      wrap.removeEventListener('mousemove', handleMouseMove);
      wrap.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Glitch burst on click
  const handleClick = () => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    wrap.classList.add(styles.glitchBurst);
    setTimeout(() => wrap.classList.remove(styles.glitchBurst), 600);
  };

  return (
    <div
      ref={wrapRef}
      className={`${styles.logoWrap} ${isHovered ? styles.hovered : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      style={{ perspective: '800px' }}
    >
      {/* Ambient glow behind logo */}
      <div ref={glowRef} className={styles.ambientGlow} />

      {/* Main logo */}
      <Image
        ref={imgRef}
        src="/offsatge-logo.svg"
        alt="Offstage Sessions"
        width={1500}
        height={304}
        priority
        className={`${styles.logo} reveal`}
      />

      {/* Glitch layers (always active) */}
      <Image
        src="/offsatge-logo.svg"
        alt=""
        width={1500}
        height={304}
        aria-hidden
        className={`${styles.logo} ${styles.glitchLayer} ${styles.glitchR}`}
      />
      <Image
        src="/offsatge-logo.svg"
        alt=""
        width={1500}
        height={304}
        aria-hidden
        className={`${styles.logo} ${styles.glitchLayer} ${styles.glitchB}`}
      />
    </div>
  );
}
