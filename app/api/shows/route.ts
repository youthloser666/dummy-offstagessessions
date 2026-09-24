import { NextRequest, NextResponse } from 'next/server';
import { getShows } from '@/lib/services/shows';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag') || undefined;
    const shows = await getShows(tag);

    return NextResponse.json(
      {
        success: true,
        data: shows,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
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
    const {
      id,
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

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Show id is required for update' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient(true);
    if (!supabase) {
      return NextResponse.json(
        {
          success: false,
          error: 'Supabase server client is not configured',
        },
        { status: 503 }
      );
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updatePayload.name = name;
    if (subtitle !== undefined) updatePayload.subtitle = subtitle || null;
    if (date_code !== undefined) updatePayload.date_code = date_code;
    if (date_formatted !== undefined) updatePayload.date_formatted = date_formatted;
    if (event_date !== undefined) updatePayload.event_date = event_date || null;
    if (venue !== undefined) updatePayload.venue = venue;
    if (time !== undefined) updatePayload.time = time;
    if (poster_url !== undefined) updatePayload.poster_url = poster_url;
    if (tags !== undefined) {
      updatePayload.tags = Array.isArray(tags)
        ? tags
        : typeof tags === 'string'
        ? tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : tags;
    }
    if (featured !== undefined) updatePayload.featured = Boolean(featured);
    if (month !== undefined) updatePayload.month = month;
    if (ticket_url !== undefined) updatePayload.ticket_url = ticket_url || null;
    if (posh_url !== undefined) updatePayload.posh_url = posh_url || null;
    if (status !== undefined) updatePayload.status = status;

    const { data, error } = await supabase
      .from('shows')
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
        { success: false, error: 'Show id is required to delete' },
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
      .from('shows')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Show ${id} deleted successfully` });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
