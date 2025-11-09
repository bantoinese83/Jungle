-- RPC function to get organization dashboard summary
CREATE OR REPLACE FUNCTION get_organization_dashboard_summary(org_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  user_org_id UUID;
BEGIN
  -- Set secure search_path to prevent search_path injection
  SET search_path = pg_catalog, public;

  -- Verify user has access to this organization (RLS check)
  SELECT organization_id INTO user_org_id
  FROM users
  WHERE supabase_user_id = auth.uid()
  LIMIT 1;

  -- If user doesn't exist or org_id doesn't match, return empty result
  IF user_org_id IS NULL OR user_org_id != org_id THEN
    RETURN json_build_object(
      'totalLeads', 0,
      'aiCallsTriggered', 0,
      'averageSpeedToLead', 0,
      'recentLeads', '[]'::json
    );
  END IF;

  SELECT json_build_object(
    'totalLeads', COUNT(*),
    'aiCallsTriggered', COUNT(*) FILTER (WHERE status = 'ai_triggered'),
    'averageSpeedToLead', COALESCE(AVG(speed_to_lead_minutes), 0),
    'recentLeads', (
      SELECT json_agg(
        json_build_object(
          'id', id,
          'name', name,
          'phone', phone,
          'email', email,
          'status', status,
          'receivedAt', received_at,
          'speedToLeadMinutes', speed_to_lead_minutes,
          'firstCallAt', first_call_at,
          'aiCallTriggeredAt', ai_call_triggered_at
        ) ORDER BY received_at DESC
      )
      FROM leads
      WHERE organization_id = org_id
      ORDER BY received_at DESC
      LIMIT 10
    )
  ) INTO result
  FROM leads
  WHERE organization_id = org_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_organization_dashboard_summary(UUID) TO authenticated;

