'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useVelocity, useTransform, AnimatePresence } from 'framer-motion';
import { useReveal } from '@/hooks/useReveal';
import { shows, Show } from '@/lib/data';
import styles from './shows.module.css';

const FILTERS = ['All', 'House', 'Techno', 'Bass'];

export default function ShowsPage() {
    const [activeFilter, setActiveFilter] = useState('All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [hoveredShow, setHoveredShow] = useState<Show | null>(null);

    useReveal([activeFilter, viewMode]);

    // Framer Motion mouse tracking for floating poster
    const mouseX = useMotionValue(-500);
    const mouseY = useMotionValue(-500);

    // Spring configuration for aesthetic elastic physics
    const springConfig = { damping: 22, stiffness: 220, mass: 0.5 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    // Dynamic velocity-based rotation tilt
    const xVelocity = useVelocity(mouseX);
    const rotate = useTransform(xVelocity, [-1200, 0, 1200], [-10, 0, 10]);
    const springRotate = useSpring(rotate, { damping: 25, stiffness: 280 });

    useEffect(() => {
        if (viewMode !== 'list') return;

        const handleMouseMove = (e: MouseEvent) => {
            // Offset preview card slightly to the right and above cursor
            mouseX.set(e.clientX + 24);
            mouseY.set(e.clientY - 130);
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [viewMode, mouseX, mouseY]);

    // Filter shows based on activeFilter
    const filteredShows = shows.filter((show) => {
        if (activeFilter === 'All') return true;
        return show.tags.includes(activeFilter);
    });

    return (
        <div className="bg-transparent" style={{ background: 'transparent' }}>
            <div className={`${styles.filterBar} reveal`}>
                <div className={styles.filterGroup}>
                    {FILTERS.map((filter) => (
                        <button
                            key={filter}
                            className={`${styles.filterBtn} ${activeFilter === filter ? styles.filterBtnActive : ''
                                }`}
                            onClick={() => setActiveFilter(filter)}
                            data-cursor-magnetic="true"
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* View Switcher: GRID vs LIST */}
                <div className={styles.viewToggleGroup}>
                    <button
                        className={`${styles.viewToggleBtn} ${viewMode === 'grid' ? styles.viewToggleBtnActive : ''}`}
                        onClick={() => setViewMode('grid')}
                        data-cursor-magnetic="true"
                    >
                        <span>▦</span> GRID
                    </button>
                    <button
                        className={`${styles.viewToggleBtn} ${viewMode === 'list' ? styles.viewToggleBtnActive : ''}`}
                        onClick={() => setViewMode('list')}
                        data-cursor-magnetic="true"
                    >
                        <span>☰</span> LIST
                    </button>
                </div>
            </div>

            <div className={styles.showsSection}>
                {viewMode === 'grid' ? (
                    /* ---- GRID VIEW ---- */
                    <div className={styles.showsGrid}>
                        {filteredShows.map((show) => (
                            <div
                                key={show.id}
                                id={`show-${show.id}`}
                                className={`${styles.showsGridCard} reveal`}
                                data-cursor="VIEW"
                            >
                                <Image
                                    src={show.poster}
                                    alt={show.name}
                                    width={600}
                                    height={800}
                                    className={styles.showsGridCardImg}
                                />
                                <div className={styles.showsGridCardOverlay} />
                                <div className={styles.showsGridCardInfo}>
                                    <div className={styles.showDate}>{show.dateCode}</div>
                                    <h3 className={styles.showName}>{show.name}</h3>
                                    {show.subtitle && <div className={styles.showSub}>{show.subtitle}</div>}
                                    <div className={styles.showVenue}>{show.venue}</div>
                                    <div className={styles.tagsRow}>
                                        {show.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className={`${styles.tag} ${tag === 'House'
                                                        ? styles.tagHouse
                                                        : tag === 'Techno'
                                                            ? styles.tagTechno
                                                            : styles.tagBass
                                                    }`}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    {show.ticketUrl && (
                                        <a
                                            href={show.ticketUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.ticketBtn}
                                            data-cursor="MORE INFO"
                                            data-cursor-magnetic="true"
                                        >
                                            MORE INFORMATION
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* ---- LIST VIEW (K95 Style with Floating Poster Preview) ---- */
                    <div className={styles.showsList}>
                        {filteredShows.map((show) => (
                            <div
                                key={show.id}
                                id={`show-${show.id}`}
                                className={`${styles.showsListItem} reveal`}
                                onMouseEnter={() => setHoveredShow(show)}
                                onMouseLeave={() => setHoveredShow((cur) => (cur?.id === show.id ? null : cur))}
                                data-cursor="VIEW"
                            >
                                <div className={styles.listDate}>{show.dateCode}</div>
                                <div className={styles.listTitleCol}>
                                    <h3 className={styles.listName}>{show.name}</h3>
                                    {show.subtitle && <div className={styles.listSub}>{show.subtitle}</div>}
                                </div>
                                <div className={styles.listVenue}>{show.venue}</div>
                                <div className={styles.listTags}>
                                    {show.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className={`${styles.tag} ${tag === 'House'
                                                    ? styles.tagHouse
                                                    : tag === 'Techno'
                                                        ? styles.tagTechno
                                                        : styles.tagBass
                                                }`}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                {show.ticketUrl ? (
                                    <a
                                        href={show.ticketUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.ticketBtn}
                                        data-cursor="MORE INFO"
                                        data-cursor-magnetic="true"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        MORE INFORMATION
                                    </a>
                                ) : (
                                    <span className={styles.ticketBtn} style={{ opacity: 0.4 }}>
                                        SOON
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Poster Preview Container (Framer Motion Elastic Cursor Following) */}
            <AnimatePresence>
                {viewMode === 'list' && hoveredShow && (
                    <motion.div
                        className={styles.floatingPoster}
                        style={{
                            x: springX,
                            y: springY,
                            rotate: springRotate,
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            pointerEvents: 'none',
                            zIndex: 40,
                        }}
                        initial={{ opacity: 0, scale: 0.82 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.82 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        aria-hidden="true"
                    >
                        <Image
                            src={hoveredShow.poster}
                            alt={hoveredShow.name}
                            width={400}
                            height={533}
                            className={styles.floatingPosterImg}
                            priority
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

