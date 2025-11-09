-- System alerts table for tracking automation events and failures
CREATE TABLE IF NOT EXISTS system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'retell_ai_failure', 'billing_issue', 'integration_error', etc.
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  error_message TEXT,
  error_details JSONB,
  retell_response JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying unresolved alerts
CREATE INDEX IF NOT EXISTS idx_system_alerts_unresolved ON system_alerts(organization_id, resolved, created_at) WHERE resolved = FALSE;

-- Index for alert type queries
CREATE INDEX IF NOT EXISTS idx_system_alerts_type ON system_alerts(type, created_at);

