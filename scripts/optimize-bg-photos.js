const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const INPUT_DIR = path.join(__dirname, '..', 'public', 'media');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'bg');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function optimizeBackgroundPhotos() {
    console.log('🚀 Starting high-DPI crisp background photo optimization...');
    
    // We will optimize up to 50 photos for the background grid pool
    const targetCount = 40;
    let processed = 0;
    let totalOriginalBytes = 0;
    let totalOptimizedBytes = 0;

    for (let i = 1; i <= targetCount; i++) {
        const inputPath = path.join(INPUT_DIR, `${i}.webp`);
        const outputPath = path.join(OUTPUT_DIR, `${i}.webp`);

        if (!fs.existsSync(inputPath)) {
            console.warn(`File ${inputPath} does not exist, skipping.`);
            continue;
        }

        const origSize = fs.statSync(inputPath).size;
        totalOriginalBytes += origSize;

        // 500x500 square cover fit with Lanczos3 resampling and subtle unsharp masking for crystal clarity
        await sharp(inputPath)
            .resize(500, 500, {
                fit: 'cover',
                position: 'center',
                kernel: sharp.kernel.lanczos3
            })
            .sharpen({
                sigma: 0.6,
                m1: 0.4,
                m2: 0.4
            })
            .webp({
                quality: 82,
                effort: 6,
                smartSubsample: true
            })
            .toFile(outputPath);

        const newSize = fs.statSync(outputPath).size;
        totalOptimizedBytes += newSize;
        processed++;

        console.log(`✅ [${i}/${targetCount}] Optimized ${i}.webp: ${(origSize / 1024).toFixed(1)} KB -> ${(newSize / 1024).toFixed(1)} KB`);
    }

    console.log('\n=========================================');
    console.log(`🎉 Optimization Complete!`);
    console.log(`📸 Processed: ${processed} photos`);
    console.log(`📦 Original Size: ${(totalOriginalBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`⚡ Optimized Size: ${(totalOptimizedBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📉 Bandwidth Saved: ${(((totalOriginalBytes - totalOptimizedBytes) / totalOriginalBytes) * 100).toFixed(1)}% reduction!`);
    console.log('=========================================\n');
}

optimizeBackgroundPhotos().catch(err => {
    console.error('Error optimizing photos:', err);
    process.exit(1);
});
