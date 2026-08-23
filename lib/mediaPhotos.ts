// Clean list of 140 numbered WebP photos from /media directory (1.webp -> 140.webp)
export const TOTAL_MEDIA_PHOTOS = 140;

export const MEDIA_PHOTOS: string[] = Array.from(
    { length: TOTAL_MEDIA_PHOTOS },
    (_, i) => `/media/${i + 1}.webp`
);

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function getShuffledPhotos(): string[] {
    const arr = [...MEDIA_PHOTOS];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
