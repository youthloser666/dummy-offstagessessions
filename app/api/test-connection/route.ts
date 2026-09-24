import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { cloudinary, isCloudinaryConfigured } from '@/lib/cloudinary';

export async function GET() {
  const result: {
    supabase: {
      configured: boolean;
      connected: boolean;
      message: string;
      showsCount?: number;
      hasServiceRole?: boolean;
    };
    cloudinary: {
      configured: boolean;
      connected: boolean;
      message: string;
      cloudName?: string;
    };
  } = {
    supabase: {
      configured: false,
      connected: false,
      message: 'Supabase credentials missing in environment variables.',
    },
    cloudinary: {
      configured: false,
      connected: false,
      message: 'Cloudinary credentials missing in environment variables.',
    },
  };

  // 1. Test Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && anonKey) {
    result.supabase.configured = true;
    result.supabase.hasServiceRole = Boolean(serviceRoleKey);

    try {
      const client = getSupabaseServerClient(Boolean(serviceRoleKey));
      if (client) {
        const { count, error } = await client
          .from('shows')
          .select('*', { count: 'exact', head: true });

        if (error) {
          result.supabase.message = `Supabase responded with error: ${error.message}. (Did you run schema.sql in Supabase SQL Editor?)`;
        } else {
          result.supabase.connected = true;
          result.supabase.showsCount = count ?? 0;
          result.supabase.message = `Supabase connected successfully. Found ${count ?? 0} shows in database.`;
        }
      }
    } catch (err: any) {
      result.supabase.message = `Failed to connect to Supabase: ${err.message}`;
    }
  }

  // 2. Test Cloudinary
  if (isCloudinaryConfigured) {
    result.cloudinary.configured = true;
    result.cloudinary.cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    try {
      const pingResult = await cloudinary.api.ping();
      if (pingResult && pingResult.status === 'ok') {
        result.cloudinary.connected = true;
        result.cloudinary.message = `Cloudinary connected successfully to cloud "${process.env.CLOUDINARY_CLOUD_NAME}".`;
      } else {
        result.cloudinary.message = 'Cloudinary ping returned non-ok response.';
      }
    } catch (err: any) {
      result.cloudinary.message = `Cloudinary ping error: ${err.message}`;
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    status: result.supabase.connected && result.cloudinary.connected ? 'all_connected' : 'partial_or_offline',
    ...result,
  });
}
