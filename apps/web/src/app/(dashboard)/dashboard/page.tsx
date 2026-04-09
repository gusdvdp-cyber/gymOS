import { createClient } from '@/lib/supabase/server'
import { getAdminContext } from '@/lib/get-admin-context'
import StatsGrid from '@/components/dashboard/stats-grid'
import QuickActions from '@/components/dashboard/quick-actions'

export default async function DashboardPage() {
  const { gymId } = await getAdminContext()
  const supabase = await createClient()

  const [
    { count: exercisesCount },
    { count: routinesCount },
    { count: clientsCount },
    { count: coachesCount },
  ] = await Promise.all([
    supabase.from('exercises').select('*', { count: 'exact', head: true }).eq('gym_id', gymId).eq('is_active', true),
    supabase.from('routines').select('*', { count: 'exact', head: true }).eq('gym_id', gymId).eq('is_active', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('gym_id', gymId).eq('role', 'cliente').eq('is_active', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('gym_id', gymId).eq('role', 'profe').eq('is_active', true),
  ])

  const stats = [
    { label: 'Ejercicios', value: exercisesCount ?? 0, href: '/dashboard/exercises', icon: 'dumbbell' },
    { label: 'Rutinas',    value: routinesCount  ?? 0, href: '/dashboard/routines',  icon: 'clipboard' },
    { label: 'Clientes',   value: clientsCount   ?? 0, href: '/dashboard/clients',   icon: 'users' },
    { label: 'Profes',     value: coachesCount   ?? 0, href: '/dashboard/coaches',   icon: 'usercog' },
  ]

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Heading */}
      <div>
        <h1
          className="leading-none"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 48,
            color: '#ffffff',
            letterSpacing: '0.03em',
          }}
        >
          PANEL DE CONTROL
        </h1>
        <p
          className="mt-1 text-sm"
          style={{ color: '#888888', fontFamily: 'var(--font-body)' }}
        >
          Resumen general del gimnasio
        </p>
      </div>

      {/* Stats */}
      <StatsGrid stats={stats} />

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-1">
          <QuickActions />
        </div>

        {/* Status panel */}
        <div
          className="md:col-span-2 rounded-xl p-5 flex flex-col gap-3"
          style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}
        >
          <p
            className="text-xs uppercase tracking-widest"
            style={{ color: '#444444', fontFamily: 'var(--font-mono)' }}
          >
            Estado del sistema
          </p>
          <div className="space-y-3">
            {[
              { label: 'Base de datos',  status: 'online' },
              { label: 'Autenticación',  status: 'online' },
              { label: 'Almacenamiento', status: 'online' },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span style={{ color: '#888888', fontFamily: 'var(--font-body)', fontSize: 13 }}>
                  {s.label}
                </span>
                <span
                  className="flex items-center gap-1.5 text-xs"
                  style={{ color: '#22c55e', fontFamily: 'var(--font-mono)' }}
                >
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: '#22c55e' }}
                  />
                  {s.status}
                </span>
              </div>
            ))}
          </div>

          <div
            className="mt-auto pt-4 border-t"
            style={{ borderColor: '#2a2a2a' }}
          >
            <p
              className="text-xs"
              style={{ color: '#333333', fontFamily: 'var(--font-mono)' }}
            >
              GymOS · Fase 2 ·{' '}
              {new Date().toLocaleDateString('es-AR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
