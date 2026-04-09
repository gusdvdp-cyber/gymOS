import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminContext } from '@/lib/get-admin-context'
import { getRoutineWithDays } from '../actions'
import RoutineBuilder from '@/components/routines/routine-builder'
import { MUSCLE_GROUP_LABELS } from '@gymos/types'

export const metadata: Metadata = { title: 'Editar rutina' }

export default async function RoutineDetailPage({ params }: { params: Promise<{ routineId: string }> }) {
  const { routineId } = await params
  const { gymId } = await getAdminContext()
  const supabase = await createClient()

  const [{ data: routine, error }, { data: exercises }] = await Promise.all([
    getRoutineWithDays(routineId),
    supabase
      .from('exercises')
      .select('id, name, muscle_group, thumbnail_url')
      .eq('gym_id', gymId)
      .eq('is_active', true)
      .order('name'),
  ])

  if (error || !routine) notFound()

  // Convertir a RoutineBuilderState para el editor
  const initialState = {
    name: routine.name,
    days_per_week: routine.days_per_week,
    total_weeks: routine.total_weeks ?? null,
    description: routine.description ?? '',
    days: routine.routine_days.map((day) => ({
      day_number: day.day_number,
      name: day.name,
      exercises: day.routine_day_exercises.map((rde) => ({
        tempId: rde.id,
        exercise_id: rde.exercise_id,
        exercise_name: rde.exercises.name,
        muscle_group: rde.exercises.muscle_group,
        sets: rde.sets,
        reps: rde.reps,
        suggested_weight: rde.suggested_weight,
        notes: rde.notes ?? '',
      })),
    })),
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/dashboard/routines" className="back-link">← Rutinas</Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="page-title" style={{ fontSize: 36 }}>{routine.name.toUpperCase()}</h1>
          <span className="badge-accent">{routine.days_per_week}d/sem</span>
          {routine.total_weeks && <span className="badge-inactive">{routine.total_weeks} sem</span>}
        </div>
      </div>
      <RoutineBuilder exercises={exercises ?? []} initialState={initialState} routineId={routineId} />
    </div>
  )
}
