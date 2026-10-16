import { getSupabaseServerClient } from '@/lib/supabase/server';

export interface ShopBanner {
  id: string;
  title: string;
  category: string;
  price?: string;
  image_url: string;
  link_url?: string;
  button_text?: string;
  display_order: number;
  active: boolean;
  hide_title?: boolean;
  hide_price?: boolean;
  hide_button?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const defaultShopBanners: ShopBanner[] = [
  {
    id: 'banner-strapback',
    title: 'THE STRAPBACK',
    category: 'APPAREL',
    price: '$25.00',
    image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1600&q=80',
    link_url: '/shop',
    button_text: 'SHOP NOW',
    display_order: 1,
    active: true,
    hide_title: false,
    hide_price: false,
    hide_button: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'banner-hoodie',
    title: 'OFFSTAGE CLUB HOODIE',
    category: 'LIMITED DROP',
    price: '$45.00',
    image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1600&q=80',
    link_url: '/shop',
    button_text: 'EXPLORE DROP',
    display_order: 2,
    active: true,
    hide_title: false,
    hide_price: false,
    hide_button: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'banner-tee',
    title: 'BALTIMORE SOUND TEE',
    category: 'MERCHANDISE',
    price: '$30.00',
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1600&q=80',
    link_url: '/shop',
    button_text: 'VIEW COLLECTION',
    display_order: 3,
    active: true,
    hide_title: false,
    hide_price: false,
    hide_button: false,
    created_at: new Date().toISOString(),
  },
];

/**
 * Fetch extra metadata (hide_title, hide_price, hide_button) from site_settings.
 */
async function getShopBannersMeta(): Promise<Record<string, { hide_title?: boolean; hide_price?: boolean; hide_button?: boolean }>> {
  try {
    const supabase = getSupabaseServerClient(true);
    if (!supabase) return {};
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'shop_banners_meta')
      .maybeSingle();

    if (data?.value && typeof data.value === 'object' && !Array.isArray(data.value)) {
      return data.value as Record<string, { hide_title?: boolean; hide_price?: boolean; hide_button?: boolean }>;
    }
    return {};
  } catch {
    return {};
  }
}

/**
 * Save extra metadata into site_settings.
 */
async function saveShopBannersMeta(meta: Record<string, { hide_title?: boolean; hide_price?: boolean; hide_button?: boolean }>): Promise<void> {
  try {
    const supabase = getSupabaseServerClient(true);
    if (!supabase) return;
    await supabase.from('site_settings').upsert(
      {
        key: 'shop_banners_meta',
        value: meta as any,
        description: 'Metadata flags for shop hero banners (hide_title, hide_price, hide_button)',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );
  } catch (err) {
    console.warn('saveShopBannersMeta error:', err);
  }
}

/**
 * Fetch all shop banners.
 * Checks Supabase `shop_banners` table first, then `site_settings` (key = 'shop_banners'),
 * and falls back to defaultShopBanners.
 */
export async function getShopBanners(): Promise<ShopBanner[]> {
  try {
    const supabase = getSupabaseServerClient(true);
    if (!supabase) return defaultShopBanners;

    const meta = await getShopBannersMeta();

    // 1. Try dedicated table `shop_banners`
    const { data: tableData, error: tableError } = await supabase
      .from('shop_banners')
      .select('*')
      .order('display_order', { ascending: true });

    if (!tableError && tableData) {
      if (tableData.length > 0) {
        return tableData.map((b: any) => {
          const bannerId = String(b.id);
          const bannerMeta = meta[bannerId] || {};
          return {
            id: bannerId,
            title: b.title || '',
            category: b.category || '',
            price: b.price || '',
            image_url: b.image_url || b.imageUrl || '',
            link_url: b.link_url || b.linkUrl || '',
            button_text: b.button_text || b.buttonText || '',
            display_order: Number(b.display_order ?? 0),
            active: b.active !== false,
            hide_title: b.hide_title !== undefined ? Boolean(b.hide_title) : Boolean(bannerMeta.hide_title),
            hide_price: b.hide_price !== undefined ? Boolean(b.hide_price) : Boolean(bannerMeta.hide_price),
            hide_button: b.hide_button !== undefined ? Boolean(b.hide_button) : Boolean(bannerMeta.hide_button),
            created_at: b.created_at,
            updated_at: b.updated_at,
          };
        });
      }
      return [];
    }

    // 2. Fall back to `site_settings` table (key = 'shop_banners')
    const { data: settingsData, error: settingsError } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'shop_banners')
      .maybeSingle();

    if (!settingsError && settingsData && Array.isArray(settingsData.value) && settingsData.value.length > 0) {
      const bannersList = settingsData.value as unknown as ShopBanner[];
      return [...bannersList]
        .map((b) => {
          const bannerMeta = meta[b.id] || {};
          return {
            ...b,
            hide_title: b.hide_title !== undefined ? Boolean(b.hide_title) : Boolean(bannerMeta.hide_title),
            hide_price: b.hide_price !== undefined ? Boolean(b.hide_price) : Boolean(bannerMeta.hide_price),
            hide_button: b.hide_button !== undefined ? Boolean(b.hide_button) : Boolean(bannerMeta.hide_button),
          };
        })
        .sort((a: ShopBanner, b: ShopBanner) => (a.display_order ?? 0) - (b.display_order ?? 0));
    }

    return defaultShopBanners;
  } catch (err) {
    console.warn('getShopBanners error, returning defaults:', err);
    return defaultShopBanners;
  }
}

/**
 * Helper to update the banner list in `site_settings`.
 */
async function saveBannersToSettings(banners: ShopBanner[]): Promise<void> {
  const supabase = getSupabaseServerClient(true);
  if (!supabase) return;

  await supabase.from('site_settings').upsert(
    {
      key: 'shop_banners',
      value: banners as any,
      description: 'Shop hero banners carousel items',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' }
  );
}

/**
 * Create a new shop banner.
 */
export async function createShopBanner(banner: Omit<ShopBanner, 'id'> & { id?: string }): Promise<ShopBanner> {
  const newId = banner.id || `banner_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const hideTitle = Boolean(banner.hide_title);
  const hidePrice = Boolean(banner.hide_price);
  const hideButton = Boolean(banner.hide_button);

  const newBanner: ShopBanner = {
    id: newId,
    title: (banner.title || '').trim(),
    category: banner.category?.trim() || '',
    price: banner.price?.trim() || '',
    image_url: banner.image_url.trim(),
    link_url: banner.link_url?.trim() || '',
    button_text: banner.button_text?.trim() || '',
    display_order: Number(banner.display_order ?? 1),
    active: banner.active !== false,
    hide_title: hideTitle,
    hide_price: hidePrice,
    hide_button: hideButton,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const supabase = getSupabaseServerClient(true);
  if (!supabase) {
    throw new Error('Supabase client not configured.');
  }

  // Save metadata to site_settings
  const meta = await getShopBannersMeta();
  meta[newId] = { hide_title: hideTitle, hide_price: hidePrice, hide_button: hideButton };
  await saveShopBannersMeta(meta);

  // Try dedicated table (pass base columns to avoid column mismatch)
  await supabase
    .from('shop_banners')
    .insert({
      id: newBanner.id,
      title: newBanner.title || 'Banner',
      category: newBanner.category,
      price: newBanner.price,
      image_url: newBanner.image_url,
      link_url: newBanner.link_url,
      button_text: newBanner.button_text,
      display_order: newBanner.display_order,
      active: newBanner.active,
    });

  // Also sync site_settings 'shop_banners'
  const current = await getShopBanners();
  const exists = current.some((b) => String(b.id) === String(newBanner.id));
  const updatedList = exists
    ? current.map((b) => (String(b.id) === String(newBanner.id) ? newBanner : b))
    : [...current, newBanner];
  await saveBannersToSettings(updatedList);

  return newBanner;
}

/**
 * Update an existing shop banner.
 */
export async function updateShopBanner(id: string, updates: Partial<ShopBanner>): Promise<ShopBanner> {
  const supabase = getSupabaseServerClient(true);
  if (!supabase) {
    throw new Error('Supabase client not configured.');
  }

  // Update metadata in site_settings
  const meta = await getShopBannersMeta();
  const currentMeta = meta[id] || {};
  if (updates.hide_title !== undefined) currentMeta.hide_title = Boolean(updates.hide_title);
  if (updates.hide_price !== undefined) currentMeta.hide_price = Boolean(updates.hide_price);
  if (updates.hide_button !== undefined) currentMeta.hide_button = Boolean(updates.hide_button);
  meta[id] = currentMeta;
  await saveShopBannersMeta(meta);

  const payload: any = {
    updated_at: new Date().toISOString(),
  };
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.price !== undefined) payload.price = updates.price;
  if (updates.image_url !== undefined) payload.image_url = updates.image_url;
  if (updates.link_url !== undefined) payload.link_url = updates.link_url;
  if (updates.button_text !== undefined) payload.button_text = updates.button_text;
  if (updates.display_order !== undefined) payload.display_order = Number(updates.display_order);
  if (updates.active !== undefined) payload.active = Boolean(updates.active);

  // Try dedicated table
  await supabase
    .from('shop_banners')
    .update(payload)
    .eq('id', id);

  // Also sync in site_settings
  const current = await getShopBanners();
  const index = current.findIndex((b) => String(b.id) === String(id));
  let updatedBanner: ShopBanner;
  if (index !== -1) {
    updatedBanner = {
      ...current[index],
      ...updates,
      hide_title: currentMeta.hide_title,
      hide_price: currentMeta.hide_price,
      hide_button: currentMeta.hide_button,
      updated_at: new Date().toISOString(),
    };
    current[index] = updatedBanner;
    await saveBannersToSettings(current);
  } else {
    updatedBanner = {
      id,
      title: updates.title || '',
      category: updates.category || '',
      price: updates.price || '',
      image_url: updates.image_url || '',
      link_url: updates.link_url || '',
      button_text: updates.button_text || '',
      display_order: Number(updates.display_order ?? 0),
      active: updates.active !== false,
      hide_title: currentMeta.hide_title,
      hide_price: currentMeta.hide_price,
      hide_button: currentMeta.hide_button,
      updated_at: new Date().toISOString(),
    };
  }

  return updatedBanner;
}

/**
 * Delete a shop banner.
 */
export async function deleteShopBanner(id: string): Promise<boolean> {
  const supabase = getSupabaseServerClient(true);
  if (!supabase) {
    throw new Error('Supabase client not configured.');
  }

  // Remove from metadata
  const meta = await getShopBannersMeta();
  if (meta[id]) {
    delete meta[id];
    await saveShopBannersMeta(meta);
  }

  await supabase
    .from('shop_banners')
    .delete()
    .eq('id', id);

  // Delete from site_settings
  const current = await getShopBanners();
  const filtered = current.filter((b) => String(b.id) !== String(id));
  await saveBannersToSettings(filtered);

  return true;
}
