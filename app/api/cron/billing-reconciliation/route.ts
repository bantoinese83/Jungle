import { NextRequest, NextResponse } from 'next/server'

/**
 * Cron job endpoint for billing reconciliation
 * Call this via Vercel Cron Jobs or external scheduler
 * Example Vercel cron config in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/billing-reconciliation",
 *     "schedule": "0 2 * * *" // Daily at 2 AM
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  // Verify cron secret (required in production)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('CRON_SECRET not configured')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.substring(7)
  if (token !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const reconciliationUrl = `${supabaseUrl}/functions/v1/billing-reconciliation`

    const response = await fetch(reconciliationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
    })

    const data = await response.json()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      reconciliation: data,
    })
  } catch (error) {
    console.error('Billing reconciliation cron error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

