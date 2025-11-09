import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

const speedToLeadSchema = z.object({
  speedToLeadMinutes: z.number().int().min(1).max(60),
})

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
    const { speedToLeadMinutes } = speedToLeadSchema.parse(body)

    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await prisma.organization.update({
      where: { id: dbUser.organizationId },
      data: { speedToLeadMinutes },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid payload', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Speed to lead update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

