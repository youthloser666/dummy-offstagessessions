import { NextRequest, NextResponse } from 'next/server';
import { generateUploadSignature, isCloudinaryConfigured } from '@/lib/cloudinary';
import { verifyAdminRequest, unauthorizedResponse } from '@/lib/auth/adminAuth';

export async function POST(request: NextRequest) {
  try {
    const auth = verifyAdminRequest(request);
    if (!auth.authorized) {
      return unauthorizedResponse();
    }

    if (!isCloudinaryConfigured) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not set.',
        },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'offstage-sessions';

    const signatureData = generateUploadSignature(folder);

    return NextResponse.json({
      success: true,
      data: signatureData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Signature generation failed' },
      { status: 500 }
    );
  }
}
