export type {
  AdminRole,
  AdminUserPublic,
  AdminUser,
  SupabaseConnectionDiagnostic,
  CloudinaryConnectionDiagnostic,
  ShopifyConnectionDiagnostic,
  MetaPixelConnectionDiagnostic,
  Ga4ConnectionDiagnostic,
  ServiceConnectionDiagnostics,
  Show,
  MediaItem,
  ShopBanner,
  ShopifyProductVariantItem,
  ShopifyProductItem,
  Inquiry,
  DailyTrendPoint,
  TopPageMetric,
  DeviceMetric,
  TrafficSourceMetric,
  OsBreakdownMetric,
  BrowserMetric,
  RecentVisitEntry,
  AnalyticsData,
  SocialForm,
} from '@/lib/types/admin';

import type { AdminRole } from '@/lib/types/admin';

export type TabType =
  | 'dashboard'
  | 'shows'
  | 'media'
  | 'inquiries'
  | 'analytics'
  | 'metapixel'
  | 'socials'
  | 'store'
  | 'admins';

export interface NotificationState {
  type: 'success' | 'error';
  message: string;
}

export type NotifyHandler = (type: 'success' | 'error', message: string) => void;

export interface ShowFormDraft {
  name: string;
  subtitle: string;
  date_code: string;
  date_formatted: string;
  event_date: string;
  venue: string;
  time: string;
  poster_url: string;
  tags: string;
  featured: boolean;
  month: string;
  posh_url: string;
  status: string;
}

export interface ShowEditDraft {
  id: string;
  name: string;
  subtitle: string;
  date_code: string;
  date_formatted: string;
  event_date: string;
  venue: string;
  time: string;
  poster_url: string;
  tags: string;
  featured: boolean;
  month: string;
  posh_url: string;
  status: string;
}

export interface MediaFormDraft {
  name: string;
  date: string;
  thumbnail_url: string;
  facebook_url: string;
  category: string;
}

export interface MediaEditDraft {
  id: string | number;
  name: string;
  date: string;
  thumbnail_url: string;
  facebook_url: string;
  category: string;
  display_order?: number;
}

export interface ShopBannerFormDraft {
  title: string;
  category: string;
  price: string;
  image_url: string;
  mobile_image_url: string;
  link_url: string;
  button_text: string;
  display_order: number;
  active: boolean;
  hide_title: boolean;
  hide_price: boolean;
  hide_button: boolean;
}

export interface IdentifiedAdminPreview {
  username: string;
  name: string;
  role: AdminRole;
}

export interface PixelEventLogEntry {
  id: string;
  name: string;
  type: 'standard' | 'custom';
  timestamp: string;
  date: string;
  params?: Record<string, unknown>;
  status: 'sent' | 'simulated';
}

export type PixelEventFilter = 'all' | 'standard' | 'custom';

export type StoreSubTab = 'banners' | 'products';

export type ProductStockFilter = 'all' | 'in_stock' | 'sold_out';

export type InquiryFilterCriterion =
  | 'all'
  | 'unread'
  | 'Booking'
  | 'Collaboration'
  | 'Press'
  | 'General'
  | 'replied'
  | string;

export interface AdminCreationDraft {
  username: string;
  name: string;
  role: AdminRole;
  password: string;
  confirmPassword: string;
  pin: string;
  confirmPin: string;
}
