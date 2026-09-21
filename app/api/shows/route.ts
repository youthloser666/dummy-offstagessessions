import { NextRequest, NextResponse } from 'next/server';
import { getShows } from '@/lib/services/shows';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag') || undefined;
    const shows = await getShows(tag);

    return NextResponse.json({
      success: true,
      data: shows,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve shows' },
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
    const {
      name,
      subtitle,
      date_code,
      date_formatted,
      event_date,
      venue,
      time,
      poster_url,
      tags,
      featured,
      month,
      ticket_url,
      posh_url,
      status,
    } = body;

    if (!name || !venue || !poster_url) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (name, venue, poster_url)' },
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
      .from('shows')
      .insert({
        name,
        subtitle: subtitle || null,
        date_code: date_code || 'TBA',
        date_formatted: date_formatted || 'TBA',
        event_date: event_date || null,
        venue,
        time: time || 'TBA',
        poster_url,
        tags: tags || ['House'],
        featured: Boolean(featured),
        month: month || '2026',
        ticket_url: ticket_url || null,
        posh_url: posh_url || null,
        status: status || 'upcoming',
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
