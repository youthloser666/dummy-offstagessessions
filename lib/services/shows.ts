import { getSupabaseServerClient } from '@/lib/supabase/server';
import { shows as fallbackShows, Show } from '@/lib/data';
import { DbShow } from '@/lib/types/database.types';

/**
 * Normalizes a database row into the front-end Show model.
 */
export function mapDbShowToShow(row: DbShow): Show & { poshUrl?: string; status?: string; eventDate?: string | null } {
  const poshLink = row.posh_url || row.ticket_url || undefined;
  return {
    id: row.id as any,
    poster: row.poster_url,
    dateCode: row.date_code,
    date: row.date_formatted,
    name: row.name,
    subtitle: row.subtitle || undefined,
    venue: row.venue,
    time: row.time,
    tags: row.tags || [],
    featured: row.featured,
    month: row.month,
    ticketUrl: poshLink,
    poshUrl: poshLink,
    status: row.status || 'upcoming',
    eventDate: row.event_date,
  };
}

/**
 * Fetch all shows with optional genre/tag filter.
 * Automatically falls back to lib/data.ts only if Supabase is offline or not configured.
 */
export async function getShows(filterTag?: string): Promise<(Show & { poshUrl?: string; status?: string; eventDate?: string | null })[]> {
  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return getFilteredFallbackShows(filterTag);
    }

    let query = supabase
      .from('shows')
      .select('*')
      .order('event_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (filterTag && filterTag !== 'All') {
      query = query.contains('tags', [filterTag]);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Supabase getShows error, using fallback:', error.message);
      return getFilteredFallbackShows(filterTag);
    }

    if (!data) {
      return [];
    }

    return (data as DbShow[]).map(mapDbShowToShow);
  } catch (err) {
    console.warn('getShows exception, using fallback data:', err);
    return getFilteredFallbackShows(filterTag);
  }
}

function getFilteredFallbackShows(filterTag?: string): (Show & { poshUrl?: string; status?: string; eventDate?: string | null })[] {
  if (!filterTag || filterTag === 'All') {
    return fallbackShows;
  }
  return fallbackShows.filter((s) => s.tags.includes(filterTag));
}
