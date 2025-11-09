import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface OnboardingData {
  organizationId: string
  organizationName: string
  userEmail: string
  userName: string
}

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { organizationId, organizationName, userEmail, userName }: OnboardingData =
      await req.json()

    if (!organizationId || !userEmail) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get organization details
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single()

    if (orgError || !org) {
      return new Response(JSON.stringify({ error: 'Organization not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 1. Send welcome email (via Make.com/Zapier webhook or email service)
    const welcomeEmailWebhook = Deno.env.get('MAKE_WEBHOOK_URL') || Deno.env.get('ZAPIER_WEBHOOK_URL')
    if (welcomeEmailWebhook) {
      await fetch(welcomeEmailWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'new_organization_onboarded',
          organization: {
            id: organizationId,
            name: organizationName || org.name,
            email: userEmail,
            userName: userName,
            subscriptionStatus: org.subscription_status,
          },
          setupLinks: {
            crmIntegration: `${Deno.env.get('APP_URL')}/onboarding?step=1`,
            retellSetup: `${Deno.env.get('APP_URL')}/onboarding?step=2`,
            dashboard: `${Deno.env.get('APP_URL')}/dashboard`,
            knowledgeBase: Deno.env.get('NOTION_KB_URL') || 'https://notion.so/your-kb',
          },
        }),
      })
    }

    // 2. Notify internal Slack channel (if configured)
    const slackWebhook = Deno.env.get('SLACK_WEBHOOK_URL')
    if (slackWebhook) {
      await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🎉 New Organization Onboarded`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*New Organization: ${organizationName || org.name}*\nEmail: ${userEmail}\nStatus: ${org.subscription_status}`,
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `<${Deno.env.get('APP_URL')}/dashboard|View Dashboard>`,
              },
            },
          ],
        }),
      })
    }

    // 3. Create initial support ticket/documentation access
    // This would integrate with your support system (Lindy/Tidio)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Onboarding automation triggered',
        organizationId,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Onboarding automation error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})

