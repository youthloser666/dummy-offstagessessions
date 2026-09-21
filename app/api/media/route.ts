import { NextRequest, NextResponse } from 'next/server';
import { getMediaArchives } from '@/lib/services/media';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const media = await getMediaArchives();
    return NextResponse.json({
      success: true,
      data: media,
    });
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
