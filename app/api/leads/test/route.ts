import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

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
    const { organizationId, name, phone, email } = body

    if (!organizationId || !name || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, name, phone' },
        { status: 400 }
      )
    }

    // Verify user has access to this organization
    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: user.id },
      include: { organization: true },
    })

    if (!dbUser || dbUser.organizationId !== organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Create test lead
    const lead = await prisma.lead.create({
      data: {
        organizationId,
        name,
        phone,
        email: email || null,
        crmId: `test-${Date.now()}`,
        receivedAt: new Date(),
        status: 'pending',
        speedToLeadMinutes: null,
      },
    })

    return NextResponse.json(
      {
        success: true,
        leadId: lead.id,
        message: 'Test lead created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Test lead creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

