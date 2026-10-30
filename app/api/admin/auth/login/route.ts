import { NextRequest, NextResponse } from 'next/server';
import {
  findAdminByUsername,
  findAdminById,
  verifySecret,
  createChallengeToken,
  verifyChallengeToken,
  createSessionToken,
  recordAdminLogin,
} from '@/lib/services/adminUsers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { step = 1 } = body;

    // =========================================================================
    // STEP 1: Verify Username & Text Password
    // =========================================================================
    if (step === 1 && !body.pin) {
      const { username, password } = body;

      if (!username || !password) {
        return NextResponse.json(
          { success: false, error: 'Username and password are required.' },
          { status: 400 }
        );
      }

      const user = await findAdminByUsername(username);
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Invalid username or password.' },
          { status: 401 }
        );
      }

      if (user.status === 'suspended') {
        return NextResponse.json(
          { success: false, error: 'This admin account has been suspended.' },
          { status: 403 }
        );
      }

      const isPasswordValid = verifySecret(password, user.password_salt, user.password_hash);
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid username or password.' },
          { status: 401 }
        );
      }

      // Generate a short-lived challenge token for Step 2
      const challengeToken = createChallengeToken(user);

      return NextResponse.json({
        success: true,
        step: 2,
        challengeToken,
        user: {
          username: user.username,
          name: user.name,
          role: user.role,
        },
      });
    }

    // =========================================================================
    // STEP 2: Verify Numeric PIN
    // =========================================================================
    if (step === 2 || (body.challengeToken && body.pin)) {
      const { challengeToken, pin } = body;

      if (!challengeToken) {
        return NextResponse.json(
          { success: false, error: 'Session challenge expired. Please restart login.' },
          { status: 400 }
        );
      }

      if (!pin) {
        return NextResponse.json(
          { success: false, error: 'Numeric PIN is required.' },
          { status: 400 }
        );
      }

      const challenge = verifyChallengeToken(challengeToken);
      if (!challenge) {
        return NextResponse.json(
          { success: false, error: 'PIN verification challenge expired. Please re-enter your password.' },
          { status: 401 }
        );
      }

      const user = await findAdminById(challenge.adminId);
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Admin account not found.' },
          { status: 404 }
        );
      }

      const isPinValid = verifySecret(pin.trim(), user.pin_salt, user.pin_hash);
      if (!isPinValid) {
        return NextResponse.json(
          { success: false, error: 'Incorrect PIN code. Please try again.' },
          { status: 401 }
        );
      }

      // Record successful login
      await recordAdminLogin(user.id);

      const publicUser = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
        last_login_at: new Date().toISOString(),
      };

      const sessionToken = createSessionToken(publicUser);
      const adminPasskey = process.env.ADMIN_SECRET_PASSKEY || 'offstage-session-admin-2026';

      const response = NextResponse.json({
        success: true,
        sessionToken,
        user: publicUser,
        passkey: adminPasskey,
      });

      // Set secure HTTP-only cookie
      response.cookies.set('offstage_admin_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return response;
    }

    // =========================================================================
    // DIRECT COMBO: Both Password & PIN sent at once
    // =========================================================================
    if (body.username && body.password && body.pin) {
      const { username, password, pin } = body;
      const user = await findAdminByUsername(username);

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Invalid credentials.' },
          { status: 401 }
        );
      }

      const isPasswordValid = verifySecret(password, user.password_salt, user.password_hash);
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid password.' },
          { status: 401 }
        );
      }

      const isPinValid = verifySecret(pin.trim(), user.pin_salt, user.pin_hash);
      if (!isPinValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid PIN code.' },
          { status: 401 }
        );
      }

      await recordAdminLogin(user.id);

      const publicUser = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
        last_login_at: new Date().toISOString(),
      };

      const sessionToken = createSessionToken(publicUser);
      const adminPasskey = process.env.ADMIN_SECRET_PASSKEY || 'offstage-session-admin-2026';

      const response = NextResponse.json({
        success: true,
        sessionToken,
        user: publicUser,
        passkey: adminPasskey,
      });

      response.cookies.set('offstage_admin_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Invalid login request parameters.' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error during login.' },
      { status: 500 }
    );
  }
}
