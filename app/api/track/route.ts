import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const page_path = body.path || '/';
    const referrer = body.referrer || null;

    // Ignore admin panel visits from tracking if requested
    if (page_path.startsWith('/offstageadminv') || page_path.startsWith('/api')) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    // Anonymized IP hash (daily salt for privacy)
    const today = new Date().toISOString().slice(0, 10);
    const ip_hash = crypto
      .createHash('sha256')
      .update(`${ip}-${today}`)
      .digest('hex')
      .slice(0, 16);

    // Device detection
    let device_type = 'desktop';
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      device_type = 'tablet';
    } else if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(userAgent)) {
      device_type = 'mobile';
    }

    // Browser detection
    let browser = 'Other';
    if (/edg/i.test(userAgent)) browser = 'Edge';
    else if (/chrome|crios/i.test(userAgent)) browser = 'Chrome';
    else if (/firefox|fxios/i.test(userAgent)) browser = 'Firefox';
    else if (/safari/i.test(userAgent)) browser = 'Safari';
    else if (/opera|opr/i.test(userAgent)) browser = 'Opera';

    // OS detection
    let os = 'Other';
    if (/iphone|ipad|ipod/i.test(userAgent)) os = 'iOS';
    else if (/android/i.test(userAgent)) os = 'Android';
    else if (/windows/i.test(userAgent)) os = 'Windows';
    else if (/macintosh|mac os x/i.test(userAgent)) os = 'macOS';
    else if (/linux/i.test(userAgent)) os = 'Linux';

    const supabase = getSupabaseServerClient(true);
    if (!supabase) {
      return NextResponse.json({ success: true, offline: true });
    }

    const { error } = await supabase.from('page_views').insert({
      page_path,
      referrer,
      user_agent: userAgent.slice(0, 200),
      device_type,
      browser,
      os,
      ip_hash,
      country: 'Unknown',
    });

    if (error) {
      // Table might not exist yet if user hasn't run the migration
      console.warn('Track page_views warning:', error.message);
      return NextResponse.json({ success: false, warning: error.message });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
