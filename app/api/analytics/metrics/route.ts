import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Get aggregated analytics metrics
 * Returns key metrics like conversion rates, funnel data, etc.
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication for analytics metrics
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate) : new Date()

    // Get funnel metrics using RPC function
    const { data: funnelData } = await supabase.rpc('get_funnel_metrics', {
      start_date: start.toISOString(),
      end_date: end.toISOString(),
    })

    // Get demo metrics
    const { count: demoStarted } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event', 'demo_started')
      .gte('timestamp', start.toISOString())
      .lte('timestamp', end.toISOString())

    const { count: demoCompleted } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event', 'demo_completed')
      .gte('timestamp', start.toISOString())
      .lte('timestamp', end.toISOString())

    // Get average threshold from demo_completed events
    const { data: demoEvents } = await supabase
      .from('analytics_events')
      .select('properties')
      .eq('event', 'demo_completed')
      .gte('timestamp', start.toISOString())
      .lte('timestamp', end.toISOString())

    const avgThreshold =
      demoEvents && demoEvents.length > 0
        ? demoEvents.reduce((sum, e) => sum + (e.properties?.speedToLeadThreshold || 0), 0) /
          demoEvents.length
        : 0

    // Get chatbot metrics
    const { count: chatbotOpened } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event', 'chatbot_opened')
      .gte('timestamp', start.toISOString())
      .lte('timestamp', end.toISOString())

    const { count: chatbotMessages } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event', 'chatbot_message_sent')
      .gte('timestamp', start.toISOString())
      .lte('timestamp', end.toISOString())

    const { count: highFitLeads } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event', 'chatbot_high_fit_lead')
      .gte('timestamp', start.toISOString())
      .lte('timestamp', end.toISOString())

    const { count: chatbotCtaClicks } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event', 'chatbot_cta_clicked')
      .gte('timestamp', start.toISOString())
      .lte('timestamp', end.toISOString())

    // Get onboarding metrics
    const { count: onboardingStarted } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event', 'onboarding_started')
      .gte('timestamp', start.toISOString())
      .lte('timestamp', end.toISOString())

    const { count: onboardingCompleted } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event', 'onboarding_completed')
      .gte('timestamp', start.toISOString())
      .lte('timestamp', end.toISOString())

    // Get test lead metrics
    const { count: testLeadSent } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event', 'test_lead_sent')
      .gte('timestamp', start.toISOString())
      .lte('timestamp', end.toISOString())

    const { count: testLeadSuccess } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event', 'test_lead_success')
      .gte('timestamp', start.toISOString())
      .lte('timestamp', end.toISOString())

    // Get signup metrics
    const { count: signupAttempts } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event', 'signup_attempt')
      .gte('timestamp', start.toISOString())
      .lte('timestamp', end.toISOString())

    const { count: signupSuccess } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event', 'signup_completed')
      .gte('timestamp', start.toISOString())
      .lte('timestamp', end.toISOString())

    // Calculate metrics
    const funnel = funnelData?.[0] || { visitors: 0, demos: 0, signups: 0, onboardings: 0 }

    return NextResponse.json({
      metrics: {
        demo: {
          started: demoStarted || 0,
          completed: demoCompleted || 0,
          conversionRate: demoStarted && demoStarted > 0 ? ((demoCompleted || 0) / demoStarted) * 100 : 0,
          avgThreshold: avgThreshold,
        },
        chatbot: {
          opened: chatbotOpened || 0,
          messages: chatbotMessages || 0,
          avgMessagesPerSession:
            chatbotOpened && chatbotOpened > 0 ? (chatbotMessages || 0) / chatbotOpened : 0,
          highFitLeads: highFitLeads || 0,
          ctaClicks: chatbotCtaClicks || 0,
        },
        onboarding: {
          started: onboardingStarted || 0,
          completed: onboardingCompleted || 0,
          completionRate:
            onboardingStarted && onboardingStarted > 0
              ? ((onboardingCompleted || 0) / onboardingStarted) * 100
              : 0,
          avgStepsCompleted: 0, // Would need to calculate from step events
          dropOffStep: null, // Would need to analyze step failures
        },
        testLead: {
          sent: testLeadSent || 0,
          success: testLeadSuccess || 0,
          successRate:
            testLeadSent && testLeadSent > 0 ? ((testLeadSuccess || 0) / testLeadSent) * 100 : 0,
        },
        signup: {
          attempts: signupAttempts || 0,
          success: signupSuccess || 0,
          conversionRate:
            signupAttempts && signupAttempts > 0 ? ((signupSuccess || 0) / signupAttempts) * 100 : 0,
        },
        funnel: {
          visitors: funnel.visitors || 0,
          demos: funnel.demos || 0,
          signups: funnel.signups || 0,
          onboardings: funnel.onboardings || 0,
          activeUsers: 0, // Would need to calculate from user activity
        },
      },
    })
  } catch (error) {
    console.error('Analytics metrics fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

