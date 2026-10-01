export type TabType = 'dashboard' | 'shows' | 'media' | 'inquiries' | 'analytics' | 'socials' | 'store';

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

export interface Inquiry {
  id: string | number;
  subject?: string;
  email?: string;
  message?: string;
  category?: string;
  status?: string;
  created_at?: string;
  ip_address?: string;
}

export interface AnalyticsData {
  hasData?: boolean;
  totalViews?: number;
  viewsToday?: number;
  uniqueVisitors?: number;
  uniqueVisitorsToday?: number;
  dailyTrend?: Array<{
    date?: string;
    shortDay: string;
    label: string;
    views: number;
    uniqueVisitors: number;
  }>;
  topPages?: Array<{
    path: string;
    count: number;
    percentage: number;
  }>;
  devices?: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;
  sources?: Array<{
    source: string;
    count: number;
  }>;
  osBreakdown?: Array<{
    os: string;
    count: number;
  }>;
  recentVisits?: Array<{
    id?: string;
    path?: string;
    device?: string;
    browser?: string;
    os?: string;
    referrer?: string;
    created_at?: string;
  }>;
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

export interface NotificationState {
  type: 'success' | 'error';
  message: string;
}
