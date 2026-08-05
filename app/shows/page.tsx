'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useReveal } from '@/hooks/useReveal';
import { shows } from '@/lib/data';
import styles from './shows.module.css';

const FILTERS = ['All', 'House', 'Techno', 'Bass', 'Free Events'];

export default function ShowsPage() {
    useReveal();
    const [activeFilter, setActiveFilter] = useState('All');

    // Filter shows based on activeFilter
    const filteredShows = shows.filter((show) => {
        if (activeFilter === 'All') return true;
        if (activeFilter === 'Free Events') return show.tags.includes('Free');
        return show.tags.includes(activeFilter);
    });

    const featuredShow = filteredShows.find((s) => s.featured) || filteredShows[0];
    const remainingShows = filteredShows.filter((s) => s !== featuredShow);

    // Group by month
    const groupedByMonth = remainingShows.reduce((groups, show) => {
        if (!groups[show.month]) groups[show.month] = [];
        groups[show.month].push(show);
        return groups;
    }, {} as Record<string, typeof shows>);

    return (
        <main>
            <div className="page-hero">
                <div className="page-hero-label">Events & Tickets</div>
                <h1 className="page-hero-title reveal">
                    UP<br />COMING<br /><em>Shows</em>
                </h1>
                <div className="page-hero-bg-text">Shows</div>
            </div>

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
                {featuredShow && (
                    <>
                        <div className={`${styles.monthLabel} reveal`}>Featured Event</div>
                        <div id={`show-${featuredShow.id}`} className={`${styles.eventFeatured} reveal`}>
                            <div className={styles.eventFeaturedImg}>
                                <Image
                                    src={featuredShow.poster}
                                    alt={featuredShow.name}
                                    width={800}
                                    height={600}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <div className={styles.eventFeaturedContent}>
                                <div>
                                    <div className={styles.featuredBadge}>
                                        Headliner — {featuredShow.month}
                                    </div>
                                    <div className={styles.featuredTitle}>{featuredShow.name}</div>
                                    {featuredShow.subtitle && (
                                        <div style={{ color: 'var(--acid)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.1em' }}>
                                            {featuredShow.subtitle}
                                        </div>
                                    )}
                                    <div className={styles.featuredMeta}>
                                        {featuredShow.venue}
                                        <br />
                                        {featuredShow.time}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                                        {featuredShow.tags.map((tag) => (
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
                                    <a href="#" className={styles.featuredCta}>
                                        GET TICKETS
                                    </a>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {Object.entries(groupedByMonth).map(([month, monthShows]) => (
                    <div key={month} className={styles.monthGroup}>
                        <div className={`${styles.monthLabel} reveal`}>{month}</div>
                        {monthShows.map((show, idx) => (
                            <div
                                key={show.id}
                                id={`show-${show.id}`}
                                className={`${styles.eventItem} reveal`}
                            >
                                <div className={styles.eventDate} dangerouslySetInnerHTML={{ __html: show.date }} />
                                <div className={styles.eventNum}>0{idx + 1}</div>
                                <div>
                                    <div className={styles.eventName}>{show.name}</div>
                                    {show.subtitle && (
                                        <div style={{ color: 'var(--acid)', fontSize: '0.75rem', fontWeight: 700, marginTop: '2px' }}>
                                            {show.subtitle}
                                        </div>
                                    )}
                                    <div className={styles.eventVenue}>{show.venue}</div>
                                </div>
                                <div className={styles.eventTime}>{show.time}</div>
                                <div className={styles.eventTags}>
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
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </main>
    );
}
