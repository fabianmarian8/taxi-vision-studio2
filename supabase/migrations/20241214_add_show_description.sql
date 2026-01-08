-- Migration: Add show_description column to partner_drafts
-- Date: 2024-12-14

-- Add the column with default value true (so existing descriptions are shown)
ALTER TABLE partner_drafts ADD COLUMN IF NOT EXISTS show_description BOOLEAN DEFAULT true;

-- Update the RPC function to include show_description
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
  show_services BOOLEAN,
  gallery TEXT[],
  social_facebook TEXT,
  social_instagram TEXT
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
    pd.services,
    pd.show_services,
    pd.gallery,
    pd.social_facebook,
    pd.social_instagram
  FROM partner_drafts pd
  INNER JOIN partners p ON pd.partner_id = p.id
  WHERE p.slug = p_slug
    AND pd.status = 'approved'
  ORDER BY pd.updated_at DESC
  LIMIT 1;
END;
$$;
