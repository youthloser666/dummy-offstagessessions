import type {
  AdminCreationDraft,
  MediaFormDraft,
  ShopBannerFormDraft,
  ShowFormDraft,
  SocialForm,
} from '../types';

export const ADMIN_PASSKEY_FALLBACK = 'offstage-session-admin-2026';

export const createInitialShowDraft = (): ShowFormDraft => ({
  name: '',
  subtitle: '',
  date_code: '',
  date_formatted: '',
  event_date: '',
  venue: '',
  time: '',
  poster_url: '',
  tags: 'House, Techno',
  featured: false,
  month: 'August 2026',
  posh_url: '',
  status: 'upcoming',
});

export const createInitialMediaDraft = (): MediaFormDraft => ({
  name: '',
  date: '',
  thumbnail_url: '',
  facebook_url: 'https://www.facebook.com/offstagesessions',
  category: 'photo',
});

export const createInitialBannerDraft = (): ShopBannerFormDraft => ({
  title: '',
  category: '',
  price: '',
  image_url: '',
  mobile_image_url: '',
  link_url: '/shop',
  button_text: '',
  display_order: 1,
  active: true,
  hide_title: false,
  hide_price: false,
  hide_button: false,
});

export const createInitialAdminCreationDraft = (): AdminCreationDraft => ({
  username: '',
  name: '',
  role: 'admin',
  password: '',
  confirmPassword: '',
  pin: '',
  confirmPin: '',
});

export const DEFAULT_SOCIAL_FORM: SocialForm = {
  instagram: 'https://instagram.com/offstagesession',
  tiktok: 'https://www.tiktok.com/@offstagesessions',
  facebook: 'https://www.facebook.com/offstagesessions',
  email: 'offstage@offstagesessions.com',
  spotify: '',
  soundcloud: '',
  youtube: '',
};

export const SITE_SETTINGS_SQL_SNIPPET = `CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admin write site_settings" ON public.site_settings FOR ALL USING (true);`;

export const META_PIXEL_CONFIG = {
  pixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || '435764085453303',
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-47KT31FK3L',
} as const;

export interface MetaPixelStandardEventAuditRow {
  eventName: string;
  triggerLocationPrefix?: string;
  triggerCode: string;
  triggerSuffix?: string;
  secondCode?: string;
  parameters: string;
  optimizationGoal: string;
  statusLabel: string;
}

export const META_PIXEL_STANDARD_EVENTS_MATRIX: MetaPixelStandardEventAuditRow[] = [
  {
    eventName: 'PageView',
    triggerCode: 'app/layout.tsx',
    triggerSuffix: ' (ClientShell & SPA routes)',
    parameters: 'Automatic (URL pathname)',
    optimizationGoal: 'Traffic Campaigns, Custom Audiences',
    statusLabel: 'Active',
  },
  {
    eventName: 'ViewContent',
    triggerCode: 'components/ShowsContent.tsx',
    triggerSuffix: ' & ',
    secondCode: 'app/shop/page.tsx',
    parameters: 'content_name, category, value',
    optimizationGoal: 'Catalog Sales, Dynamic Retargeting',
    statusLabel: 'Active',
  },
  {
    eventName: 'AddToCart',
    triggerCode: 'app/shop/page.tsx',
    triggerSuffix: ' (Shopify Cart Add)',
    parameters: 'content_name, content_ids, value, currency',
    optimizationGoal: 'Abandoned Cart Retargeting, E-commerce ROAS',
    statusLabel: 'Active',
  },
  {
    eventName: 'InitiateCheckout',
    triggerCode: 'app/shop/page.tsx',
    triggerSuffix: ' (Shopify Checkout Button)',
    parameters: 'content_ids, num_items, value, currency',
    optimizationGoal: 'High-Intent Conversion Ads',
    statusLabel: 'Active',
  },
  {
    eventName: 'Lead',
    triggerCode: 'components/ContactEmailForm.tsx',
    triggerSuffix: ' (/contact)',
    parameters: 'content_name, category ("Booking / VIP Table")',
    optimizationGoal: 'Lead Generation Campaigns, Value Optimization',
    statusLabel: 'Active',
  },
  {
    eventName: 'Contact',
    triggerCode: 'components/SocialDock.tsx',
    triggerSuffix: ' & Contact Footer',
    parameters: 'content_name, content_category',
    optimizationGoal: 'Audience Engagement, DM / Message Ads',
    statusLabel: 'Active',
  },
  {
    eventName: 'Search',
    triggerCode: '',
    triggerSuffix: 'Shows & Media Genre Filtering',
    parameters: 'search_string ("House", "Techno", "Bass")',
    optimizationGoal: 'Genre-specific Ad Personalization',
    statusLabel: 'Active',
  },
];

