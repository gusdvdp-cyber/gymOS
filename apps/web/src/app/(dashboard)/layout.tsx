import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getBrandingCSSVars } from '@gymos/utils'
import DashboardSidebar from '@/components/layout/dashboard-sidebar'
import DashboardHeader from '@/components/layout/dashboard-header'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, gyms(id, name, gym_branding(primary_color, secondary_color, logo_url))')
    .eq('id', user.id)
    .single()

  if (!profile?.gym_id) redirect('/login')

  const gym = (profile as any).gyms
  const branding = gym?.gym_branding ?? null
  const cssVars = getBrandingCSSVars(branding)

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#0a0a0a', ...cssVars as React.CSSProperties }}>
      <DashboardSidebar gymName={gym?.name ?? 'Mi Gym'} logoUrl={branding?.logo_url ?? null} role={profile.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader profile={profile} gymName={gym?.name ?? 'Mi Gym'} />
        <main className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: '#0a0a0a' }}>{children}</main>
      </div>
    </div>
  )
}
