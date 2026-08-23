'use client';

import { useReveal } from '@/hooks/useReveal';
import ParallaxMediaCard, { MediaItem } from '@/components/ParallaxMediaCard';
import styles from './media.module.css';

const galleries: MediaItem[] = [
    {
        id: 1,
        name: 'JACKIE HOLLANDER 6.13',
        image: '/image/jackie_web.webp',
        date: 'JUNE 13, 2026 · SOUNDSTAGE',
    },
    {
        id: 2,
        name: 'HONEYLUV 5.02',
        image: '/image/honey_web.webp',
        date: 'MAY 2, 2026 · WAREHOUSE 8',
    },
    {
        id: 3,
        name: 'SHIP WREK 4.10',
        image: '/image/shipwreck_web.webp',
        date: 'APRIL 10, 2026 · POWER PLANT',
    },
    {
        id: 4,
        name: 'TO BE HONEST 5.09',
        image: '/image/tobehonest_web.webp',
        date: 'MAY 9, 2026 · SOUND GARDEN',
    },
    {
        id: 5,
        name: 'NIGHT SWIM 3.28',
        image: '/image/nightswim_web.webp',
        date: 'MARCH 28, 2026 · THE WATERFRONT',
    },
    {
        id: 6,
        name: 'GROW GARDEN 4.25',
        image: '/image/growgarden_web.webp',
        date: 'APRIL 25, 2026 · OPEN AIR DC',
    },
];

export default function MediaPage() {
    useReveal();

    return (
        <div className="bg-transparent" style={{ background: 'transparent' }}>
            {/* Header: MEDIA left, ARCHIVES right */}
            <div className={`${styles.mediaHeader} reveal`}>
                <h1 className={styles.mediaTitle}>MEDIA</h1>
                <h1 className={styles.archivesTitle}>ARCHIVES</h1>
            </div>

            {/* Parallax Gallery Cards (Framer Motion & Grayscale Reveal) */}
            <div className={styles.galleryList}>
                {galleries.map((gallery, idx) => (
                    <div key={gallery.id} className="reveal">
                        <ParallaxMediaCard
                            item={gallery}
                            priority={idx === 0}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
