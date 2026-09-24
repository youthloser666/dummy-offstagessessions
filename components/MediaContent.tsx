'use client';

import { useState, useEffect } from 'react';
import { useReveal } from '@/hooks/useReveal';
import ParallaxMediaCard, { MediaItem } from '@/components/ParallaxMediaCard';
import styles from '@/app/media/media.module.css';

interface MediaContentProps {
    initialMedia?: MediaItem[];
}

export default function MediaContent({ initialMedia = [] }: MediaContentProps) {
    const [galleryItems, setGalleryItems] = useState<MediaItem[]>(initialMedia);

    // Sync with live media if client navigates without full page reload
    useEffect(() => {
        fetch('/api/media', { cache: 'no-store' })
            .then((res) => res.json())
            .then((json) => {
                if (json.success && Array.isArray(json.data)) {
                    setGalleryItems(
                        json.data.map((item: any) => ({
                            id: item.id,
                            name: item.name,
                            image: item.image || item.image_url || item.thumbnail || item.thumbnail_url,
                            date: item.date,
                            facebookUrl: item.facebookUrl || item.facebook_url,
                        }))
                    );
                }
            })
            .catch((err) => console.warn('Media live fetch failed:', err));
    }, []);

    useReveal([galleryItems]);

    return (
        <div className="bg-transparent" style={{ background: 'transparent' }}>
            {/* Header: MEDIA left, ARCHIVES right */}
            <div className={`${styles.mediaHeader} reveal`}>
                <h1 className={styles.mediaTitle}>MEDIA</h1>
                <h1 className={styles.archivesTitle}>ARCHIVES</h1>
            </div>

            {/* Parallax Gallery Cards (Framer Motion & Grayscale Reveal) */}
            <div className={styles.galleryList}>
                {galleryItems.map((gallery, idx) => (
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
