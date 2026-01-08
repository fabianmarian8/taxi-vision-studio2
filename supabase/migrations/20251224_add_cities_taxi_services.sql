-- Migration: Add cities and taxi_services tables
-- Date: 2024-12-24
-- Purpose: Migrate cities.json data to Supabase for dynamic management

-- ============================================
-- 1. CITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  region TEXT NOT NULL,

  -- SEO fields
  description TEXT,
  meta_description TEXT,
  keywords TEXT[] DEFAULT '{}',

  -- Location
  latitude DECIMAL(10, 6),
  longitude DECIMAL(10, 6),

  -- Display
  hero_image TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cities_slug ON cities(slug);
CREATE INDEX IF NOT EXISTS idx_cities_region ON cities(region);
CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);

-- ============================================
-- 2. TAXI_SERVICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS taxi_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to city
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  city_slug TEXT NOT NULL, -- Denormalized for faster queries

  -- Basic info
  name TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  address TEXT,
  place_id TEXT, -- Google Place ID

  -- Premium/Partner status
  is_premium BOOLEAN DEFAULT FALSE,
  is_promotional BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMPTZ,

  -- Link to subscription (for auto-enable)
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,

  -- Display order (lower = higher priority)
  display_order INTEGER DEFAULT 100,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_taxi_services_city_id ON taxi_services(city_id);
CREATE INDEX IF NOT EXISTS idx_taxi_services_city_slug ON taxi_services(city_slug);
CREATE INDEX IF NOT EXISTS idx_taxi_services_premium ON taxi_services(is_premium) WHERE is_premium = TRUE;
CREATE INDEX IF NOT EXISTS idx_taxi_services_subscription ON taxi_services(subscription_id);
CREATE INDEX IF NOT EXISTS idx_taxi_services_name ON taxi_services(name);

-- ============================================
-- 3. FUNCTION: Auto-update premium status
-- ============================================
CREATE OR REPLACE FUNCTION update_taxi_service_premium_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- When subscription status changes, update taxi_service
  IF NEW.status = 'active' THEN
    UPDATE taxi_services
    SET
      is_premium = TRUE,
      premium_expires_at = NEW.current_period_end,
      updated_at = NOW()
    WHERE subscription_id = NEW.id;
  ELSE
    UPDATE taxi_services
    SET
      is_premium = FALSE,
      premium_expires_at = NULL,
      updated_at = NOW()
    WHERE subscription_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================
-- 4. TRIGGER: Auto-update on subscription change
-- ============================================
DROP TRIGGER IF EXISTS trigger_subscription_status_change ON subscriptions;
CREATE TRIGGER trigger_subscription_status_change
  AFTER UPDATE OF status ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_taxi_service_premium_status();

-- ============================================
-- 5. FUNCTION: Link subscription to taxi service
-- ============================================
CREATE OR REPLACE FUNCTION link_subscription_to_taxi_service(
  p_subscription_id UUID,
  p_city_slug TEXT,
  p_taxi_service_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_taxi_service_id UUID;
  v_subscription_status TEXT;
  v_period_end TIMESTAMPTZ;
BEGIN
  -- Find matching taxi service
  SELECT id INTO v_taxi_service_id
  FROM taxi_services
  WHERE city_slug = p_city_slug
    AND LOWER(name) = LOWER(p_taxi_service_name)
  LIMIT 1;

  IF v_taxi_service_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get subscription details
  SELECT status, current_period_end INTO v_subscription_status, v_period_end
  FROM subscriptions
  WHERE id = p_subscription_id;

  -- Update taxi service
  UPDATE taxi_services
  SET
    subscription_id = p_subscription_id,
    is_premium = (v_subscription_status = 'active'),
    premium_expires_at = CASE WHEN v_subscription_status = 'active' THEN v_period_end ELSE NULL END,
    updated_at = NOW()
  WHERE id = v_taxi_service_id;

  RETURN TRUE;
END;
$$;

-- ============================================
-- 6. VIEW: Cities with taxi services count
-- ============================================
CREATE OR REPLACE VIEW cities_with_stats AS
SELECT
  c.*,
  COUNT(ts.id) as taxi_services_count,
  COUNT(ts.id) FILTER (WHERE ts.is_premium = TRUE) as premium_count
FROM cities c
LEFT JOIN taxi_services ts ON ts.city_id = c.id
GROUP BY c.id;

-- ============================================
-- 7. RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxi_services ENABLE ROW LEVEL SECURITY;

-- Public read access (for website)
CREATE POLICY "Cities are publicly readable" ON cities
  FOR SELECT USING (true);

CREATE POLICY "Taxi services are publicly readable" ON taxi_services
  FOR SELECT USING (true);

-- Service role has full access
GRANT ALL ON cities TO service_role;
GRANT ALL ON taxi_services TO service_role;
GRANT SELECT ON cities_with_stats TO service_role;

-- ============================================
-- 8. UPDATED_AT TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_cities_updated_at ON cities;
CREATE TRIGGER update_cities_updated_at
  BEFORE UPDATE ON cities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_taxi_services_updated_at ON taxi_services;
CREATE TRIGGER update_taxi_services_updated_at
  BEFORE UPDATE ON taxi_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
