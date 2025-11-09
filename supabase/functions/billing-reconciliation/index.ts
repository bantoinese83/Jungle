import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * Usage-based billing reconciliation
 * Runs daily/weekly to sync Retell AI usage with Stripe metering
 */
serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const RETELL_API_KEY = Deno.env.get('RETELL_API_KEY')
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')

    if (!RETELL_API_KEY || !STRIPE_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: 'Missing API keys for reconciliation' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Get all active organizations
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, stripe_customer_id, subscription_status')
      .eq('subscription_status', 'active')

    if (orgError || !organizations) {
      return new Response(JSON.stringify({ error: 'Failed to fetch organizations' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const reconciliationResults = []

    for (const org of organizations) {
      if (!org.stripe_customer_id) continue

      // Get AI calls made for this organization in the billing period
      // This would query Retell AI API for usage data
      const { data: leads } = await supabase
        .from('leads')
        .select('id')
        .eq('organization_id', org.id)
        .eq('status', 'ai_triggered')
        .gte('ai_call_triggered_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days

      const aiCallCount = leads?.length || 0

      // Update Stripe metering (usage-based billing)
      // This would integrate with Stripe Billing Meter API
      const stripeWebhook = Deno.env.get('STRIPE_METERING_WEBHOOK_URL')
      if (stripeWebhook) {
        await fetch(stripeWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: org.stripe_customer_id,
            usage_quantity: aiCallCount,
            usage_timestamp: Math.floor(Date.now() / 1000),
            metering_id: Deno.env.get('STRIPE_AI_CALLS_METER_ID'),
          }),
        })
      }

      reconciliationResults.push({
        organizationId: org.id,
        organizationName: org.name,
        aiCallCount,
        stripeCustomerId: org.stripe_customer_id,
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        reconciled: reconciliationResults.length,
        results: reconciliationResults,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Billing reconciliation error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})

