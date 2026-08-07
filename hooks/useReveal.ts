'use client';

import { useEffect } from 'react';

export function useReveal(dependencies: any[] = []) {
    useEffect(() => {
        const revealEls = document.querySelectorAll('.reveal');
        if (!revealEls.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.remove('exit');
                        entry.target.classList.add('visible');
                    } else if (entry.boundingClientRect.bottom < 0) {
                        // Don't trigger exit if element is inside a horizontal scroll container
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
