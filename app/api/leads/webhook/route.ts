import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const webhookSecret = process.env.WEBHOOK_SECRET_KEY

const leadWebhookSchema = z.object({
  name: z.string().min(1).max(500),
  phone: z.string().min(10).max(20),
  email: z.string().email().max(255).optional(),
  crmId: z.string().max(255).optional(),
  organizationId: z.string().uuid(), // Required - CRMs should send this
})

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  const aBuffer = Buffer.from(a, 'utf8')
  const bBuffer = Buffer.from(b, 'utf8')
  return crypto.timingSafeEqual(aBuffer, bBuffer)
}

export async function POST(request: NextRequest) {
  try {
    if (!webhookSecret) {
      console.error('WEBHOOK_SECRET_KEY not configured')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const expectedAuth = webhookSecret

    if (!constantTimeEqual(token, expectedAuth)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body
    try {
      body = await request.json()
    } catch (jsonError) {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }

    const validatedData = leadWebhookSchema.parse(body)

    // Verify organization exists and is active
    const organization = await prisma.organization.findUnique({
      where: { id: validatedData.organizationId },
      select: { id: true, subscriptionStatus: true },
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Optionally: Verify organization subscription is active (if required)
    // if (organization.subscriptionStatus !== 'active' && organization.subscriptionStatus !== 'trial') {
    //   return NextResponse.json({ error: 'Organization subscription not active' }, { status: 403 })
    // }

    // Calculate speed to lead if we have receivedAt
    const receivedAt = new Date()
    const speedToLeadMinutes = null // Will be calculated by trigger or background job

    const lead = await prisma.lead.create({
      data: {
        organizationId: validatedData.organizationId,
        crmId: validatedData.crmId,
        name: validatedData.name,
        phone: validatedData.phone,
        email: validatedData.email,
        receivedAt,
        speedToLeadMinutes,
        status: 'pending',
      },
    })

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid payload', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

