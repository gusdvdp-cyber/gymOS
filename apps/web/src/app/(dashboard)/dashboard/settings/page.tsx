import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BrandingForm from './branding-form'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('gym_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.gym_id || profile.role !== 'admin') redirect('/dashboard')

  const { data: branding } = await supabase
    .from('gym_branding')
    .select('primary_color, secondary_color, logo_url')
    .eq('gym_id', profile.gym_id)
    .single()

  return (
    <div className="max-w-xl space-y-5">
      <h1 className="page-title">CONFIGURACIÓN</h1>
      <div className="surface p-6">
        <p className="label-dark" style={{ marginBottom: 16 }}>Colores del gym</p>
        <BrandingForm
          initialPrimary={branding?.primary_color ?? '#e8ff47'}
          initialSecondary={branding?.secondary_color ?? '#0d0d0d'}
        />
      </div>
    </div>
  )
}
