// High-DPI optimized 500x500 WebP photos specifically for the 3D background grid
export const TOTAL_BG_PHOTOS = 40;
export const BG_PHOTOS: string[] = Array.from(
    { length: TOTAL_BG_PHOTOS },
    (_, i) => `/bg/${i + 1}.webp`
);

// Clean list of 140 numbered full-res WebP photos from /media directory (1.webp -> 140.webp)
export const TOTAL_MEDIA_PHOTOS = 140;
export const MEDIA_PHOTOS: string[] = Array.from(
    { length: TOTAL_MEDIA_PHOTOS },
    (_, i) => `/media/${i + 1}.webp`
);

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function getShuffledPhotos(): string[] {
    const arr = [...BG_PHOTOS];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
