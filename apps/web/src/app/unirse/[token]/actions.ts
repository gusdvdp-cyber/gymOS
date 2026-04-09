'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'

export interface InvitationData {
  gymId: string
  gymName: string
  primaryColor: string
  secondaryColor: string
  logoUrl: string | null
  role: 'cliente' | 'profe'
  prefilledEmail: string | null
  isValid: boolean
  errorMessage?: string
}

export async function getInvitation(token: string): Promise<InvitationData> {
  const supabase = createAdminClient()

  const { data: invitation, error } = await supabase
    .from('gym_invitations')
    .select(`
      gym_id, role, email, expires_at, used_at,
      gyms ( name, gym_branding ( primary_color, secondary_color, logo_url ) )
    `)
    .eq('token', token)
    .single()

  if (error || !invitation) {
    return { gymId: '', gymName: '', primaryColor: '#3B82F6', secondaryColor: '#1E3A5F', logoUrl: null, role: 'cliente', prefilledEmail: null, isValid: false, errorMessage: 'Invitación no encontrada.' }
  }

  if (invitation.used_at) {
    return { gymId: '', gymName: '', primaryColor: '#3B82F6', secondaryColor: '#1E3A5F', logoUrl: null, role: 'cliente', prefilledEmail: null, isValid: false, errorMessage: 'Esta invitación ya fue utilizada.' }
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return { gymId: '', gymName: '', primaryColor: '#3B82F6', secondaryColor: '#1E3A5F', logoUrl: null, role: 'cliente', prefilledEmail: null, isValid: false, errorMessage: 'Esta invitación expiró.' }
  }

  const gym = (invitation as any).gyms
  const branding = gym?.gym_branding ?? {}

  return {
    gymId: invitation.gym_id,
    gymName: gym?.name ?? 'Gimnasio',
    primaryColor: branding.primary_color ?? '#3B82F6',
    secondaryColor: branding.secondary_color ?? '#1E3A5F',
    logoUrl: branding.logo_url ?? null,
    role: invitation.role as 'cliente' | 'profe',
    prefilledEmail: invitation.email ?? null,
    isValid: true,
  }
}

export async function registerWithInvitation(token: string, formData: FormData): Promise<void> {
  const supabase = createAdminClient()

  // Validar token de nuevo (previene race conditions)
  const { data: invitation } = await supabase
    .from('gym_invitations')
    .select('gym_id, role, email, expires_at, used_at')
    .eq('token', token)
    .single()

  if (!invitation || invitation.used_at || new Date(invitation.expires_at) < new Date()) {
    redirect(`/unirse/${token}?error=invalid`)
  }

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const phone = formData.get('phone') as string || null

  // Si la invitación tiene email fijo, verificar que coincida
  if (invitation.email && invitation.email.toLowerCase() !== email.toLowerCase()) {
    redirect(`/unirse/${token}?error=email_mismatch`)
  }

  // Crear usuario en Auth
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: invitation.role,
      gym_id: invitation.gym_id,
      first_name: firstName,
      last_name: lastName,
    },
  })

  if (authError) {
    redirect(`/unirse/${token}?error=${encodeURIComponent(authError.message)}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // Actualizar profile
  await db
    .from('profiles')
    .update({
      gym_id: invitation.gym_id,
      role: invitation.role,
      first_name: firstName,
      last_name: lastName,
      phone,
    })
    .eq('id', authUser.user.id)

  // Marcar invitación como usada
  await db
    .from('gym_invitations')
    .update({ used_at: new Date().toISOString(), used_by: authUser.user.id })
    .eq('token', token)

  redirect('/login?registered=1')
}
