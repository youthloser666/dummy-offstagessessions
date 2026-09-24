import { getSupabaseServerClient } from '@/lib/supabase/server';

export interface SocialLinks {
  instagram: string;
  tiktok: string;
  facebook: string;
  email: string;
  spotify?: string;
  soundcloud?: string;
  youtube?: string;
}

export const defaultSocialLinks: SocialLinks = {
  instagram: 'https://instagram.com/offstagesession',
  tiktok: 'https://www.tiktok.com/@offstagesessions',
  facebook: 'https://www.facebook.com/offstagesessions',
  email: 'offstage@offstagesessions.com',
  spotify: '',
  soundcloud: '',
  youtube: '',
};

/**
 * Fetch current social media links.
 * Checks Supabase `site_settings` table (key = 'social_links'),
 * falls back to defaultSocialLinks.
 */
export async function getSocialLinks(): Promise<SocialLinks> {
  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) return defaultSocialLinks;

    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'social_links')
      .maybeSingle();

    if (error || !data || !data.value) {
      return defaultSocialLinks;
    }

    const val = data.value as unknown as Partial<SocialLinks>;
    return { ...defaultSocialLinks, ...val };
  } catch (err) {
    console.warn('getSocialLinks exception, using fallback:', err);
    return defaultSocialLinks;
  }
}

/**
 * Update social media links in Supabase `site_settings`.
 */
export async function updateSocialLinks(links: Partial<SocialLinks>): Promise<SocialLinks> {
  const merged: SocialLinks = {
    ...defaultSocialLinks,
    ...links,
  };

  try {
    const supabase = getSupabaseServerClient(true);
    if (!supabase) return merged;

    const { error } = await supabase
      .from('site_settings')
      .upsert(
        {
          key: 'social_links',
          value: merged as any,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (error) {
      console.warn('Supabase site_settings upsert error:', error.message);
      // If table doesn't exist yet, error code PGRST205
      if (error.code === 'PGRST205' || error.message.includes('site_settings')) {
        throw new Error('TABLE_MISSING: Table public.site_settings does not exist yet in Supabase.');
      }
      throw new Error(error.message);
    }
  } catch (err: any) {
    throw err;
  }

  return merged;
}
