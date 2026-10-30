import { NextRequest, NextResponse } from 'next/server';
import { getSocialLinks, updateSocialLinks, defaultSocialLinks } from '@/lib/services/settings';
import { verifyAdminRequest, unauthorizedResponse } from '@/lib/auth/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getSocialLinks();
    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ success: true, data: defaultSocialLinks });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = verifyAdminRequest(request);
    if (!auth.authorized) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const updated = await updateSocialLinks(body);

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Social media links updated successfully',
    });
  } catch (error: any) {
    const isTableMissing = error.message?.includes('TABLE_MISSING');
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update social media links',
        isTableMissing,
      },
      { status: isTableMissing ? 409 : 500 }
    );
  }
}
