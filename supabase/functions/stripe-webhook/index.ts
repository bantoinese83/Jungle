import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2025-10-29.clover',
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  if (!webhookSecret) {
    return new Response(JSON.stringify({ error: 'STRIPE_WEBHOOK_SECRET not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await req.text()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response(
      JSON.stringify({ error: 'Invalid signature', message: err.message }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        if (!customerId || !subscriptionId) {
          return new Response(
            JSON.stringify({ error: 'Missing customer or subscription ID' }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }

        // Get subscription details to determine plan
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0]?.price.id

        // Map Stripe price IDs to plan IDs (configure based on your pricing)
        const planIdMap: Record<string, string> = {
          [Deno.env.get('STRIPE_PRICE_STARTER') || '']: 'starter',
          [Deno.env.get('STRIPE_PRICE_PROFESSIONAL') || '']: 'professional',
          [Deno.env.get('STRIPE_PRICE_ENTERPRISE') || '']: 'enterprise',
        }

        const planId = priceId ? planIdMap[priceId] || 'starter' : 'starter'

        // Find organization by Stripe customer ID
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (orgError || !org) {
          console.error('Organization not found for customer:', customerId, orgError)
          return new Response(
            JSON.stringify({ error: 'Organization not found' }),
            {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }

        // Update organization subscription
        const { error: updateError } = await supabase
          .from('organizations')
          .update({
            subscription_status: 'active',
            plan_id: planId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', org.id)

        if (updateError) {
          console.error('Failed to update organization:', updateError)
          return new Response(
            JSON.stringify({ error: 'Failed to update subscription' }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }

        return new Response(
          JSON.stringify({ success: true, organizationId: org.id, planId }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: org } = await supabase
          .from('organizations')
          .select('id, name')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!org) {
          return new Response(
            JSON.stringify({ error: 'Organization not found' }),
            {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }

        const subscriptionStatus =
          subscription.status === 'active' ? 'active' : subscription.status === 'canceled' ? 'canceled' : 'past_due'

        await supabase
          .from('organizations')
          .update({
            subscription_status: subscriptionStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', org.id)

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: org } = await supabase
          .from('organizations')
          .select('id, name, subscription_status')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!org) {
          return new Response(
            JSON.stringify({ error: 'Organization not found' }),
            {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }

        // Update subscription status
        await supabase
          .from('organizations')
          .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('id', org.id)

        // Trigger automated email reminder via Make.com/Zapier
        const billingWebhook = Deno.env.get('BILLING_AUTOMATION_WEBHOOK_URL')
        if (billingWebhook) {
          await fetch(billingWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'payment_failed',
              organization: {
                id: org.id,
                name: org.name,
                customerId,
              },
              invoice: {
                id: invoice.id,
                amount: invoice.amount_due,
                currency: invoice.currency,
                attemptCount: invoice.attempt_count,
              },
            }),
          })
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: org } = await supabase
          .from('organizations')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (org) {
          // Restore active status if payment succeeded
          await supabase
            .from('organizations')
            .update({
              subscription_status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', org.id)
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      default:
        return new Response(JSON.stringify({ message: 'Event type not handled' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
    }
  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})

