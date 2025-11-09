import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { encrypt } from '@/lib/encryption'

const retellSchema = z.object({
  apiKey: z.string().min(1),
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
    const { apiKey } = retellSchema.parse(body)

    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const encryptedKey = encrypt(apiKey)

    await prisma.integration.upsert({
      where: {
        organizationId_type: {
          organizationId: dbUser.organizationId,
          type: 'retell_ai',
        },
      },
      update: {
        encryptedKey,
        updatedAt: new Date(),
      },
      create: {
        organizationId: dbUser.organizationId,
        type: 'retell_ai',
        encryptedKey,
      },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid payload', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Retell integration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

