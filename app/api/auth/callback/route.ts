import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Create or update user in our database
      const existingUser = await prisma.user.findUnique({
        where: { supabaseUserId: data.user.id },
      })

      if (!existingUser) {
        // Get organization name from user metadata (set during signup)
        const organizationName =
          data.user.user_metadata?.organizationName ||
          data.user.email?.split('@')[0] ||
          'My Organization'

        // For new users, create organization and user
        const org = await prisma.organization.create({
          data: {
            name: organizationName,
          },
        })

        await prisma.user.create({
          data: {
            email: data.user.email!,
            supabaseUserId: data.user.id,
            organizationId: org.id,
          },
        })

        // Trigger onboarding automation
        const onboardingWebhook = process.env.ONBOARDING_AUTOMATION_URL ||
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/onboarding-automation`
        
        try {
          await fetch(onboardingWebhook, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({
              organizationId: org.id,
              organizationName: org.name,
              userEmail: data.user.email!,
              userName: data.user.email?.split('@')[0] || 'User',
            }),
          })
        } catch (error) {
          console.error('Failed to trigger onboarding automation:', error)
          // Don't fail the auth flow if automation fails
        }

        // Redirect new users to onboarding
        return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
      }
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin))
}

