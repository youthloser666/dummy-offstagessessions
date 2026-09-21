import { NextRequest, NextResponse } from 'next/server';
import { uploadMedia, isCloudinaryConfigured } from '@/lib/cloudinary';

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
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || 'image/jpeg';
      const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;

      if (isCloudinaryConfigured) {
        const uploadRes = await uploadMedia(base64Data, folder);
        return NextResponse.json({
          success: true,
          url: uploadRes.secureUrl,
          publicId: uploadRes.publicId,
        });
      } else {
        // Fallback in dev/offline mode: return Data URI directly
        return NextResponse.json({
          success: true,
          url: base64Data,
          isOfflineFallback: true,
        });
      }
    }

    // Handle Base64 JSON upload
    const body = await request.json();
    const { image, folder = 'offstage-sessions' } = body;

    if (!image) {
      return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 });
    }

    if (isCloudinaryConfigured) {
      const uploadRes = await uploadMedia(image, folder);
      return NextResponse.json({
        success: true,
        url: uploadRes.secureUrl,
        publicId: uploadRes.publicId,
      });
    } else {
      return NextResponse.json({
        success: true,
        url: image,
        isOfflineFallback: true,
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
