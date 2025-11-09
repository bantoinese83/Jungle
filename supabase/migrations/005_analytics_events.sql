-- Analytics events table for storing tracked events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  properties JSONB,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT,
  url TEXT,
  user_agent TEXT,
  ip_address TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_analytics_events_event ON analytics_events(event, timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id, timestamp) WHERE user_id IS NOT NULL;

-- Index for property-based queries (e.g., filtering by CRM type)
CREATE INDEX IF NOT EXISTS idx_analytics_events_properties ON analytics_events USING GIN (properties);

-- Function to get event counts by type
CREATE OR REPLACE FUNCTION get_event_counts(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  event TEXT,
  count BIGINT
) AS $$
BEGIN
  -- Set secure search_path to prevent search_path injection
  SET search_path = pg_catalog, public;

  RETURN QUERY
  SELECT
    ae.event,
    COUNT(*)::BIGINT as count
  FROM analytics_events ae
  WHERE ae.timestamp BETWEEN start_date AND end_date
  GROUP BY ae.event
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get funnel metrics
CREATE OR REPLACE FUNCTION get_funnel_metrics(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  visitors BIGINT,
  demos BIGINT,
  signups BIGINT,
  onboardings BIGINT
) AS $$
BEGIN
  -- Set secure search_path to prevent search_path injection
  SET search_path = pg_catalog, public;

  RETURN QUERY
  SELECT
    (SELECT COUNT(DISTINCT session_id) FROM analytics_events WHERE timestamp BETWEEN start_date AND end_date)::BIGINT as visitors,
    (SELECT COUNT(*) FROM analytics_events WHERE event = 'demo_started' AND timestamp BETWEEN start_date AND end_date)::BIGINT as demos,
    (SELECT COUNT(*) FROM analytics_events WHERE event = 'signup_completed' AND timestamp BETWEEN start_date AND end_date)::BIGINT as signups,
    (SELECT COUNT(*) FROM analytics_events WHERE event = 'onboarding_completed' AND timestamp BETWEEN start_date AND end_date)::BIGINT as onboardings;
END;
$$ LANGUAGE plpgsql;

