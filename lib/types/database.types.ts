export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      shows: {
        Row: {
          id: string;
          name: string;
          subtitle: string | null;
          date_code: string;
          date_formatted: string;
          event_date: string | null;
          venue: string;
          time: string;
          poster_url: string;
          tags: string[];
          featured: boolean;
          month: string;
          ticket_url: string | null;
          posh_url: string | null;
          status: 'upcoming' | 'past' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          subtitle?: string | null;
          date_code?: string;
          date_formatted?: string;
          event_date?: string | null;
          venue: string;
          time?: string;
          poster_url: string;
          tags?: string[];
          featured?: boolean;
          month?: string;
          ticket_url?: string | null;
          posh_url?: string | null;
          status?: 'upcoming' | 'past' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          subtitle?: string | null;
          date_code?: string;
          date_formatted?: string;
          event_date?: string | null;
          venue?: string;
          time?: string;
          poster_url?: string;
          tags?: string[];
          featured?: boolean;
          month?: string;
          ticket_url?: string | null;
          posh_url?: string | null;
          status?: 'upcoming' | 'past' | 'cancelled';
          updated_at?: string;
        };
        Relationships: [];
      };
      media_archives: {
        Row: {
          id: string | number;
          name: string;
          date: string;
          thumbnail_url: string;
          image_url: string | null;
          facebook_url: string;
          category: 'photo' | 'video' | 'mix' | 'gallery' | 'highlight';
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string | number;
          name: string;
          date?: string;
          thumbnail_url: string;
          image_url?: string | null;
          facebook_url: string;
          category?: 'photo' | 'video' | 'mix' | 'gallery' | 'highlight';
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string | number;
          name?: string;
          date?: string;
          thumbnail_url?: string;
          image_url?: string | null;
          facebook_url?: string;
          category?: 'photo' | 'video' | 'mix' | 'gallery' | 'highlight';
          display_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      contact_inquiries: {
        Row: {
          id: string | number;
          name: string | null;
          email: string | null;
          subject: string;
          category?: string;
          message: string;
          status: 'unread' | 'read' | 'archived' | 'replied';
          ip_address?: string | null;
          created_at: string;
        };
        Insert: {
          id?: string | number;
          name?: string | null;
          email?: string | null;
          subject: string;
          category?: string;
          message: string;
          status?: 'unread' | 'read' | 'archived' | 'replied';
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string | number;
          name?: string | null;
          email?: string | null;
          subject?: string;
          category?: string;
          message?: string;
          status?: 'unread' | 'read' | 'archived' | 'replied';
          ip_address?: string | null;
        };
        Relationships: [];
      };
      page_views: {
        Row: {
          id: string | number;
          page_path: string;
          referrer: string | null;
          user_agent: string | null;
          device_type: string;
          browser: string | null;
          os: string | null;
          ip_hash: string | null;
          country: string | null;
          created_at: string;
        };
        Insert: {
          id?: string | number;
          page_path: string;
          referrer?: string | null;
          user_agent?: string | null;
          device_type?: string;
          browser?: string | null;
          os?: string | null;
          ip_hash?: string | null;
          country?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string | number;
          page_path?: string;
          referrer?: string | null;
          user_agent?: string | null;
          device_type?: string;
          browser?: string | null;
          os?: string | null;
          ip_hash?: string | null;
          country?: string | null;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          key: string;
          value: Json;
          description: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          description?: string | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          description?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type DbShow = Database['public']['Tables']['shows']['Row'];
export type DbMedia = Database['public']['Tables']['media_archives']['Row'];
export type DbInquiry = Database['public']['Tables']['contact_inquiries']['Row'];
export type DbPageView = Database['public']['Tables']['page_views']['Row'];
export type DbSiteSetting = Database['public']['Tables']['site_settings']['Row'];
