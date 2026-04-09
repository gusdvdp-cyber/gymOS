'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ApiResponse, GymBranding } from '@gymos/types'
import { isValidHexColor, GYM_ASSETS_BUCKET } from '@gymos/utils'

export async function upsertBranding(
  gymId: string,
  primaryColor: string,
  secondaryColor: string
): Promise<ApiResponse<null>> {
  if (!isValidHexColor(primaryColor) || !isValidHexColor(secondaryColor)) {
    return { data: null, error: { message: 'Colores inválidos. Usá formato #RRGGBB.' } }
  }

  const supabase = createAdminClient()

  const { error } = await supabase.from('gym_branding').upsert(
    { gym_id: gymId, primary_color: primaryColor, secondary_color: secondaryColor },
    { onConflict: 'gym_id' }
  )

  if (error) return { data: null, error: { message: error.message } }

  revalidatePath(`/superadmin/gyms/${gymId}`)
  revalidatePath(`/superadmin/gyms/${gymId}/branding`)
  return { data: null, error: null }
}

export async function uploadLogo(gymId: string, formData: FormData): Promise<ApiResponse<{ logoUrl: string }>> {
  const file = formData.get('logo') as File | null

  if (!file) return { data: null, error: { message: 'No se seleccionó ningún archivo' } }
  if (file.size > 2 * 1024 * 1024) return { data: null, error: { message: 'El archivo supera los 2MB' } }

  const supabase = createAdminClient()
  const path = `gyms/${gymId}/logo.${file.name.split('.').pop()}`

  const { error: uploadError } = await supabase.storage
    .from(GYM_ASSETS_BUCKET)
    .upload(path, file, { upsert: true })

  if (uploadError) return { data: null, error: { message: uploadError.message } }

  const { data: { publicUrl } } = supabase.storage.from(GYM_ASSETS_BUCKET).getPublicUrl(path)

  await supabase
    .from('gym_branding')
    .upsert({ gym_id: gymId, logo_url: publicUrl }, { onConflict: 'gym_id' })

  revalidatePath(`/superadmin/gyms/${gymId}`)
  return { data: { logoUrl: publicUrl }, error: null }
}
