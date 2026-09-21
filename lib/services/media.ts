import { getSupabaseServerClient } from '@/lib/supabase/server';
import { DbMedia } from '@/lib/types/database.types';

export interface MediaGalleryItem {
  id: string | number;
  name: string;
  image: string;
  thumbnail?: string;
  date: string;
  facebookUrl?: string;
  category?: string;
}

export const fallbackGalleries: MediaGalleryItem[] = [
  {
    id: 1,
    name: 'JACKIE HOLLANDER 6.13',
    image: '/image/jackie_web.webp',
    thumbnail: '/image/jackie_web.webp',
    date: 'JUNE 13, 2026 · SOUNDSTAGE',
    facebookUrl: 'https://www.facebook.com/offstagesessions',
    category: 'photo',
  },
  {
    id: 2,
    name: 'HONEYLUV 5.02',
    image: '/image/honey_web.webp',
    thumbnail: '/image/honey_web.webp',
    date: 'MAY 2, 2026 · WAREHOUSE 8',
    facebookUrl: 'https://www.facebook.com/offstagesessions',
    category: 'photo',
  },
  {
    id: 3,
    name: 'SHIP WREK 4.10',
    image: '/image/shipwreck_web.webp',
    thumbnail: '/image/shipwreck_web.webp',
    date: 'APRIL 10, 2026 · POWER PLANT',
    facebookUrl: 'https://www.facebook.com/offstagesessions',
    category: 'photo',
  },
  {
    id: 4,
    name: 'TO BE HONEST 5.09',
    image: '/image/tobehonest_web.webp',
    thumbnail: '/image/tobehonest_web.webp',
    date: 'MAY 9, 2026 · SOUND GARDEN',
    facebookUrl: 'https://www.facebook.com/offstagesessions',
    category: 'photo',
  },
  {
    id: 5,
    name: 'NIGHT SWIM 3.28',
    image: '/image/nightswim_web.webp',
    thumbnail: '/image/nightswim_web.webp',
    date: 'MARCH 28, 2026 · THE WATERFRONT',
    facebookUrl: 'https://www.facebook.com/offstagesessions',
    category: 'photo',
  },
  {
    id: 6,
    name: 'GROW GARDEN 4.25',
    image: '/image/growgarden_web.webp',
    thumbnail: '/image/growgarden_web.webp',
    date: 'APRIL 25, 2026 · OPEN AIR DC',
    facebookUrl: 'https://www.facebook.com/offstagesessions',
    category: 'photo',
  },
];

export function mapDbMediaToGallery(row: DbMedia): MediaGalleryItem {
  return {
    id: row.id,
    name: row.name,
    image: row.image_url || row.thumbnail_url,
    thumbnail: row.thumbnail_url,
    date: row.date,
    facebookUrl: row.facebook_url,
    category: row.category,
  };
}

export async function getMediaArchives(): Promise<MediaGalleryItem[]> {
  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return fallbackGalleries;
    }

    const { data, error } = await supabase
      .from('media_archives')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      if (error) console.warn('Supabase getMediaArchives error, using fallback:', error.message);
      return fallbackGalleries;
    }

    return (data as DbMedia[]).map(mapDbMediaToGallery);
  } catch (err) {
    console.warn('getMediaArchives exception, using fallback:', err);
    return fallbackGalleries;
  }
}
