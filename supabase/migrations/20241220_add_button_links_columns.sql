-- Migration: Add button links columns to partner_drafts
-- Date: 2024-12-20
-- These columns store editable contact buttons data

-- Add missing columns for contact buttons
ALTER TABLE partner_drafts ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE partner_drafts ADD COLUMN IF NOT EXISTS booking_url TEXT;
ALTER TABLE partner_drafts ADD COLUMN IF NOT EXISTS pricelist_url TEXT;
ALTER TABLE partner_drafts ADD COLUMN IF NOT EXISTS transport_rules_url TEXT;
ALTER TABLE partner_drafts ADD COLUMN IF NOT EXISTS contact_url TEXT;
ALTER TABLE partner_drafts ADD COLUMN IF NOT EXISTS services_description TEXT;

-- Update the RPC function to include new columns
-- NOTE: Column order MUST match TypeScript interface in /src/lib/partner-data.ts
-- NOTE: services and gallery are JSONB in DB, must be cast to TEXT[]
DROP FUNCTION IF EXISTS get_approved_partner_data(text);

CREATE OR REPLACE FUNCTION get_approved_partner_data(p_slug TEXT)
RETURNS TABLE (
  company_name TEXT,
  description TEXT,
  show_description BOOLEAN,
  phone TEXT,
  email TEXT,
  website TEXT,
  hero_image_url TEXT,
  hero_image_zoom INTEGER,
  hero_image_pos_x INTEGER,
  hero_image_pos_y INTEGER,
  hero_title TEXT,
  hero_subtitle TEXT,
  banner_title TEXT,
  banner_subtitle TEXT,
  services TEXT[],
  services_description TEXT,
  show_services BOOLEAN,
  gallery TEXT[],
  social_facebook TEXT,
  social_instagram TEXT,
  whatsapp TEXT,
  booking_url TEXT,
  pricelist_url TEXT,
  transport_rules_url TEXT,
  contact_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pd.company_name,
    pd.description,
    pd.show_description,
    pd.phone,
    pd.email,
    pd.website,
    pd.hero_image_url,
    pd.hero_image_zoom,
    pd.hero_image_pos_x,
    pd.hero_image_pos_y,
    pd.hero_title,
    pd.hero_subtitle,
    pd.banner_title,
    pd.banner_subtitle,
    ARRAY(SELECT jsonb_array_elements_text(pd.services))::TEXT[] as services,
    pd.services_description,
    pd.show_services,
    ARRAY(SELECT jsonb_array_elements_text(pd.gallery))::TEXT[] as gallery,
    pd.social_facebook,
    pd.social_instagram,
    pd.whatsapp,
    pd.booking_url,
    pd.pricelist_url,
    pd.transport_rules_url,
    pd.contact_url
  FROM partner_drafts pd
  INNER JOIN partners p ON pd.partner_id = p.id
  WHERE p.slug = p_slug
    AND pd.status = 'approved'
  ORDER BY pd.updated_at DESC
  LIMIT 1;
END;
$$;
