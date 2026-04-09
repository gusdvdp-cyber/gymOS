'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import type { CreateGymPayload, UpdateGymPayload, GymWithBranding } from '@gymos/types'
import type { ApiResponse } from '@gymos/types'
import { slugify } from '@gymos/utils'

export async function getGyms(): Promise<ApiResponse<GymWithBranding[]>> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('gyms')
    .select('*, gym_branding(*)')
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: { message: error.message, code: error.code } }
  return { data: data as GymWithBranding[], error: null }
}

export async function getGym(gymId: string): Promise<ApiResponse<GymWithBranding>> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('gyms')
    .select('*, gym_branding(*)')
    .eq('id', gymId)
    .single()

  if (error) return { data: null, error: { message: error.message } }
  return { data: data as GymWithBranding, error: null }
}

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function createGym(payload: CreateGymPayload): Promise<ApiResponse<{ gymId: string; tempPassword: string }>> {
  const supabase = createAdminClient()

  const slug = slugify(payload.slug || payload.name)

  // 1. Crear el gym
  const { data: gym, error: gymError } = await supabase
    .from('gyms')
    .insert({ name: payload.name, slug, plan: payload.plan, email: payload.email ?? null })
    .select('id')
    .single()

  if (gymError) return { data: null, error: { message: gymError.message } }

  // 2. Crear branding por defecto
  await supabase.from('gym_branding').insert({
    gym_id: gym.id,
    primary_color: '#3B82F6',
    secondary_color: '#1E3A5F',
  })

  // 3. Crear usuario admin con la contraseña ingresada
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: payload.adminEmail,
    password: payload.adminPassword,
    email_confirm: true,
    user_metadata: {
      role: 'admin',
      gym_id: gym.id,
      first_name: payload.adminFirstName,
      last_name: payload.adminLastName,
    },
  })

  if (authError) {
    await supabase.from('gyms').delete().eq('id', gym.id)
    return { data: null, error: { message: authError.message } }
  }

  // 4. Actualizar el profile del admin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('profiles')
    .update({ gym_id: gym.id, role: 'admin' })
    .eq('id', authUser.user.id)

  revalidatePath('/superadmin/gyms')
  return { data: { gymId: gym.id }, error: null }
}

export async function updateGym(gymId: string, payload: UpdateGymPayload): Promise<ApiResponse<null>> {
  const supabase = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('gyms')
    .update(payload)
    .eq('id', gymId)

  if (error) return { data: null, error: { message: error.message } }

  revalidatePath('/superadmin/gyms')
  revalidatePath(`/superadmin/gyms/${gymId}`)
  return { data: null, error: null }
}

export async function createGymAndRedirect(formData: FormData) {
  const payload: CreateGymPayload = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    plan: formData.get('plan') as 'PART' | 'FULL',
    email: formData.get('email') as string || undefined,
    adminEmail: formData.get('adminEmail') as string,
    adminPassword: formData.get('adminPassword') as string,
    adminFirstName: formData.get('adminFirstName') as string,
    adminLastName: formData.get('adminLastName') as string,
  }

  const result = await createGym(payload)

  if (result.error) {
    redirect(`/superadmin/gyms/new?error=${encodeURIComponent(result.error.message)}`)
  }

  redirect(`/superadmin/gyms/${result.data!.gymId}`)
}
