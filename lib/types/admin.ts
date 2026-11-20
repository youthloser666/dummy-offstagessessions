export type AdminRole = 'admin' | 'superadmin' | 'manager';

export interface AdminUserPublic {
  id: string;
  username: string;
  name: string;
  role: AdminRole;
  status: 'active' | 'suspended';
  created_at: string;
  last_login_at?: string | null;
}

export interface AdminUser extends AdminUserPublic {
  password_hash: string;
  password_salt: string;
  pin_hash: string;
  pin_salt: string;
}

export interface SupabaseConnectionDiagnostic {
  configured: boolean;
  connected: boolean;
  message: string;
  showsCount?: number;
  hasServiceRole?: boolean;
}

export interface CloudinaryConnectionDiagnostic {
  configured: boolean;
  connected: boolean;
  message: string;
  cloudName?: string;
}

export interface ShopifyConnectionDiagnostic {
  configured: boolean;
  connected: boolean;
  message: string;
  storeDomain?: string;
  productsCount?: number;
}

export interface MetaPixelConnectionDiagnostic {
  configured: boolean;
  connected: boolean;
  pixelId?: string;
  message: string;
}

export interface Ga4ConnectionDiagnostic {
  configured: boolean;
  connected: boolean;
  measurementId?: string;
  message: string;
}

export interface ServiceConnectionDiagnostics {
  timestamp: string;
  status: 'all_connected' | 'partial_or_offline';
  supabase: SupabaseConnectionDiagnostic;
  cloudinary: CloudinaryConnectionDiagnostic;
  shopify: ShopifyConnectionDiagnostic;
  metaPixel: MetaPixelConnectionDiagnostic;
  ga4: Ga4ConnectionDiagnostic;
}

export interface Show {
  id: string;
  name: string;
  subtitle?: string;
  date?: string;
  date_code?: string;
  dateCode?: string;
  date_formatted?: string;
  dateFormatted?: string;
  event_date?: string;
  eventDate?: string;
  venue: string;
  time?: string;
  poster?: string;
  poster_url?: string;
  posterUrl?: string;
  tags?: string[] | string;
  featured?: boolean;
  month?: string;
  posh_url?: string;
  poshUrl?: string;
  ticket_url?: string;
  ticketUrl?: string;
  status: 'upcoming' | 'past' | 'cancelled' | string;
}

export interface MediaItem {
  id: string | number;
  name: string;
  date: string;
  thumbnail?: string;
  thumbnail_url?: string;
  image?: string;
  image_url?: string;
  facebook_url?: string;
  facebookUrl?: string;
  category?: string;
  display_order?: number;
}

export interface ShopBanner {
  id: string;
  title: string;
  category: string;
  price?: string;
  image_url: string;
  mobile_image_url?: string;
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

export interface ShopifyProductVariantItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  available: boolean;
}

export interface ShopifyProductItem {
  id: string;
  shopifyId: string;
  name: string;
  handle: string;
  description: string;
  descriptionHtml?: string;
  price: number;
  currency: string;
  image: string;
  images?: string[];
  hoverImage?: string;
  category: string;
  sizes: string[];
  variantsList?: ShopifyProductVariantItem[];
  defaultVariantId?: string;
  availableForSale: boolean;
  badge?: string;
  tags?: string[];
}

export interface Inquiry {
  id: string | number;
  name?: string;
  subject?: string;
  email?: string;
  message?: string;
  category?: string;
  status?: string;
  created_at?: string;
  ip_address?: string;
}

export interface DailyTrendPoint {
  date?: string;
  shortDay: string;
  label: string;
  views: number;
  uniqueVisitors: number;
}

export interface TopPageMetric {
  path: string;
  count: number;
  percentage: number;
}

export interface DeviceMetric {
  device: string;
  count: number;
  percentage: number;
}

export interface TrafficSourceMetric {
  source: string;
  count: number;
  percentage?: number;
}

export interface OsBreakdownMetric {
  os: string;
  count: number;
  percentage?: number;
}

export interface BrowserMetric {
  browser: string;
  count: number;
  percentage: number;
}

export interface RecentVisitEntry {
  id?: string | number;
  path?: string;
  device?: string;
  browser?: string;
  os?: string;
  referrer?: string;
  country?: string;
  created_at?: string;
}

export interface AnalyticsData {
  hasData?: boolean;
  totalViews?: number;
  viewsToday?: number;
  uniqueVisitors?: number;
  uniqueVisitorsToday?: number;
  dailyTrend?: DailyTrendPoint[];
  topPages?: TopPageMetric[];
  devices?: DeviceMetric[];
  browsers?: BrowserMetric[];
  sources?: TrafficSourceMetric[];
  osBreakdown?: OsBreakdownMetric[];
  recentVisits?: RecentVisitEntry[];
  note?: string;
}

export interface SocialForm {
  instagram: string;
  tiktok: string;
  facebook: string;
  email: string;
  spotify: string;
  soundcloud: string;
  youtube: string;
}

