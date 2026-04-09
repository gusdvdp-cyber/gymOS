import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@gymos/utils'
import { ClipboardList, Zap } from 'lucide-react'

interface Props { clientId: string; gymId: string }
interface ExerciseStat { exerciseId: string; name: string; totalSets: number; totalVolume: number; maxWeight: number; sessions: number }
interface WeekBucket { label: string; count: number; weekStart: Date }

function getMondayOf(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDuration(startedAt: string, finishedAt: string): string {
  const mins = Math.round((new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 60000)
  return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`
}

const SURFACE: React.CSSProperties = { backgroundColor: '#111111', border: '1px solid #2a2a2a', borderRadius: 12 }
const LABEL: React.CSSProperties = { color: '#444444', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }

export default async function ClientProgress({ clientId, gymId }: Props) {
  const supabase = await createClient()

  const [{ data: sessionsRaw }] = await Promise.all([
    supabase
      .from('workout_sessions')
      .select('id, started_at, finished_at, routine_id, routine_day_id, routines(name), routine_days(name)')
      .eq('client_id', clientId)
      .eq('gym_id', gymId)
      .not('finished_at', 'is', null)
      .order('started_at', { ascending: false })
      .limit(60),
  ])

  const sessions = (sessionsRaw ?? []) as any[]
  let logs: any[] = []

  if (sessions.length > 0) {
    const { data } = await supabase
      .from('workout_set_logs')
      .select('session_id, exercise_id, reps, weight_kg, exercises(id, name, muscle_group)')
      .eq('gym_id', gymId)
      .in('session_id', sessions.map((s) => s.id))
    logs = (data ?? []) as any[]
  }

  const totalSessions = sessions.length
  const totalSets = logs.length
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
  const monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate() - 30)
  const sessionsThisWeek = sessions.filter((s) => new Date(s.started_at) >= weekAgo).length
  const sessionsThisMonth = sessions.filter((s) => new Date(s.started_at) >= monthAgo).length
  const avgDuration = sessions.length > 0
    ? Math.round(sessions.reduce((acc, s) => acc + (new Date(s.finished_at).getTime() - new Date(s.started_at).getTime()) / 60000, 0) / sessions.length)
    : 0

  // Weekly buckets
  const weeks: WeekBucket[] = []
  for (let i = 9; i >= 0; i--) {
    const weekStart = getMondayOf(new Date())
    weekStart.setDate(weekStart.getDate() - i * 7)
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7)
    const count = sessions.filter((s) => { const d = new Date(s.started_at); return d >= weekStart && d < weekEnd }).length
    weeks.push({ label: weekStart.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }), count, weekStart })
  }
  const maxWeekCount = Math.max(...weeks.map((w) => w.count), 1)

  // Day of week
  const dayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  const dayCounts = Array(7).fill(0) as number[]
  for (const s of sessions) { dayCounts[(new Date(s.started_at).getDay() + 6) % 7]!++ }
  const maxDayCount = Math.max(...dayCounts, 1)

  // Exercise stats
  const exMap: Record<string, ExerciseStat> = {}
  const sessionsByEx: Record<string, Set<string>> = {}
  for (const log of logs) {
    const id = log.exercise_id
    if (!id) continue
    if (!exMap[id]) { exMap[id] = { exerciseId: id, name: log.exercises?.name ?? '—', totalSets: 0, totalVolume: 0, maxWeight: 0, sessions: 0 }; sessionsByEx[id] = new Set() }
    exMap[id]!.totalSets++
    sessionsByEx[id]!.add(log.session_id)
    if (log.weight_kg && log.reps) exMap[id]!.totalVolume += log.weight_kg * log.reps
    if (log.weight_kg && log.weight_kg > exMap[id]!.maxWeight) exMap[id]!.maxWeight = log.weight_kg
  }
  for (const id of Object.keys(exMap)) exMap[id]!.sessions = sessionsByEx[id]!.size
  const topExercises = Object.values(exMap).sort((a, b) => b.totalSets - a.totalSets).slice(0, 6)
  const maxSets = Math.max(...topExercises.map((e) => e.totalSets), 1)

  if (totalSessions === 0) {
    return (
      <div className="surface p-8 text-center" style={{ color: '#444', fontSize: 13 }}>
        Este cliente aún no completó ningún entrenamiento.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Entrenos totales', value: totalSessions, sub: null },
          { label: 'Esta semana', value: sessionsThisWeek, sub: `${sessionsThisMonth} este mes` },
          { label: 'Series totales', value: totalSets, sub: null },
          { label: 'Prom. duración', value: `${avgDuration}m`, sub: null },
        ].map((stat) => (
          <div key={stat.label} style={{ ...SURFACE, padding: '16px' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: '#ffffff', lineHeight: 1 }}>{stat.value}</p>
            <p style={{ ...LABEL, marginTop: 6 }}>{stat.label}</p>
            {stat.sub && <p style={{ color: '#333', fontSize: 11, marginTop: 2 }}>{stat.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Weekly bars */}
        <div style={{ ...SURFACE, padding: 20 }}>
          <p style={{ ...LABEL, marginBottom: 16 }}>Actividad por semana</p>
          <div className="flex items-end gap-1.5" style={{ height: 80 }}>
            {weeks.map((w) => (
              <div key={w.label} className="flex flex-1 flex-col items-center gap-1">
                <div className="relative flex w-full justify-center">
                  {w.count > 0 && (
                    <span style={{ position: 'absolute', top: -16, fontSize: 10, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{w.count}</span>
                  )}
                  <div
                    className="w-full rounded-t-sm transition-all"
                    style={{
                      height: `${Math.max((w.count / maxWeekCount) * 64, w.count > 0 ? 4 : 0)}px`,
                      backgroundColor: w.count > 0 ? 'var(--color-accent)' : '#2a2a2a',
                      opacity: w.count > 0 ? 0.9 : 0.3,
                    }}
                  />
                </div>
                <span style={{ fontSize: 8, color: '#333', lineHeight: 1, fontFamily: 'var(--font-mono)' }}>{w.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Day of week */}
        <div style={{ ...SURFACE, padding: 20 }}>
          <p style={{ ...LABEL, marginBottom: 16 }}>Días preferidos</p>
          <div className="space-y-2">
            {dayLabels.map((label, idx) => (
              <div key={label} className="flex items-center gap-3">
                <span style={{ width: 28, fontSize: 11, color: '#444', fontFamily: 'var(--font-mono)' }}>{label}</span>
                <div className="flex-1 rounded-full" style={{ height: 6, backgroundColor: '#1a1a1a' }}>
                  <div
                    className="rounded-full transition-all"
                    style={{ height: 6, width: `${(dayCounts[idx]! / maxDayCount) * 100}%`, backgroundColor: 'var(--color-accent)', opacity: 0.8 }}
                  />
                </div>
                <span style={{ width: 16, textAlign: 'right', fontSize: 11, color: '#333', fontFamily: 'var(--font-mono)' }}>{dayCounts[idx]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top exercises */}
      {topExercises.length > 0 && (
        <div style={{ ...SURFACE, padding: 20 }}>
          <p style={{ ...LABEL, marginBottom: 16 }}>Ejercicios más entrenados</p>
          <div className="space-y-4">
            {topExercises.map((ex) => (
              <div key={ex.exerciseId}>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span style={{ color: '#ffffff', fontSize: 13, fontWeight: 500 }}>{ex.name}</span>
                    <span style={{ marginLeft: 8, color: '#444', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{ex.sessions} ses.</span>
                  </div>
                  <div className="flex gap-3">
                    <span style={{ color: '#888', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                      <span style={{ color: '#ffffff', fontWeight: 700 }}>{ex.totalSets}</span> series
                    </span>
                    {ex.maxWeight > 0 && (
                      <span style={{ color: '#888', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                        max <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>{ex.maxWeight}kg</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="rounded-full" style={{ height: 3, backgroundColor: '#1a1a1a' }}>
                  <div
                    className="rounded-full"
                    style={{ height: 3, width: `${(ex.totalSets / maxSets) * 100}%`, backgroundColor: 'var(--color-accent)', opacity: 0.7 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent sessions */}
      <div style={{ ...SURFACE, padding: 20 }}>
        <p style={{ ...LABEL, marginBottom: 16 }}>Últimas sesiones</p>
        <div>
          {sessions.slice(0, 8).map((s, i) => {
            const sessionLogs = logs.filter((l) => l.session_id === s.id)
            const uniqueEx = new Set(sessionLogs.map((l) => l.exercise_id)).size
            const isRoutine = !!s.routine_id
            return (
              <div key={s.id} className="flex items-center gap-3 py-3" style={{ borderBottom: i < 7 ? '1px solid #1a1a1a' : 'none' }}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: '#1a1a1a' }}>
                  {isRoutine
                    ? <ClipboardList size={14} style={{ color: 'var(--color-accent)' }} />
                    : <Zap size={14} style={{ color: '#888' }} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate" style={{ color: '#ffffff', fontSize: 13, fontWeight: 500 }}>
                    {isRoutine
                      ? `${(s.routines as any)?.name ?? 'Rutina'}${(s.routine_days as any)?.name ? ` · ${(s.routine_days as any).name}` : ''}`
                      : 'Entrenamiento libre'}
                  </p>
                  <p style={{ color: '#444', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                    {uniqueEx} ejerc. · {sessionLogs.length} series
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p style={{ color: 'var(--color-accent)', fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{formatDuration(s.started_at, s.finished_at)}</p>
                  <p style={{ color: '#333', fontSize: 10, fontFamily: 'var(--font-mono)' }}>{formatDate(s.started_at)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
