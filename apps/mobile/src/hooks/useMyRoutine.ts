import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useSession } from '@/context/session-context'
import type { RoutineWithDays } from '@gymos/types'

export interface MyRoutineResult {
  routine: RoutineWithDays | null
  assignedAt: string | null
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useMyRoutine(): MyRoutineResult {
  const { session } = useSession()
  const [routine, setRoutine] = useState<RoutineWithDays | null>(null)
  const [assignedAt, setAssignedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!session) {
      setRoutine(null)
      setAssignedAt(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('client_routine_assignments')
      .select(`
        routine_id,
        assigned_at,
        routines(
          *,
          routine_days(
            *,
            routine_day_exercises(
              *,
              exercises(id, name, muscle_group, thumbnail_url, video_url, description)
            )
          )
        )
      `)
      .eq('client_id', session.user.id)
      .eq('is_active', true)
      .order('assigned_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    if (!data) {
      setRoutine(null)
      setAssignedAt(null)
      setLoading(false)
      return
    }

    setAssignedAt((data as any).assigned_at ?? null)

    const r = (data as any).routines
    if (!r) {
      setRoutine(null)
      setLoading(false)
      return
    }

    const sorted: RoutineWithDays = {
      ...r,
      routine_days: [...r.routine_days]
        .sort((a: any, b: any) => a.day_number - b.day_number)
        .map((day: any) => ({
          ...day,
          routine_day_exercises: [...day.routine_day_exercises].sort(
            (a: any, b: any) => a.sort_order - b.sort_order
          ),
        })),
    }

    setRoutine(sorted)
    setLoading(false)
  }, [session])

  useEffect(() => {
    load()
  }, [load])

  return { routine, assignedAt, loading, error, refresh: load }
}
