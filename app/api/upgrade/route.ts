import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planId } = body

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID required' }, { status: 400 })
    }

    // Get user's organization
    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: user.id },
      include: { organization: true },
    })

    if (!dbUser || !dbUser.organization.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found. Please contact support.' },
        { status: 400 }
      )
    }

    // Map plan IDs to Stripe price IDs
    const priceIdMap: Record<string, string> = {
      professional: process.env.STRIPE_PRICE_PROFESSIONAL || '',
      enterprise: process.env.STRIPE_PRICE_ENTERPRISE || '',
    }

    const priceId = priceIdMap[planId]
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 })
    }

    // Validate upgrade path: can only upgrade from starter -> professional -> enterprise
    const currentPlan = dbUser.organization.planId || 'starter'
    const validUpgrades: Record<string, string[]> = {
      starter: ['professional', 'enterprise'],
      professional: ['enterprise'],
      enterprise: [], // Can't upgrade from enterprise
    }

    if (!validUpgrades[currentPlan]?.includes(planId)) {
      return NextResponse.json(
        { error: `Cannot upgrade from ${currentPlan} to ${planId}. Valid upgrades: ${validUpgrades[currentPlan]?.join(', ') || 'none'}` },
        { status: 400 }
      )
    }

    // Get current subscription (allow trial, active, or past_due)
    const stripeClient = getStripe()
    const subscriptions = await stripeClient.subscriptions.list({
      customer: dbUser.organization.stripeCustomerId,
      status: 'all', // Get all subscriptions to check status
      limit: 1,
    })

    if (subscriptions.data.length === 0) {
      return NextResponse.json(
        { error: 'No subscription found. Please create a subscription first.' },
        { status: 400 }
      )
    }

    const subscription = subscriptions.data[0]
    // Allow upgrades from trial, active, or past_due subscriptions
    if (!['trialing', 'active', 'past_due'].includes(subscription.status)) {
      return NextResponse.json(
        { error: `Cannot upgrade subscription with status: ${subscription.status}` },
        { status: 400 }
      )
    }

    // Update subscription
    const updatedSubscription = await stripeClient.subscriptions.update(subscription.id, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: priceId,
        },
      ],
      proration_behavior: 'always_invoice',
    })

    // Update organization in database
    await prisma.organization.update({
      where: { id: dbUser.organizationId },
      data: {
        planId,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      subscriptionId: updatedSubscription.id,
      message: 'Plan upgraded successfully',
    })
  } catch (error) {
    console.error('Upgrade error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

