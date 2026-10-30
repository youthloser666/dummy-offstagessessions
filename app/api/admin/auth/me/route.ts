import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/services/adminUsers';

export async function GET(request: NextRequest) {
  try {
    const cookieSession = request.cookies.get('offstage_admin_session')?.value;
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = cookieSession || headerToken;

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const user = verifySessionToken(token);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const adminPasskey = process.env.ADMIN_SECRET_PASSKEY || 'offstage-session-admin-2026';

    return NextResponse.json({
      authenticated: true,
      user,
      passkey: adminPasskey,
    });
  } catch (error: any) {
    return NextResponse.json(
      { authenticated: false, error: error.message },
      { status: 500 }
    );
  }
}
