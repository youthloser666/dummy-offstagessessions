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
    const [loading, setLoading] = useState(initialMedia.length === 0);

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
            .catch((err) => console.warn('Media live fetch failed:', err))
            .finally(() => setLoading(false));
    }, []);

    useReveal([galleryItems, loading]);

    return (
        <div className="bg-transparent" style={{ background: 'transparent' }}>
            {/* Header: MEDIA left, ARCHIVES right */}
            <div className={`${styles.mediaHeader} reveal`}>
                <h1 className={styles.mediaTitle}>MEDIA</h1>
                <h1 className={styles.archivesTitle}>ARCHIVES</h1>
            </div>

            {/* Parallax Gallery Cards (Framer Motion & Grayscale Reveal) */}
            <div className={styles.galleryList}>
                {loading ? (
                    [1, 2, 3].map((n) => (
                        <div
                            key={n}
                            style={{
                                width: '100%',
                                height: '70vh',
                                minHeight: '450px',
                                position: 'relative',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                marginBottom: '40px',
                            }}
                        >
                            <div
                                className="skeletonShimmer"
                                style={{ width: '100%', height: '100%' }}
                            />
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: '30px',
                                    left: '30px',
                                    right: '30px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-end',
                                }}
                            >
                                <div>
                                    <div className="skeletonShimmer" style={{ width: '120px', height: '16px', marginBottom: '12px' }} />
                                    <div className="skeletonShimmer" style={{ width: '320px', height: '36px' }} />
                                </div>
                                <div className="skeletonShimmer" style={{ width: '140px', height: '36px', borderRadius: '20px' }} />
                            </div>
                        </div>
                    ))
                ) : galleryItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px 0', color: '#86868b' }}>
                        No media archives available at this time.
                    </div>
                ) : (
                    galleryItems.map((gallery, idx) => (
                        <div key={gallery.id} className="reveal">
                            <ParallaxMediaCard
                                item={gallery}
                                priority={idx === 0}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
