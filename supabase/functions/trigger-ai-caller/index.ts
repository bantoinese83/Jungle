import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RETELL_API_URL = 'https://api.retellai.com'

interface Lead {
  id: string
  organization_id: string
  name: string
  phone: string
  email?: string
  status: string
  speed_to_lead_minutes?: number
}

// Decryption function (simplified - in production use Supabase Vault or proper decryption service)
// Note: This is a placeholder - actual decryption should use the same encryption library
// For Edge Functions, you'd need to port the Node.js crypto code or use a Deno-compatible library
async function decryptApiKey(encryptedKey: string): Promise<string> {
  // TODO: Implement proper decryption using Deno crypto
  // For now, this is a critical security issue that needs to be addressed
  // The encrypted key should be decrypted using the ENCRYPTION_KEY environment variable
  // and the same algorithm used in lib/encryption.ts
  
  // TEMPORARY: Use environment variable as fallback (NOT SECURE FOR MULTI-TENANT)
  // This should be replaced with proper decryption
  const fallbackKey = Deno.env.get('RETELL_API_KEY')
  if (fallbackKey) {
    console.warn('WARNING: Using fallback RETELL_API_KEY from environment. This breaks multi-tenancy!')
    return fallbackKey
  }
  
  throw new Error('API key decryption not implemented. Cannot proceed without decryption.')
}

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { leadId } = await req.json()

    if (!leadId) {
      return new Response(JSON.stringify({ error: 'leadId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Fetch lead and organization details
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*, organizations(*)')
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      return new Response(JSON.stringify({ error: 'Lead not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const typedLead = lead as Lead & { organizations: { speed_to_lead_minutes: number } }

    // Check if speed to lead threshold exceeded
    const threshold = typedLead.organizations.speed_to_lead_minutes || 5
    const speedToLead = typedLead.speed_to_lead_minutes

    if (!speedToLead || speedToLead < threshold) {
      return new Response(
        JSON.stringify({ message: 'Speed to lead threshold not exceeded' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    if (typedLead.status !== 'pending') {
      return new Response(
        JSON.stringify({ message: 'Lead already processed' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Get Retell AI API key from integrations
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('encrypted_key')
      .eq('organization_id', typedLead.organization_id)
      .eq('type', 'retell_ai')
      .single()

    if (integrationError || !integration) {
      return new Response(
        JSON.stringify({ error: 'Retell AI integration not configured' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Decrypt API key from database
    let retellApiKey: string
    try {
      retellApiKey = await decryptApiKey(integration.encrypted_key)
    } catch (decryptError) {
      console.error('Failed to decrypt Retell AI API key:', decryptError)
      return new Response(
        JSON.stringify({ error: 'Failed to decrypt API key' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Call Retell AI API to initiate call
    const retellResponse = await fetch(`${RETELL_API_URL}/create-phone-call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${retellApiKey}`,
      },
      body: JSON.stringify({
        from_number: '+1234567890', // Configure in Retell
        to_number: typedLead.phone,
        override_agent_id: Deno.env.get('RETELL_AGENT_ID'),
        metadata: {
          lead_id: typedLead.id,
          lead_name: typedLead.name,
          lead_email: typedLead.email,
        },
      }),
    })

    if (!retellResponse.ok) {
      const errorData = await retellResponse.text()
      console.error('Retell API error:', errorData)

      // Trigger failure alert
      const alertWebhook = Deno.env.get('RETELL_FAILURE_ALERT_URL') ||
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/retell-failure-alert`
      
      try {
        await fetch(alertWebhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({
            leadId: typedLead.id,
            organizationId: typedLead.organization_id,
            error: 'Retell AI API call failed',
            errorDetails: errorData,
            retellResponse: {
              status: retellResponse.status,
              statusText: retellResponse.statusText,
            },
          }),
        })
      } catch (alertError) {
        console.error('Failed to send failure alert:', alertError)
      }

      return new Response(
        JSON.stringify({ error: 'Failed to trigger Retell AI call', details: errorData }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const retellData = await retellResponse.json()

    // Update lead status
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        status: 'ai_triggered',
        ai_call_triggered_at: new Date().toISOString(),
      })
      .eq('id', leadId)

    if (updateError) {
      console.error('Failed to update lead:', updateError)
      // Don't fail the request - call was triggered
    }

    return new Response(
      JSON.stringify({
        success: true,
        callId: retellData.call_id,
        leadId: typedLead.id,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})
