'use client';

import React, { useRef, useState, useEffect } from 'react';
import styles from './TiltCard.module.css';

interface TiltCardProps {
    children: React.ReactNode;
    className?: string;
    maxTilt?: number;
    scale?: number;
}

export default function TiltCard({
    children,
    className = '',
    maxTilt = 10,
    scale = 1.03,
}: TiltCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

    const targetRotX = useRef(0);
    const targetRotY = useRef(0);
    const currentRotX = useRef(0);
    const currentRotY = useRef(0);
    const isHovered = useRef(false);
    const rafId = useRef<number | null>(null);

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        // Skip on coarse pointers (touch devices)
        if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
            return;
        }

        const handleMouseMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const px = (x / rect.width) * 2 - 1; // -1 to 1
            const py = (y / rect.height) * 2 - 1; // -1 to 1

            targetRotY.current = px * maxTilt;
            targetRotX.current = -py * maxTilt;

            setGlarePos({
                x: (x / rect.width) * 100,
                y: (y / rect.height) * 100,
                opacity: 0.25,
            });
        };

        const handleMouseEnter = () => {
            isHovered.current = true;
        };

        const handleMouseLeave = () => {
            isHovered.current = false;
            targetRotX.current = 0;
            targetRotY.current = 0;
            setGlarePos((prev) => ({ ...prev, opacity: 0 }));
        };

        const animate = () => {
            // Smooth lerp damping
            currentRotX.current += (targetRotX.current - currentRotX.current) * 0.12;
            currentRotY.current += (targetRotY.current - currentRotY.current) * 0.12;

            if (card) {
                const currentScale = isHovered.current ? scale : 1;
                card.style.transform = `perspective(1000px) rotateX(${currentRotX.current.toFixed(2)}deg) rotateY(${currentRotY.current.toFixed(2)}deg) scale3d(${currentScale}, ${currentScale}, 1)`;
            }

            rafId.current = requestAnimationFrame(animate);
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseenter', handleMouseEnter);
        card.addEventListener('mouseleave', handleMouseLeave);

        rafId.current = requestAnimationFrame(animate);

        return () => {
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseenter', handleMouseEnter);
            card.removeEventListener('mouseleave', handleMouseLeave);
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, [maxTilt, scale]);

    return (
        <div ref={cardRef} className={`${styles.tiltCard} ${className}`}>
            {children}
            <div
                className={styles.glare}
                style={{
                    background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(200, 255, 0, 0.4) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 80%)`,
                    opacity: glarePos.opacity,
                }}
            />
        </div>
    );
}
