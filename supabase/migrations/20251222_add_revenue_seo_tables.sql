-- Migration: Add tables for Revenue Dashboard and SEO Tracker
-- Date: 2024-12-22

-- ============================================
-- 1. SUBSCRIPTIONS TABLE (Stripe data)
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Stripe identifiers
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_price_id TEXT,

  -- Link to taxi service
  city_slug TEXT NOT NULL,
  taxi_service_name TEXT NOT NULL,

  -- Plan type and status
  plan_type TEXT NOT NULL CHECK (plan_type IN ('premium', 'partner')),
  status TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete', 'trialing')),

  -- Price data (in cents)
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'eur',

  -- Billing period
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,

  -- Customer info
  customer_email TEXT,
  customer_name TEXT,

  -- Metadata (for any extra info)
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_type ON subscriptions(plan_type);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_subscriptions_city ON subscriptions(city_slug);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_email ON subscriptions(customer_email);

-- ============================================
-- 2. SUBSCRIPTION EVENTS TABLE (History)
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,

  event_type TEXT NOT NULL, -- 'created', 'renewed', 'canceled', 'payment_failed', 'updated'
  stripe_event_id TEXT UNIQUE,

  -- Event details
  amount_cents INTEGER,
  previous_status TEXT,
  new_status TEXT,

  -- Extra data
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sub_events_subscription ON subscription_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_sub_events_type ON subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_sub_events_date ON subscription_events(created_at);

-- ============================================
-- 3. SEO SNAPSHOTS TABLE (GSC page data)
-- ============================================
CREATE TABLE IF NOT EXISTS seo_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Page identification
  page_url TEXT NOT NULL,
  city_slug TEXT,

  -- GSC metrics
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr DECIMAL(5,4) DEFAULT 0, -- e.g., 0.0523 = 5.23%
  position DECIMAL(5,2) DEFAULT 0, -- e.g., 3.45

  -- Top keywords for this page (JSON array)
  top_keywords JSONB DEFAULT '[]',

  -- Date range of the data
  date_start DATE NOT NULL,
  date_end DATE NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate entries for same page and date range
  UNIQUE(page_url, date_start, date_end)
);

CREATE INDEX IF NOT EXISTS idx_seo_city ON seo_snapshots(city_slug);
CREATE INDEX IF NOT EXISTS idx_seo_date ON seo_snapshots(date_start, date_end);
CREATE INDEX IF NOT EXISTS idx_seo_clicks ON seo_snapshots(clicks DESC);
CREATE INDEX IF NOT EXISTS idx_seo_position ON seo_snapshots(position);

-- ============================================
-- 4. KEYWORD RANKINGS TABLE (Individual keywords)
-- ============================================
CREATE TABLE IF NOT EXISTS keyword_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Keyword and city
  keyword TEXT NOT NULL,
  city_slug TEXT,
  page_url TEXT,

  -- Position data
  position DECIMAL(5,2) NOT NULL,
  previous_position DECIMAL(5,2),

  -- Metrics
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr DECIMAL(5,4) DEFAULT 0,

  -- Snapshot date
  snapshot_date DATE NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate entries
  UNIQUE(keyword, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_keywords_city ON keyword_rankings(city_slug);
CREATE INDEX IF NOT EXISTS idx_keywords_date ON keyword_rankings(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_keywords_position ON keyword_rankings(position);
CREATE INDEX IF NOT EXISTS idx_keywords_keyword ON keyword_rankings(keyword);

-- ============================================
-- 5. HELPER FUNCTION: Get Monthly Revenue
-- ============================================
CREATE OR REPLACE FUNCTION get_monthly_revenue(months_back INTEGER DEFAULT 12)
RETURNS TABLE (
  month TEXT,
  mrr DECIMAL,
  premium_count INTEGER,
  partner_count INTEGER,
  new_subscriptions INTEGER,
  canceled_subscriptions INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH months AS (
    SELECT
      to_char(date_trunc('month', NOW() - (n || ' months')::interval), 'YYYY-MM') as month,
      date_trunc('month', NOW() - (n || ' months')::interval) as month_start,
      date_trunc('month', NOW() - (n || ' months')::interval) + interval '1 month' - interval '1 day' as month_end
    FROM generate_series(0, months_back - 1) n
  ),
  monthly_subs AS (
    SELECT
      m.month,
      COALESCE(SUM(CASE WHEN s.status = 'active' THEN s.amount_cents ELSE 0 END) / 100.0, 0) as mrr,
      COALESCE(COUNT(CASE WHEN s.status = 'active' AND s.plan_type = 'premium' THEN 1 END), 0)::INTEGER as premium_count,
      COALESCE(COUNT(CASE WHEN s.status = 'active' AND s.plan_type = 'partner' THEN 1 END), 0)::INTEGER as partner_count
    FROM months m
    LEFT JOIN subscriptions s ON s.created_at <= m.month_end AND (s.canceled_at IS NULL OR s.canceled_at > m.month_start)
    GROUP BY m.month
  ),
  monthly_events AS (
    SELECT
      m.month,
      COALESCE(COUNT(CASE WHEN se.event_type = 'created' THEN 1 END), 0)::INTEGER as new_subs,
      COALESCE(COUNT(CASE WHEN se.event_type = 'canceled' THEN 1 END), 0)::INTEGER as canceled_subs
    FROM months m
    LEFT JOIN subscription_events se ON to_char(se.created_at, 'YYYY-MM') = m.month
    GROUP BY m.month
  )
  SELECT
    ms.month,
    ms.mrr,
    ms.premium_count,
    ms.partner_count,
    me.new_subs,
    me.canceled_subs
  FROM monthly_subs ms
  JOIN monthly_events me ON ms.month = me.month
  ORDER BY ms.month DESC;
END;
$$;

-- ============================================
-- 6. RLS POLICIES (Admin only access)
-- ============================================

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_rankings ENABLE ROW LEVEL SECURITY;

-- Note: These tables are accessed via API routes with admin auth,
-- so we don't need user-based RLS policies. The service role key
-- will be used for all operations.

-- Grant access to service role
GRANT ALL ON subscriptions TO service_role;
GRANT ALL ON subscription_events TO service_role;
GRANT ALL ON seo_snapshots TO service_role;
GRANT ALL ON keyword_rankings TO service_role;
