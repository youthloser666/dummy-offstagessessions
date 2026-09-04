'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function CustomCursor() {
    const pathname = usePathname();
    const dotRef = useRef<HTMLDivElement>(null);
    const pillRef = useRef<HTMLDivElement>(null);
    const pillTitleRef = useRef<HTMLSpanElement>(null);
    const pillMetaRef = useRef<HTMLSpanElement>(null);

    // Reset when pathname changes
    useEffect(() => {
        if (dotRef.current) dotRef.current.classList.remove('is-hovering');
        if (pillRef.current) pillRef.current.classList.remove('is-visible');
    }, [pathname]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

        const dot = dotRef.current;
        const pill = pillRef.current;
        const pillTitle = pillTitleRef.current;
        const pillMeta = pillMetaRef.current;
        if (!dot || !pill) return;

        const mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const currentPos = { x: mousePos.x, y: mousePos.y };
        let animationFrameId: number;

        const onMouseMove = (e: MouseEvent) => {
            mousePos.x = e.clientX;
            mousePos.y = e.clientY;
            dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
        };

        const updatePill = () => {
            currentPos.x += (mousePos.x - currentPos.x) * 0.15;
            currentPos.y += (mousePos.y - currentPos.y) * 0.15;
            pill.style.transform = `translate3d(${currentPos.x + 20}px, ${currentPos.y + 20}px, 0)`;
            animationFrameId = requestAnimationFrame(updatePill);
        };
        animationFrameId = requestAnimationFrame(updatePill);

        const onMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            if (!target) return;

            const hoverable = target.closest('a, button, [data-hover], [data-cursor], input, textarea');
            if (hoverable) {
                dot.classList.add('is-hovering');
                const customLabel = hoverable.getAttribute('data-cursor');
                if (customLabel) {
                    if (pillTitle) pillTitle.textContent = customLabel;
                    if (pillMeta) {
                        const meta = hoverable.getAttribute('data-cursor-meta') || '';
                        pillMeta.textContent = meta ? `| ${meta}` : '';
                    }
                    pill.classList.add('is-visible');
                } else {
                    pill.classList.remove('is-visible');
                }
            } else {
                dot.classList.remove('is-hovering');
                pill.classList.remove('is-visible');
            }
        };

        const onMouseLeave = () => {
            dot.style.opacity = '0';
            pill.classList.remove('is-visible');
        };

        const onMouseEnter = () => {
            dot.style.opacity = '1';
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        document.addEventListener('mouseover', onMouseOver, { passive: true });
        document.documentElement.addEventListener('mouseleave', onMouseLeave);
        document.documentElement.addEventListener('mouseenter', onMouseEnter);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseover', onMouseOver);
            document.documentElement.removeEventListener('mouseleave', onMouseLeave);
            document.documentElement.removeEventListener('mouseenter', onMouseEnter);
        };
    }, []);

    return (
        <>
            <div ref={dotRef} className="cursor-dot" />
            <div ref={pillRef} className="cursor-pill">
                <span className="cursor-pill__arrow">↗</span>
                <span ref={pillTitleRef} className="cursor-pill__title">VIEW</span>
                <span ref={pillMetaRef} className="cursor-pill__meta" />
            </div>
        </>
    );
}
