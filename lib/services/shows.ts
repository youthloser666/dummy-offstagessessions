import { getSupabaseServerClient } from '@/lib/supabase/server';
import { shows as fallbackShows, Show } from '@/lib/data';
import { DbShow } from '@/lib/types/database.types';

export type ShowWithAliases = Show & {
  poshUrl?: string;
  posh_url?: string;
  ticket_url?: string;
  poster_url?: string;
  date_code?: string;
  date_formatted?: string;
  status?: string;
  eventDate?: string | null;
  event_date?: string | null;
};

/**
 * Normalizes a database row into the front-end Show model.
 */
export function mapDbShowToShow(row: DbShow): ShowWithAliases {
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
    ticket_url: poshLink,
    posh_url: poshLink,
    poster_url: row.poster_url,
    date_code: row.date_code,
    date_formatted: row.date_formatted,
    status: row.status || 'upcoming',
    eventDate: row.event_date,
    event_date: row.event_date,
  };
}

/**
 * Fetch all shows with optional genre/tag filter.
 * Automatically falls back to lib/data.ts only if Supabase is offline or not configured.
 */
export async function getShows(filterTag?: string): Promise<ShowWithAliases[]> {
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

function getFilteredFallbackShows(filterTag?: string): ShowWithAliases[] {
  if (!filterTag || filterTag === 'All') {
    return fallbackShows as ShowWithAliases[];
  }
  return fallbackShows.filter((s) => s.tags.includes(filterTag)) as ShowWithAliases[];
}
