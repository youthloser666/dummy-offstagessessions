import { NextRequest, NextResponse } from 'next/server';
import {
  getShopBanners,
  createShopBanner,
  updateShopBanner,
  deleteShopBanner,
} from '@/lib/services/shopBanners';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const banners = await getShopBanners();
    return NextResponse.json(
      { success: true, data: banners },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch shop banners' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('x-admin-passkey') || request.headers.get('authorization');
    const adminPass = process.env.ADMIN_SECRET_PASSKEY || 'offstage-session-admin-2026';

    if (authHeader !== adminPass && authHeader !== `Bearer ${adminPass}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid admin passkey' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, image_url, category, price, link_url, button_text, display_order, active, hide_title, hide_price, hide_button } = body;

    if (!image_url) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: image_url is required.' },
        { status: 400 }
      );
    }

    if (!hide_title && !title?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: title is required when Title & Category are enabled.' },
        { status: 400 }
      );
    }

    const created = await createShopBanner({
      title: title || '',
      image_url,
      category: category || '',
      price: price || '',
      link_url: link_url || '',
      button_text: button_text || '',
      display_order: Number(display_order ?? 1),
      active: active !== false,
      hide_title: Boolean(hide_title),
      hide_price: Boolean(hide_price),
      hide_button: Boolean(hide_button),
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Shop banner created successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create shop banner' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('x-admin-passkey') || request.headers.get('authorization');
    const adminPass = process.env.ADMIN_SECRET_PASSKEY || 'offstage-session-admin-2026';

    if (authHeader !== adminPass && authHeader !== `Bearer ${adminPass}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid admin passkey' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Banner id is required for updates.' },
        { status: 400 }
      );
    }

    const updated = await updateShopBanner(id, updates);

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Shop banner updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update shop banner' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('x-admin-passkey') || request.headers.get('authorization');
    const adminPass = process.env.ADMIN_SECRET_PASSKEY || 'offstage-session-admin-2026';

    if (authHeader !== adminPass && authHeader !== `Bearer ${adminPass}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid admin passkey' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Banner id is required for deletion.' },
        { status: 400 }
      );
    }

    await deleteShopBanner(id);

    return NextResponse.json({
      success: true,
      message: 'Shop banner deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete shop banner' },
      { status: 500 }
    );
  }
}
