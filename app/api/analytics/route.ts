import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('x-admin-passkey') || request.headers.get('authorization');
    const adminPass = process.env.ADMIN_SECRET_PASSKEY || 'offstage-session-admin-2026';

    if (authHeader !== adminPass && authHeader !== `Bearer ${adminPass}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid admin passkey' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseServerClient(true);
    if (!supabase) {
      return NextResponse.json({
        success: true,
        data: getEmptyAnalytics('Supabase server client not configured'),
      });
    }

    // Fetch raw page views from past 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: views, error } = await supabase
      .from('page_views')
      .select('*')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      // Table may not exist yet if user hasn't run the migration
      console.warn('Analytics page_views query warning:', error.message);
      return NextResponse.json({
        success: true,
        data: getEmptyAnalytics(error.message),
        warning: error.message,
      });
    }

    const list = views || [];
    const totalViews = list.length;

    // Unique visitors by ip_hash
    const uniqueIps = new Set(list.map((v) => v.ip_hash).filter(Boolean));
    const uniqueVisitors = uniqueIps.size;

    // Today's views
    const todayStr = new Date().toISOString().slice(0, 10);
    const viewsToday = list.filter((v) => v.created_at && v.created_at.startsWith(todayStr)).length;

    // Unique visitors today
    const uniqueTodayIps = new Set(
      list.filter((v) => v.created_at && v.created_at.startsWith(todayStr)).map((v) => v.ip_hash).filter(Boolean)
    );
    const uniqueVisitorsToday = uniqueTodayIps.size;

    // Top Pages
    const pageCounts: Record<string, number> = {};
    list.forEach((v) => {
      const p = v.page_path || '/';
      pageCounts[p] = (pageCounts[p] || 0) + 1;
    });

    const topPages = Object.entries(pageCounts)
      .map(([path, count]) => ({
        path,
        count,
        percentage: totalViews > 0 ? Math.round((count / totalViews) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Device breakdown
    const deviceCounts: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0 };
    list.forEach((v) => {
      const dev = (v.device_type || 'desktop').toLowerCase();
      deviceCounts[dev] = (deviceCounts[dev] || 0) + 1;
    });

    const devices = Object.entries(deviceCounts).map(([device, count]) => ({
      device,
      count,
      percentage: totalViews > 0 ? Math.round((count / totalViews) * 100) : 0,
    }));

    // Browser breakdown
    const browserCounts: Record<string, number> = {};
    list.forEach((v) => {
      const b = v.browser || 'Other';
      browserCounts[b] = (browserCounts[b] || 0) + 1;
    });

    const browsers = Object.entries(browserCounts)
      .map(([browser, count]) => ({
        browser,
        count,
        percentage: totalViews > 0 ? Math.round((count / totalViews) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // OS breakdown
    const osCounts: Record<string, number> = {};
    list.forEach((v) => {
      const os = v.os || 'Other';
      osCounts[os] = (osCounts[os] || 0) + 1;
    });

    const osBreakdown = Object.entries(osCounts)
      .map(([os, count]) => ({
        os,
        count,
        percentage: totalViews > 0 ? Math.round((count / totalViews) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Referrers / Sources
    const referrerCounts: Record<string, number> = {};
    list.forEach((v) => {
      let ref = 'Direct / Bookmark';
      if (v.referrer) {
        try {
          const url = new URL(v.referrer);
          ref = url.hostname.replace(/^www\./, '');
        } catch {
          ref = v.referrer.slice(0, 30);
        }
      }
      referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
    });

    const sources = Object.entries(referrerCounts)
      .map(([source, count]) => ({
        source,
        count,
        percentage: totalViews > 0 ? Math.round((count / totalViews) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Recent 20 visitor logs
    const recentVisits = list.slice(0, 20).map((v) => ({
      id: v.id,
      path: v.page_path,
      device: v.device_type || 'desktop',
      browser: v.browser || 'Browser',
      os: v.os || 'OS',
      referrer: v.referrer || 'Direct',
      country: v.country || 'Unknown',
      created_at: v.created_at,
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          totalViews,
          uniqueVisitors,
          viewsToday,
          uniqueVisitorsToday,
          topPages,
          devices,
          browsers,
          osBreakdown,
          sources,
          recentVisits,
          hasData: totalViews > 0,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
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

    const supabase = getSupabaseServerClient(true);
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase server client not configured' },
        { status: 503 }
      );
    }

    // Delete all rows from page_views
    const { error } = await supabase
      .from('page_views')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'All analytics traffic data reset successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

function getEmptyAnalytics(note?: string) {
  return {
    totalViews: 0,
    uniqueVisitors: 0,
    viewsToday: 0,
    uniqueVisitorsToday: 0,
    topPages: [],
    devices: [
      { device: 'desktop', count: 0, percentage: 0 },
      { device: 'mobile', count: 0, percentage: 0 },
      { device: 'tablet', count: 0, percentage: 0 },
    ],
    browsers: [],
    osBreakdown: [],
    sources: [],
    recentVisits: [],
    hasData: false,
    note: note || 'No traffic logged yet',
  };
}
