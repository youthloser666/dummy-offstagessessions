'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useReveal } from '@/hooks/useReveal';
import { shows } from '@/lib/data';
import styles from './shows.module.css';

const FILTERS = ['All', 'House', 'Techno', 'Bass', 'Free Events'];

export default function ShowsPage() {
    const [activeFilter, setActiveFilter] = useState('All');
    useReveal([activeFilter]);

    // Filter shows based on activeFilter
    const filteredShows = shows.filter((show) => {
        if (activeFilter === 'All') return true;
        if (activeFilter === 'Free Events') return show.tags.includes('Free');
        return show.tags.includes(activeFilter);
    });



    return (
        <main>
            <div className={`${styles.filterBar} reveal`}>
                {FILTERS.map((filter) => (
                    <button
                        key={filter}
                        className={`${styles.filterBtn} ${activeFilter === filter ? styles.filterBtnActive : ''
                            }`}
                        onClick={() => setActiveFilter(filter)}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            <div className={styles.showsSection}>
                <div className={styles.showsGrid}>
                    {filteredShows.map((show) => (
                        <div
                            key={show.id}
                            id={`show-${show.id}`}
                            className={`${styles.showsGridCard} reveal`}
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
                                                        : tag === 'Bass'
                                                            ? styles.tagBass
                                                            : styles.tagFree
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
                                    >
                                        GET TICKETS ↗
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
