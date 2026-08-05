'use client';

import { useReveal } from '@/hooks/useReveal';
import styles from './media.module.css';

const galleries = [
    {
        id: 1,
        name: 'JACKIE HOLLANDER 6.13',
        image: '/image/jackie.png',
    },
    {
        id: 2,
        name: 'HONEYLUV 5.2',
        image: '/image/honey.png',
    },
    {
        id: 3,
        name: 'SHIP WREK 4.10',
        image: '/image/shipwreck.png',
    },
];

export default function MediaPage() {
    useReveal();

    return (
        <main>
            {/* Header */}
            <div className={styles.mediaHeader}>
                <h1 className={styles.mediaTitle}>MEDIA</h1>
                <h1 className={styles.archivesTitle}>ARCHIVES</h1>
            </div>

            {/* Gallery Bands */}
            <div className={styles.galleryList}>
                {galleries.map((gallery) => (
                    <a
                        key={gallery.id}
                        href="#"
                        className={`${styles.galleryBand} reveal`}
                    >
                        <img
                            src={gallery.image}
                            alt={gallery.name}
                            className={styles.galleryImage}
                        />
                        <div className={styles.galleryOverlay} />
                        <h2 className={styles.galleryName}>{gallery.name}</h2>
                    </a>
                ))}
            </div>
        </main>
    );
}
