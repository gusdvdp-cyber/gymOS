'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updatePassword(formData: FormData): Promise<void> {
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (!password || password.length < 8) {
    redirect('/reset-password?error=La+contraseña+debe+tener+al+menos+8+caracteres')
  }

  if (password !== confirm) {
    redirect('/reset-password?error=Las+contraseñas+no+coinciden')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) redirect(`/reset-password?error=${encodeURIComponent(error.message)}`)

  redirect('/login?reset=1')
}
