import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/types/database.types';

let supabaseClient: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }

  return supabaseClient;
}
