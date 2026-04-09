import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ProfileRow } from '@gymos/types'

interface AdminContext {
  userId: string
  gymId: string
  profile: ProfileRow
}

/**
 * Obtiene el contexto del admin/profe autenticado.
 * Redirige a /login si no hay sesión o el usuario no pertenece a un gym.
 * Usar al inicio de Server Components y Server Actions del dashboard.
 */
export async function getAdminContext(): Promise<AdminContext> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.gym_id || !['admin', 'profe'].includes(profile.role)) {
    redirect('/login')
  }

  return {
    userId: user.id,
    gymId: profile.gym_id,
    profile: profile as ProfileRow,
  }
}
