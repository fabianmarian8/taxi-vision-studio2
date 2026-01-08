-- Migration: Add click_events table for tracking user interactions
-- Date: 2024-12-24
-- Purpose: Track phone button clicks for analytics

-- ============================================
-- 1. CLICK_EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS click_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What was clicked
  event_type TEXT NOT NULL DEFAULT 'phone_click', -- phone_click, website_click, whatsapp_click

  -- Which taxi service
  city_slug TEXT NOT NULL,
  service_name TEXT NOT NULL,

  -- Optional: phone number that was clicked
  phone_number TEXT,

  -- User context (anonymous)
  user_agent TEXT,
  referer TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_click_events_city ON click_events(city_slug);
CREATE INDEX IF NOT EXISTS idx_click_events_service ON click_events(service_name);
CREATE INDEX IF NOT EXISTS idx_click_events_type ON click_events(event_type);
CREATE INDEX IF NOT EXISTS idx_click_events_created ON click_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_click_events_city_service ON click_events(city_slug, service_name);

-- ============================================
-- 2. RLS POLICIES
-- ============================================
ALTER TABLE click_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (for tracking)
CREATE POLICY "Anyone can insert click events" ON click_events
  FOR INSERT WITH CHECK (true);

-- Only authenticated users can read (for admin)
CREATE POLICY "Authenticated users can read click events" ON click_events
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================
-- 3. VIEW: Daily click stats per service
-- ============================================
CREATE OR REPLACE VIEW click_stats_daily AS
SELECT
  city_slug,
  service_name,
  event_type,
  DATE(created_at) as date,
  COUNT(*) as click_count
FROM click_events
GROUP BY city_slug, service_name, event_type, DATE(created_at)
ORDER BY date DESC, click_count DESC;

-- ============================================
-- 4. VIEW: Total clicks per service (all time)
-- ============================================
CREATE OR REPLACE VIEW click_stats_total AS
SELECT
  city_slug,
  service_name,
  event_type,
  COUNT(*) as total_clicks,
  MIN(created_at) as first_click,
  MAX(created_at) as last_click
FROM click_events
GROUP BY city_slug, service_name, event_type
ORDER BY total_clicks DESC;

-- Grant access to views
GRANT SELECT ON click_stats_daily TO authenticated;
GRANT SELECT ON click_stats_total TO authenticated;
GRANT SELECT ON click_stats_daily TO service_role;
GRANT SELECT ON click_stats_total TO service_role;
