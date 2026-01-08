-- Add template_variant column to partner_drafts table
-- This enables partner skin/theme selection

ALTER TABLE partner_drafts
ADD COLUMN IF NOT EXISTS template_variant TEXT DEFAULT 'classic';

-- Comment for documentation
COMMENT ON COLUMN partner_drafts.template_variant IS 'Partner page skin/theme variant: classic, metro, sunset, forest';
