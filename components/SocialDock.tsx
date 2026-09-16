'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import styles from './SocialDock.module.css';

export const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    url: 'https://instagram.com/offstagesession',
    cursorLabel: 'INSTAGRAM',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    ),
  },
  {
    name: 'TikTok',
    url: 'https://www.tiktok.com/@offstagesessions',
    cursorLabel: 'TIKTOK',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.3 6.3 0 0 0 1.86-4.49V8.69a8.18 8.18 0 0 0 4.91 1.63V6.87a4.85 4.85 0 0 1-1-.18z"/>
      </svg>
    ),
  },
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/offstagesessions',
    cursorLabel: 'FACEBOOK',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
];

export default function SocialDock() {
  const pathname = usePathname();
  const isLanding = pathname === '/';

  // Landing page starts hidden until scrolling past hero; subpages are enabled immediately
  const [isPastHero, setIsPastHero] = useState(!isLanding);
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  // 1. Monitor scroll position on landing page (hide at hero / page 1 fold)
  useEffect(() => {
    if (!isLanding) {
      setIsPastHero(true);
      return;
    }

    const checkHeroThreshold = () => {
      // Hero section on landing page occupies 100vh
      // Floating dock appears once scrolled past 40% of viewport
      const threshold = window.innerHeight * 0.4;
      const currentScroll = window.scrollY || document.documentElement.scrollTop || 0;
      setIsPastHero(currentScroll > threshold);
    };

    checkHeroThreshold();
    window.addEventListener('scroll', checkHeroThreshold, { passive: true });

    // Also attach to Lenis scroll instance if active
    const lenis = (window as any).__lenis;
    if (lenis && typeof lenis.on === 'function') {
      lenis.on('scroll', checkHeroThreshold);
    }

    return () => {
      window.removeEventListener('scroll', checkHeroThreshold);
      if (lenis && typeof lenis.off === 'function') {
        lenis.off('scroll', checkHeroThreshold);
      }
    };
  }, [isLanding, pathname]);

  // 2. Monitor footer intersection to hide floating dock when reaching footer
  useEffect(() => {
    setIsFooterVisible(false);

    let observer: IntersectionObserver | null = null;
    const setupObserver = () => {
      const footerEl = document.getElementById('contact') || document.querySelector('footer');
      if (!footerEl) return;

      observer = new IntersectionObserver(
        ([entry]) => {
          setIsFooterVisible(entry.isIntersecting);
        },
        {
          root: null,
          rootMargin: '0px',
          threshold: 0.05,
        }
      );

      observer.observe(footerEl);
    };

    // Small delay to let page layout recalculate on route navigation
    const timer = setTimeout(setupObserver, 100);

    return () => {
      clearTimeout(timer);
      if (observer) observer.disconnect();
    };
  }, [pathname]);

  // Visible when:
  // - On landing: must be past hero AND footer not visible
  // - On other pages (/shows, /media, /shop): always enabled from top, hides only when reaching footer
  const isVisible = (!isLanding || isPastHero) && !isFooterVisible;

  return (
    <aside
      className={`${styles.socialDockDesktop} ${!isVisible ? styles.isHidden : ''}`}
      aria-label="Social Media Links"
    >
      {SOCIAL_LINKS.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.socialBtn}
          aria-label={link.name}
          data-cursor={link.cursorLabel}
          data-cursor-magnetic="true"
        >
          {link.icon}
        </a>
      ))}
    </aside>
  );
}
