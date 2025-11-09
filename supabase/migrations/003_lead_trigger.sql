-- Function to calculate speed to lead when a lead is created or updated
CREATE OR REPLACE FUNCTION calculate_speed_to_lead()
RETURNS TRIGGER AS $$
BEGIN
  -- Set secure search_path to prevent search_path injection
  SET search_path = pg_catalog, public;

  -- Calculate minutes between received_at and now (or first_call_at if exists)
  IF NEW.first_call_at IS NOT NULL THEN
    NEW.speed_to_lead_minutes := EXTRACT(EPOCH FROM (NEW.first_call_at - NEW.received_at)) / 60;
  ELSIF NEW.status = 'pending' THEN
    -- For pending leads, calculate time since received
    NEW.speed_to_lead_minutes := EXTRACT(EPOCH FROM (NOW() - NEW.received_at)) / 60;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate speed to lead
CREATE TRIGGER calculate_speed_to_lead_trigger
  BEFORE INSERT OR UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION calculate_speed_to_lead();

-- Function to trigger AI caller when threshold is exceeded
CREATE OR REPLACE FUNCTION check_ai_caller_threshold()
RETURNS TRIGGER AS $$
DECLARE
  org_threshold INTEGER;
BEGIN
  -- Set secure search_path to prevent search_path injection
  SET search_path = pg_catalog, public;

  -- Get organization's speed to lead threshold
  SELECT speed_to_lead_minutes INTO org_threshold
  FROM organizations
  WHERE id = NEW.organization_id;

  -- If speed to lead exceeds threshold and status is still pending, trigger AI caller
  IF NEW.status = 'pending' 
     AND NEW.speed_to_lead_minutes IS NOT NULL 
     AND NEW.speed_to_lead_minutes >= org_threshold 
     AND NEW.ai_call_triggered_at IS NULL THEN
    
    -- Call the edge function (this would be done via pg_net or similar in production)
    -- For now, we'll just log it - actual trigger should be via database webhook or scheduled job
    RAISE NOTICE 'AI caller should be triggered for lead %', NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check threshold
CREATE TRIGGER check_ai_caller_threshold_trigger
  AFTER INSERT OR UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION check_ai_caller_threshold();

