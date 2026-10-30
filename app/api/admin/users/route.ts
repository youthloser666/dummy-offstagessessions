import { NextRequest, NextResponse } from 'next/server';
import {
  listAdminUsers,
  createAdminUser,
  deleteAdminUser,
} from '@/lib/services/adminUsers';
import { verifyAdminRequest, unauthorizedResponse } from '@/lib/auth/adminAuth';

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAdminRequest(request);
    if (!auth.authorized) {
      return unauthorizedResponse();
    }

    const admins = await listAdminUsers();
    return NextResponse.json({ success: true, admins });
  } catch (error: any) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch admin users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = verifyAdminRequest(request);
    if (!auth.authorized) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { username, name, role = 'admin', password, pin } = body;

    if (!username || !name || !password || !pin) {
      return NextResponse.json(
        { success: false, error: 'Username, name, password, and numeric PIN are all required.' },
        { status: 400 }
      );
    }

    const newAdmin = await createAdminUser({
      username,
      name,
      role,
      password,
      pin,
    });

    return NextResponse.json({
      success: true,
      message: `Admin account "${newAdmin.username}" created successfully.`,
      admin: newAdmin,
    });
  } catch (error: any) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create admin user' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = verifyAdminRequest(request);
    if (!auth.authorized) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Admin ID is required.' },
        { status: 400 }
      );
    }

    const result = await deleteAdminUser(id);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to delete admin.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Admin account deleted successfully.',
    });
  } catch (error: any) {
    console.error('Error deleting admin user:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete admin user' },
      { status: 500 }
    );
  }
}
