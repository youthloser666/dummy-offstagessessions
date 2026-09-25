'use client';

import { useEffect } from 'react';

export function useReveal(dependencies: any[] = []) {
    useEffect(() => {
        const revealEls = document.querySelectorAll('.reveal');
        if (!revealEls.length) return;

        const isMobileTouch =
            typeof window !== 'undefined' &&
            (window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
             (window.innerWidth < 840 && ('ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0)));

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.remove('exit');
                        entry.target.classList.add('visible');
                        // On mobile: reveal once to avoid repeated style recalculations & transitions during rapid scroll
                        if (isMobileTouch) {
                            observer.unobserve(entry.target);
                        }
                    } else if (!isMobileTouch && entry.boundingClientRect.bottom < 0) {
                        // Desktop only: trigger exit if scrolled past top
                        const isPinned = entry.target.closest('[class*="hScrollContainer"]');
                        if (!isPinned) {
                            entry.target.classList.remove('visible');
                            entry.target.classList.add('exit');
                        }
                    }
                });
            },
            { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
        );

        revealEls.forEach((el) => observer.observe(el));

        return () => {
            revealEls.forEach((el) => observer.unobserve(el));
            observer.disconnect();
        };
    }, dependencies);
}
