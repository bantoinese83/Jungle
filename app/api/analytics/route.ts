import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Analytics endpoint for tracking events server-side
 * Stores events in database for analysis
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, properties, userId, sessionId, url, userAgent } = body

    if (!event) {
      return NextResponse.json({ error: 'Event name is required' }, { status: 400 })
    }

    // Get user ID if authenticated
    let dbUserId: string | null = null
    if (userId) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Get database user ID
        const { data: dbUser } = await supabase
          .from('users')
          .select('id')
          .eq('supabase_user_id', user.id)
          .single()
        dbUserId = dbUser?.id || null
      }
    }

    // Store event in database
    const supabase = await createClient()
    const { error: insertError } = await supabase.from('analytics_events').insert({
      event,
      properties: properties || {},
      user_id: dbUserId,
      session_id: sessionId,
      url: url || null,
      user_agent: userAgent || null,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      timestamp: new Date().toISOString(),
    })

    if (insertError) {
      console.error('Analytics insert error:', insertError)
      // Don't fail the request if analytics fails
    }

    // Also log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event Stored:', {
        event,
        properties,
        userId: dbUserId,
        sessionId,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    // Don't fail the request if analytics fails
    return NextResponse.json({ success: true })
  }
}

