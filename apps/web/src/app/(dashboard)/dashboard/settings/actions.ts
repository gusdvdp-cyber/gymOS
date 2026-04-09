'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isValidHexColor } from '@gymos/utils'

export async function updateBranding(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('gym_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.gym_id || profile.role !== 'admin') {
    return { error: 'Sin permisos' }
  }

  const primaryColor = formData.get('primary_color') as string
  const secondaryColor = formData.get('secondary_color') as string

  if (!isValidHexColor(primaryColor) || !isValidHexColor(secondaryColor)) {
    return { error: 'Colores inválidos' }
  }

  const { error } = await supabase
    .from('gym_branding')
    .upsert({
      gym_id: profile.gym_id,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
    })

  if (error) return { error: error.message }

  revalidatePath('/dashboard', 'layout')
  return { success: true }
}
