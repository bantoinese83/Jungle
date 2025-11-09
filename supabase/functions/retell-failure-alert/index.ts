import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface FailureAlert {
  leadId: string
  organizationId: string
  error: string
  errorDetails?: any
  retellResponse?: any
}

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { leadId, organizationId, error, errorDetails, retellResponse }: FailureAlert =
      await req.json()

    if (!leadId || !organizationId || !error) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get lead and organization details
    const { data: lead } = await supabase
      .from('leads')
      .select('*, organizations(*)')
      .eq('id', leadId)
      .single()

    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single()

    // 1. Send immediate Slack alert
    const slackWebhook = Deno.env.get('SLACK_ALERT_WEBHOOK_URL')
    if (slackWebhook) {
      await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 Retell AI Caller Failure`,
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: '🚨 Retell AI Caller Failure',
                emoji: true,
              },
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Organization:*\n${org?.name || organizationId}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Lead:*\n${lead?.name || 'Unknown'}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Phone:*\n${lead?.phone || 'N/A'}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Error:*\n${error}`,
                },
              ],
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Error Details:*\n\`\`\`${JSON.stringify(errorDetails || {}, null, 2)}\`\`\``,
              },
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: 'View Lead',
                  },
                  url: `${Deno.env.get('APP_URL')}/dashboard?lead=${leadId}`,
                },
              ],
            },
          ],
        }),
      })
    }

    // 2. Send SMS alert (via Twilio or similar, configured in Make.com)
    const smsWebhook = Deno.env.get('SMS_WEBHOOK_URL')
    if (smsWebhook) {
      await fetch(smsWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: Deno.env.get('FOUNDER_PHONE'),
          message: `🚨 Retell AI failure for ${org?.name || 'organization'}. Lead: ${lead?.name}. Error: ${error}`,
        }),
      })
    }

    // 3. Log to database for tracking
    await supabase.from('system_alerts').insert({
      type: 'retell_ai_failure',
      organization_id: organizationId,
      lead_id: leadId,
      error_message: error,
      error_details: errorDetails,
      retell_response: retellResponse,
      created_at: new Date().toISOString(),
    }).catch(() => {
      // Table might not exist yet - that's okay
      console.log('System alerts table not found, skipping log')
    })

    // 4. Update lead status to indicate failure
    await supabase
      .from('leads')
      .update({
        status: 'ai_failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Failure alert sent',
        leadId,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Failure alert error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})

