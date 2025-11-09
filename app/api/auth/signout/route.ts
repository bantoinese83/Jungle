import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  const headersList = await headers()
  const referer = headersList.get('referer') || '/login'
  const origin = new URL(referer).origin
  
  return NextResponse.redirect(new URL('/login', origin))
}

