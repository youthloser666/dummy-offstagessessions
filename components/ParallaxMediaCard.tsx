'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import styles from '@/app/media/media.module.css';

export interface MediaItem {
    id: number;
    name: string;
    image: string;
    date: string;
    venue?: string;
}

export default function ParallaxMediaCard({
    item,
    priority = false,
}: {
    item: MediaItem;
    priority?: boolean;
}) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Track scroll progress of this specific image container across viewport
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start'],
    });

    // Smooth counter-directional parallax scroll translation
    const y = useTransform(scrollYProgress, [0, 1], ['-14%', '14%']);

    return (
        <div
            ref={containerRef}
            className={styles.parallaxCard}
            data-cursor="VIEW GALLERY ↗"
            data-cursor-magnetic="true"
        >
            {/* Parallax Image Container (height: 135% for smooth drift) */}
            <motion.div
                className={styles.parallaxImageWrapper}
                style={{ y }}
            >
                <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 1200px) 100vw, 1200px"
                    priority={priority}
                    className={styles.parallaxImage}
                />
            </motion.div>

            {/* Dark Cinematic Vignette */}
            <div className={styles.parallaxOverlay} />

            {/* Giant Stationary Overlay Typography (pinned over image) */}
            <div className={styles.parallaxContent}>
                <div className={styles.parallaxMetaTop}>
                    <span className={styles.parallaxDate}>{item.date}</span>
                    <span className={styles.parallaxBadge}>OFFSTAGE ARCHIVE</span>
                </div>

                <div className={styles.parallaxMetaBottom}>
                    <h2 className={styles.parallaxTitle}>{item.name}</h2>
                </div>
            </div>
        </div>
    );
}
