import { NextRequest, NextResponse } from 'next/server';
import { uploadMedia, isCloudinaryConfigured } from '@/lib/cloudinary';
import sharp from 'sharp';

/**
 * Optimizes an input image buffer using sharp:
 * 1. Rotates based on EXIF orientation (prevents upside down / sideways photos)
 * 2. Constrains max dimensions (e.g. max 2048x2048 fit inside without upscaling)
 * 3. Converts to high-quality compressed WebP (quality: 85, effort: 5)
 */
async function optimizeImageToWebP(inputBuffer: Buffer): Promise<{ buffer: Buffer; mimeType: string }> {
  try {
    const webpBuffer = await sharp(inputBuffer)
      .rotate() // Auto-orient using EXIF orientation tag
      .resize({
        width: 2048,
        height: 2048,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({
        quality: 85,
        effort: 5,
        smartSubsample: true,
      })
      .toBuffer();

    return { buffer: webpBuffer, mimeType: 'image/webp' };
  } catch (err) {
    console.warn('Sharp optimization fallback (using original buffer):', err);
    return { buffer: inputBuffer, mimeType: 'image/jpeg' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('x-admin-passkey') || request.headers.get('authorization');
    const adminPass = process.env.ADMIN_SECRET_PASSKEY || 'offstage-session-admin-2026';

    if (authHeader !== adminPass && authHeader !== `Bearer ${adminPass}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const contentType = request.headers.get('content-type') || '';

    // Handle FormData upload (File object from input)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const folder = (formData.get('folder') as string) || 'offstage-sessions';

      if (!file) {
        return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const rawBuffer = Buffer.from(bytes);

      // Optimize image buffer through sharp to WebP
      const { buffer: optimizedBuffer, mimeType } = await optimizeImageToWebP(rawBuffer);
      const base64Data = `data:${mimeType};base64,${optimizedBuffer.toString('base64')}`;

      if (isCloudinaryConfigured) {
        const uploadRes = await uploadMedia(base64Data, folder, { format: 'webp' });
        return NextResponse.json({
          success: true,
          url: uploadRes.secureUrl,
          publicId: uploadRes.publicId,
          format: uploadRes.format || 'webp',
          optimized: true,
        });
      } else {
        // Fallback in dev/offline mode: return optimized WebP Data URI directly
        return NextResponse.json({
          success: true,
          url: base64Data,
          isOfflineFallback: true,
          format: 'webp',
          optimized: true,
        });
      }
    }

    // Handle Base64 JSON upload
    const body = await request.json();
    const { image, folder = 'offstage-sessions' } = body;

    if (!image) {
      return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 });
    }

    // Extract buffer from base64 string
    let rawBuffer: Buffer;
    if (image.startsWith('data:')) {
      const base64Index = image.indexOf('base64,');
      if (base64Index !== -1) {
        rawBuffer = Buffer.from(image.substring(base64Index + 7), 'base64');
      } else {
        rawBuffer = Buffer.from(image);
      }
    } else {
      rawBuffer = Buffer.from(image, 'base64');
    }

    // Optimize through sharp to WebP
    const { buffer: optimizedBuffer, mimeType } = await optimizeImageToWebP(rawBuffer);
    const base64Data = `data:${mimeType};base64,${optimizedBuffer.toString('base64')}`;

    if (isCloudinaryConfigured) {
      const uploadRes = await uploadMedia(base64Data, folder, { format: 'webp' });
      return NextResponse.json({
        success: true,
        url: uploadRes.secureUrl,
        publicId: uploadRes.publicId,
        format: uploadRes.format || 'webp',
        optimized: true,
      });
    } else {
      return NextResponse.json({
        success: true,
        url: base64Data,
        isOfflineFallback: true,
        format: 'webp',
        optimized: true,
      });
    }
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
