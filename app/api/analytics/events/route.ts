import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Get analytics events with filtering and aggregation
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication for analytics events
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const eventType = searchParams.get('event')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000) // Max 1000
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0) // Min 0
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate) : new Date()

    let query = supabase
      .from('analytics_events')
      .select('*', { count: 'exact' })
      .gte('timestamp', start.toISOString())
      .lte('timestamp', end.toISOString())
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1)

    if (eventType) {
      query = query.eq('event', eventType)
    }

    const { data: events, count, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      events: events || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Analytics events fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

