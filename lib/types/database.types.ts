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
          id: string;
          name: string;
          date: string;
          thumbnail_url: string;
          image_url: string | null;
          facebook_url: string;
          category: 'photo' | 'video' | 'mix' | 'gallery';
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          date?: string;
          thumbnail_url: string;
          image_url?: string | null;
          facebook_url: string;
          category?: 'photo' | 'video' | 'mix' | 'gallery';
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          date?: string;
          thumbnail_url?: string;
          image_url?: string | null;
          facebook_url?: string;
          category?: 'photo' | 'video' | 'mix' | 'gallery';
          display_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      contact_inquiries: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          subject: string;
          message: string;
          status: 'unread' | 'read' | 'replied';
          created_at: string;
        };
        Insert: {
          id?: string;
          name?: string | null;
          email?: string | null;
          subject: string;
          message: string;
          status?: 'unread' | 'read' | 'replied';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string | null;
          subject?: string;
          message?: string;
          status?: 'unread' | 'read' | 'replied';
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
