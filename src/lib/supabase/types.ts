export type PartnerStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface Partner {
  id: string;
  user_id: string;
  email: string;
  name: string;
  slug: string;
  city_slug: string;
  created_at: string;
  updated_at: string;
}

export interface PartnerDraft {
  id: string;
  partner_id: string;
  status: PartnerStatus;

  // Editovateľné polia
  company_name: string | null;
  description: string | null;
  show_description: boolean | null;
  phone: string | null;
  email: string | null;
  website: string | null;

  // Hero sekcia
  hero_image_url: string | null;
  hero_image_zoom: number | null;
  hero_image_pos_x: number | null;
  hero_image_pos_y: number | null;
  hero_title: string | null;
  hero_subtitle: string | null;

  // Banner v zozname
  banner_title: string | null;
  banner_subtitle: string | null;

  // Vzhlad sablony
  template_variant: string | null;

  // Služby a vozidlá
  services: string[] | null;
  show_services: boolean | null;
  vehicles: string[] | null;

  // Ceny
  prices: PriceItem[] | null;

  // Galéria
  gallery: string[] | null;

  // Sociálne siete
  social_facebook: string | null;
  social_instagram: string | null;

  // Schvaľovanie
  admin_notes: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;

  created_at: string;
  updated_at: string;
}

export interface PriceItem {
  destination: string;
  price: number;
  note?: string;
}

export interface PartnerWithDraft extends Partner {
  current_draft: PartnerDraft | null;
  approved_draft: PartnerDraft | null;
}

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      partners: {
        Row: Partner;
        Insert: Omit<Partner, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Partner, 'id'>>;
      };
      partner_drafts: {
        Row: PartnerDraft;
        Insert: Omit<PartnerDraft, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PartnerDraft, 'id'>>;
      };
    };
  };
}
