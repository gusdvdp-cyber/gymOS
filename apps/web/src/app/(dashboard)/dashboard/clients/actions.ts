'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminContext } from '@/lib/get-admin-context'
import type { ApiResponse, ProfileRow, RoutineWithDays } from '@gymos/types'

export interface ClientWithAssignment extends ProfileRow {
  active_routine: { routine_id: string; routines: { name: string; days_per_week: number } } | null
}

export async function getClients(): Promise<ApiResponse<ClientWithAssignment[]>> {
  const { gymId } = await getAdminContext()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      active_routine:client_routine_assignments!client_id(
        routine_id,
        is_active,
        routines(name, days_per_week)
      )
    `)
    .eq('gym_id', gymId)
    .eq('role', 'cliente')
    .order('first_name')

  if (error) return { data: null, error: { message: error.message } }

  const clients = (data as any[]).map((c) => ({
    ...c,
    active_routine: c.active_routine?.find((a: any) => a.is_active) ?? null,
  }))

  return { data: clients, error: null }
}

export async function getClient(clientId: string): Promise<ApiResponse<ProfileRow>> {
  const { gymId } = await getAdminContext()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', clientId)
    .eq('gym_id', gymId)
    .eq('role', 'cliente')
    .single()

  if (error) return { data: null, error: { message: error.message } }
  return { data: data as ProfileRow, error: null }
}

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function createClientUser(formData: FormData): Promise<void> {
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
    user_metadata: { role: 'cliente', gym_id: gymId, first_name: firstName, last_name: lastName },
  })

  if (authError) redirect(`/dashboard/clients/new?error=${encodeURIComponent(authError.message)}`)

  await adminSupabase
    .from('profiles')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update({ gym_id: gymId, role: 'cliente', first_name: firstName, last_name: lastName, phone } as any)
    .eq('id', authUser.user.id)

  revalidatePath('/dashboard/clients')
  redirect(`/dashboard/clients/${authUser.user.id}?pwd=${encodeURIComponent(tempPassword)}`)
}

export async function assignRoutine(
  clientId: string,
  routineId: string
): Promise<ApiResponse<null>> {
  const { gymId, userId } = await getAdminContext()
  const supabase = await createClient()

  // Desactivar asignaciones previas del cliente
  await supabase
    .from('client_routine_assignments')
    .update({ is_active: false })
    .eq('client_id', clientId)
    .eq('gym_id', gymId)

  const { error } = await supabase.from('client_routine_assignments').upsert({
    gym_id: gymId,
    client_id: clientId,
    routine_id: routineId,
    assigned_by: userId,
    is_active: true,
  }, { onConflict: 'client_id,routine_id' })

  if (error) return { data: null, error: { message: error.message } }

  revalidatePath(`/dashboard/clients/${clientId}`)
  revalidatePath('/dashboard/clients')
  return { data: null, error: null }
}

export async function createInvitation(): Promise<ApiResponse<{ inviteUrl: string }>> {
  const { gymId, userId } = await getAdminContext()
  const adminSupabase = createAdminClient()

  const { data, error } = await adminSupabase
    .from('gym_invitations')
    .insert({ gym_id: gymId, created_by: userId, role: 'cliente' })
    .select('token')
    .single()

  if (error) return { data: null, error: { message: error.message } }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return { data: { inviteUrl: `${baseUrl}/unirse/${data.token}` }, error: null }
}

export async function toggleClientActive(clientId: string, isActive: boolean): Promise<ApiResponse<null>> {
  const { gymId } = await getAdminContext()
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', clientId)
    .eq('gym_id', gymId)

  if (error) return { data: null, error: { message: error.message } }

  revalidatePath('/dashboard/clients')
  revalidatePath(`/dashboard/clients/${clientId}`)
  return { data: null, error: null }
}
