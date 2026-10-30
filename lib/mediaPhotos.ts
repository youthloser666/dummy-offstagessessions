// High-DPI optimized WebP photos specifically for the 3D background grid
const TOTAL_BG_PHOTOS = 134;
const BG_PHOTOS: string[] = Array.from(
    { length: TOTAL_BG_PHOTOS },
    (_, i) => `/bg/${i + 1}.webp`
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
