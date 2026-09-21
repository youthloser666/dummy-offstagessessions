import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/types/database.types';

export function getSupabaseServerClient(useServiceRole: boolean = false): SupabaseClient<Database> | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = useServiceRole
    ? process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !key) {
    return null;
  }

  return createClient<Database>(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
