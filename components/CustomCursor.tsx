'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
    const [isHovered, setIsHovered] = useState(false);
    const [cursorText, setCursorText] = useState('');

    // Gunakan useMotionValue murni untuk koordinat X, Y, dan Opacity (Bypass React state)
    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);
    const cursorOpacity = useMotionValue(0);

    // Spring configuration untuk gerakan ultra-responsif (stiffness: 500, damping: 28)
    const springConfig = { damping: 28, stiffness: 500, mass: 0.1 };
    const cursorX = useSpring(mouseX, springConfig);
    const cursorY = useSpring(mouseY, springConfig);

    useEffect(() => {
        // Nonaktifkan pada layar sentuh (touch devices)
        if (typeof window !== 'undefined' && window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
            return;
        }

        // Langsung mutasi MotionValue tanpa memicu re-render React sama sekali
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

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            if (!target) return;

            const interactive = target.closest('a, button, [data-cursor], [data-cursor-magnetic], input, textarea');
            if (interactive) {
                setIsHovered(true);
                const customLabel = interactive.getAttribute('data-cursor');
                setCursorText(customLabel || '');
            } else {
                setIsHovered(false);
                setCursorText('');
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
            className="transform-gpu pointer-events-none"
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
            {/* 16px Acid Green Dot / Capsule */}
            <motion.div
                animate={{
                    width: cursorText ? 'auto' : isHovered ? 38 : 16,
                    height: cursorText ? 28 : isHovered ? 38 : 16,
                    borderRadius: cursorText ? 14 : 9999,
                    backgroundColor: cursorText
                        ? 'rgba(5, 5, 5, 0.92)'
                        : isHovered
                        ? 'rgba(0, 255, 0, 0.15)'
                        : 'var(--acid, #00FF00)',
                    border: cursorText
                        ? '1px solid var(--acid, #00FF00)'
                        : isHovered
                        ? '1.5px solid var(--acid, #00FF00)'
                        : 'none',
                    boxShadow: isHovered
                        ? '0 0 20px rgba(0, 255, 0, 0.55), inset 0 0 10px rgba(0, 255, 0, 0.2)'
                        : '0 0 14px rgba(0, 255, 0, 0.85)',
                    padding: cursorText ? '0 12px' : '0px',
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {cursorText && (
                    <span
                        style={{
                            color: 'var(--acid, #00FF00)',
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '9px',
                            fontWeight: 700,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {cursorText}
                    </span>
                )}
            </motion.div>
        </motion.div>
    );
}
