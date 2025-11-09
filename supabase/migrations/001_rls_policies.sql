-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policy for leads table
-- Users can only access leads from their organization
CREATE POLICY "Users can view leads from their organization"
  ON leads FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE supabase_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert leads for their organization"
  ON leads FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE supabase_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update leads from their organization"
  ON leads FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE supabase_user_id = auth.uid()
    )
  );

-- RLS Policy for integrations table
CREATE POLICY "Users can view integrations from their organization"
  ON integrations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE supabase_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage integrations for their organization"
  ON integrations FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE supabase_user_id = auth.uid()
    )
  );

-- RLS Policy for organizations table
CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM users WHERE supabase_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their organization"
  ON organizations FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM users WHERE supabase_user_id = auth.uid()
    )
  );

-- RLS Policy for users table
CREATE POLICY "Users can view users from their organization"
  ON users FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE supabase_user_id = auth.uid()
    )
  );

