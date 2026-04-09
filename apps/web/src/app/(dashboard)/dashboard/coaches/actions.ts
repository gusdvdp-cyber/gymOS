'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminContext } from '@/lib/get-admin-context'
import type { ApiResponse, ProfileRow } from '@gymos/types'

export async function getCoaches(): Promise<ApiResponse<ProfileRow[]>> {
  const { gymId } = await getAdminContext()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('gym_id', gymId)
    .eq('role', 'profe')
    .order('first_name')

  if (error) return { data: null, error: { message: error.message } }
  return { data: data as ProfileRow[], error: null }
}

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function createCoachUser(formData: FormData): Promise<void> {
  const { gymId } = await getAdminContext()
  const adminSupabase = createAdminClient()

  const email = formData.get('email') as string
  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const phone = formData.get('phone') as string || null
  const tempPassword = generateTempPassword()

  const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { role: 'profe', gym_id: gymId, first_name: firstName, last_name: lastName },
  })

  if (authError) redirect(`/dashboard/coaches/new?error=${encodeURIComponent(authError.message)}`)

  await adminSupabase
    .from('profiles')
    .update({ gym_id: gymId, role: 'profe', first_name: firstName, last_name: lastName, phone })
    .eq('id', authUser.user.id)

  revalidatePath('/dashboard/coaches')
  redirect(`/dashboard/coaches?pwd=${encodeURIComponent(tempPassword)}&email=${encodeURIComponent(email)}`)
}

export async function createCoachInvitation(): Promise<ApiResponse<{ inviteUrl: string }>> {
  const { gymId, userId } = await getAdminContext()
  const adminSupabase = createAdminClient()

  const { data, error } = await adminSupabase
    .from('gym_invitations')
    .insert({ gym_id: gymId, created_by: userId, role: 'profe' })
    .select('token')
    .single()

  if (error) return { data: null, error: { message: error.message } }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return { data: { inviteUrl: `${baseUrl}/unirse/${data.token}` }, error: null }
}

export async function toggleCoachActive(coachId: string, isActive: boolean): Promise<ApiResponse<null>> {
  const { gymId } = await getAdminContext()
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', coachId)
    .eq('gym_id', gymId)

  if (error) return { data: null, error: { message: error.message } }

  revalidatePath('/dashboard/coaches')
  return { data: null, error: null }
}
