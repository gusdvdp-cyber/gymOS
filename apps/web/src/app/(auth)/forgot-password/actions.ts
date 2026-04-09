'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function sendPasswordReset(formData: FormData): Promise<void> {
  const email = formData.get('email') as string
  if (!email) redirect('/forgot-password?error=email_required')

  const supabase = await createClient()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/callback?next=/reset-password`,
  })

  if (error) redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`)

  redirect('/forgot-password?sent=1')
}
