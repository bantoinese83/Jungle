-- Add database constraints for data integrity

-- Add check constraint on leads.status to ensure valid values
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE leads ADD CONSTRAINT leads_status_check 
  CHECK (status IN ('pending', 'called_by_human', 'ai_triggered'));

-- Add check constraint on organizations.subscription_status
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_subscription_status_check;
ALTER TABLE organizations ADD CONSTRAINT organizations_subscription_status_check
  CHECK (subscription_status IN ('trial', 'active', 'past_due', 'canceled', 'incomplete'));

-- Add check constraint on organizations.speed_to_lead_minutes
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_speed_to_lead_minutes_check;
ALTER TABLE organizations ADD CONSTRAINT organizations_speed_to_lead_minutes_check
  CHECK (speed_to_lead_minutes >= 1 AND speed_to_lead_minutes <= 60);

-- Add check constraint on integrations.type
ALTER TABLE integrations DROP CONSTRAINT IF EXISTS integrations_type_check;
ALTER TABLE integrations ADD CONSTRAINT integrations_type_check
  CHECK (type IN ('gohighlevel', 'close', 'hubspot', 'retell_ai'));

-- Add NOT NULL constraint on organizations.name
ALTER TABLE organizations ALTER COLUMN name SET NOT NULL;

-- Add NOT NULL constraint on leads.name
ALTER TABLE leads ALTER COLUMN name SET NOT NULL;

-- Add NOT NULL constraint on leads.phone
ALTER TABLE leads ALTER COLUMN phone SET NOT NULL;

