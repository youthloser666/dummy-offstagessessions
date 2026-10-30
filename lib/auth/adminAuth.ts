import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/services/adminUsers';
import { AdminUserPublic } from '@/app/offstageadminv/types';

export interface AdminAuthResult {
  authorized: boolean;
  user?: AdminUserPublic;
}

/**
 * Centrally validates admin requests across all API routes.
 * Accepts:
 * 1. 'x-admin-passkey' header matching ADMIN_SECRET_PASSKEY
 * 2. 'authorization' header matching ADMIN_SECRET_PASSKEY or 'Bearer <passkey>'
 * 3. 'authorization: Bearer <token>' signed session token
 * 4. 'offstage_admin_session' cookie signed session token
 */
export function verifyAdminRequest(request: NextRequest): AdminAuthResult {
  const adminPass = process.env.ADMIN_SECRET_PASSKEY || 'offstage-session-admin-2026';
  const passkeyHeader = request.headers.get('x-admin-passkey');
  const authHeader = request.headers.get('authorization');

  // 1. Direct passkey check
  if (passkeyHeader === adminPass || authHeader === adminPass || authHeader === `Bearer ${adminPass}`) {
    return {
      authorized: true,
      user: {
        id: 'system-passkey',
        username: 'admin',
        name: 'Main Admin',
        role: 'superadmin',
        status: 'active',
        created_at: new Date().toISOString(),
      },
    };
  }

  // 2. Bearer token or session cookie verification
  const cookieSession = request.cookies.get('offstage_admin_session')?.value;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const candidateToken = cookieSession || bearerToken;

  if (candidateToken) {
    const user = verifySessionToken(candidateToken);
    if (user && user.status === 'active') {
      return {
        authorized: true,
        user,
      };
    }
  }

  return { authorized: false };
}

/**
 * Returns a standardized 401 Unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized: Admin authentication required.') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 401 }
  );
}

