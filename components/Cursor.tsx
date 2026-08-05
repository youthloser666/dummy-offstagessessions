'use client';

import { useEffect, useRef } from 'react';

const HOVER_TARGETS = 'a, button, .event-item, .genre-item, .card, .media-item, .product-card';

export default function Cursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const cursor = cursorRef.current;
        const ring = ringRef.current;
        if (!cursor || !ring) return;

        const onMouseMove = (e: MouseEvent) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            ring.style.left = e.clientX + 'px';
            ring.style.top = e.clientY + 'px';
        };

        const onMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest(HOVER_TARGETS)) {
                cursor.style.width = '20px';
                cursor.style.height = '20px';
                ring.style.width = '60px';
                ring.style.height = '60px';
            }
        };

        const onMouseOut = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest(HOVER_TARGETS)) {
                cursor.style.width = '12px';
                cursor.style.height = '12px';
                ring.style.width = '36px';
                ring.style.height = '36px';
            }
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseover', onMouseOver);
        document.addEventListener('mouseout', onMouseOut);

        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseover', onMouseOver);
            document.removeEventListener('mouseout', onMouseOut);
        };
    }, []);

    return (
        <>
            <div className="cursor" id="cursor" ref={cursorRef} />
            <div className="cursor-ring" id="cursorRing" ref={ringRef} />
        </>
    );
}
