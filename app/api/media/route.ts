import { NextRequest, NextResponse } from 'next/server';
import { getMediaArchives } from '@/lib/services/media';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const media = await getMediaArchives();
    return NextResponse.json(
      {
        success: true,
        data: media,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve media archives' },
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
    const { name, date, thumbnail_url, image_url, facebook_url, category, display_order } = body;

    if (!name || !thumbnail_url || !facebook_url) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (name, thumbnail_url, facebook_url)' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient(true);
    if (!supabase) {
      return NextResponse.json(
        {
          success: false,
          error: 'Supabase server client is not configured. Please set SUPABASE environment variables.',
        },
        { status: 503 }
      );
    }

    const { data, error } = await supabase
      .from('media_archives')
      .insert({
        name,
        date: date || 'RECENT',
        thumbnail_url,
        image_url: image_url || thumbnail_url,
        facebook_url,
        category: category || 'photo',
        display_order: display_order !== undefined ? Number(display_order) : 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
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
    const { id, name, date, thumbnail_url, image_url, facebook_url, category, display_order } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Media id is required for update' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient(true);
    if (!supabase) {
      return NextResponse.json(
        {
          success: false,
          error: 'Supabase server client is not configured. Please set SUPABASE environment variables.',
        },
        { status: 503 }
      );
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updatePayload.name = name;
    if (date !== undefined) updatePayload.date = date;
    if (thumbnail_url !== undefined) updatePayload.thumbnail_url = thumbnail_url;
    if (image_url !== undefined) updatePayload.image_url = image_url;
    if (facebook_url !== undefined) updatePayload.facebook_url = facebook_url;
    if (category !== undefined) updatePayload.category = category;
    if (display_order !== undefined) updatePayload.display_order = Number(display_order);

    const { data, error } = await supabase
      .from('media_archives')
      .update(updatePayload as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
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
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {
        // Body may be empty
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Media id is required to delete' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient(true);
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase server client is not configured' },
        { status: 503 }
      );
    }

    const { error } = await supabase
      .from('media_archives')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Media item ${id} deleted successfully` });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
