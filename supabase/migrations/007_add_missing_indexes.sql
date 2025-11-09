-- Add missing indexes for performance and RLS policy efficiency

-- Index on users.supabase_user_id (used in all RLS policies)
CREATE INDEX IF NOT EXISTS idx_users_supabase_user_id ON users(supabase_user_id);

-- Composite index on integrations for common query pattern
CREATE INDEX IF NOT EXISTS idx_integrations_org_type ON integrations(organization_id, type);

-- Index on organizations.stripe_customer_id for Stripe webhook lookups
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer_id ON organizations(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Index on leads.organization_id + status for dashboard queries
CREATE INDEX IF NOT EXISTS idx_leads_org_status ON leads(organization_id, status);

-- Index on leads.ai_call_triggered_at for filtering
CREATE INDEX IF NOT EXISTS idx_leads_ai_call_triggered_at ON leads(ai_call_triggered_at) WHERE ai_call_triggered_at IS NOT NULL;

