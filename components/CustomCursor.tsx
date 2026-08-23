'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
    const dotRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);
    const currentTargetRef = useRef<Element | null>(null);

    // Gunakan useMotionValue murni untuk koordinat X, Y, dan Opacity (Bypass React state)
    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);
    const cursorOpacity = useMotionValue(0);

    // Spring configuration untuk gerakan kursor yang ultra-responsif dan halus
    const springConfig = { damping: 28, stiffness: 500, mass: 0.1 };
    const cursorX = useSpring(mouseX, springConfig);
    const cursorY = useSpring(mouseY, springConfig);

    useEffect(() => {
        // Nonaktifkan pada layar sentuh (touch devices)
        if (typeof window !== 'undefined' && window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
            return;
        }

        // Mutasi MotionValue tanpa memicu re-render React
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
            cursorOpacity.set(1);
        };

        const handleMouseLeave = () => {
            cursorOpacity.set(0);
        };

        const handleMouseEnter = () => {
            cursorOpacity.set(1);
        };

        // ZERO React Re-render: update class list & textContent langsung pada DOM ref
        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            if (!target) return;

            const interactive = target.closest('a, button, [data-cursor], [data-cursor-magnetic], input, textarea');
            
            // Hindari kalkulasi/mutasi DOM jika target hover masih elemen yang sama
            if (currentTargetRef.current === interactive) return;
            currentTargetRef.current = interactive;

            const dot = dotRef.current;
            const textEl = textRef.current;
            if (!dot) return;

            if (interactive) {
                const customLabel = interactive.getAttribute('data-cursor');
                if (customLabel) {
                    if (textEl) textEl.textContent = customLabel;
                    dot.classList.add('has-badge');
                    dot.classList.remove('is-hovered');
                } else {
                    if (textEl) textEl.textContent = '';
                    dot.classList.add('is-hovered');
                    dot.classList.remove('has-badge');
                }
            } else {
                if (textEl) textEl.textContent = '';
                dot.classList.remove('is-hovered');
                dot.classList.remove('has-badge');
            }
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        document.documentElement.addEventListener('mouseleave', handleMouseLeave);
        document.documentElement.addEventListener('mouseenter', handleMouseEnter);
        document.addEventListener('mouseover', handleMouseOver, { passive: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
            document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
            document.removeEventListener('mouseover', handleMouseOver);
        };
    }, [mouseX, mouseY, cursorOpacity]);

    return (
        <motion.div
            className="custom-cursor-root transform-gpu pointer-events-none"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                x: cursorX,
                y: cursorY,
                opacity: cursorOpacity,
                translateX: '-50%',
                translateY: '-50%',
                zIndex: 100000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                willChange: 'transform',
                pointerEvents: 'none',
            }}
        >
            <div
                ref={dotRef}
                className="custom-cursor-dot transform-gpu will-change-transform"
            >
                <span
                    ref={textRef}
                    className="custom-cursor-text transform-gpu"
                />
            </div>
        </motion.div>
    );
}
