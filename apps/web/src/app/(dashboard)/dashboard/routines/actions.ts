'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminContext } from '@/lib/get-admin-context'
import type { ApiResponse, RoutineWithDays, Routine, CreateRoutinePayload } from '@gymos/types'

export async function getRoutines(): Promise<ApiResponse<Routine[]>> {
  const { gymId } = await getAdminContext()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('routines')
    .select('*')
    .eq('gym_id', gymId)
    .order('name')

  if (error) return { data: null, error: { message: error.message } }
  return { data: data as Routine[], error: null }
}

export async function getRoutineWithDays(routineId: string): Promise<ApiResponse<RoutineWithDays>> {
  const { gymId } = await getAdminContext()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('routines')
    .select(`
      *,
      routine_days (
        *,
        routine_day_exercises (
          *,
          exercises ( id, name, muscle_group, thumbnail_url, video_url )
        )
      )
    `)
    .eq('id', routineId)
    .eq('gym_id', gymId)
    .order('day_number', { referencedTable: 'routine_days' })
    .order('sort_order', { referencedTable: 'routine_days.routine_day_exercises' })
    .single()

  if (error) return { data: null, error: { message: error.message } }
  return { data: data as unknown as RoutineWithDays, error: null }
}

export async function createRoutineWithDays(payload: CreateRoutinePayload): Promise<ApiResponse<{ routineId: string }>> {
  const { gymId, userId } = await getAdminContext()
  const supabase = await createClient()

  // 1. Crear rutina
  const { data: routine, error: routineError } = await supabase
    .from('routines')
    .insert({
      gym_id: gymId,
      name: payload.state.name,
      days_per_week: payload.state.days_per_week,
      total_weeks: payload.state.total_weeks ?? null,
      description: payload.state.description || null,
      created_by: userId,
    })
    .select('id')
    .single()

  if (routineError) return { data: null, error: { message: routineError.message } }

  // 2. Crear días
  for (const day of payload.state.days) {
    const { data: routineDay, error: dayError } = await supabase
      .from('routine_days')
      .insert({
        routine_id: routine.id,
        gym_id: gymId,
        day_number: day.day_number,
        name: day.name,
      })
      .select('id')
      .single()

    if (dayError) continue

    // 3. Crear ejercicios del día
    if (day.exercises.length > 0) {
      await supabase.from('routine_day_exercises').insert(
        day.exercises.map((ex, idx) => ({
          routine_day_id: routineDay.id,
          gym_id: gymId,
          exercise_id: ex.exercise_id,
          sort_order: idx,
          sets: ex.sets,
          reps: ex.reps,
          suggested_weight: ex.suggested_weight,
          notes: ex.notes || null,
        }))
      )
    }
  }

  revalidatePath('/dashboard/routines')
  return { data: { routineId: routine.id }, error: null }
}

export async function updateRoutineWithDays(routineId: string, payload: CreateRoutinePayload): Promise<ApiResponse<null>> {
  const { gymId } = await getAdminContext()
  const supabase = await createClient()

  // 1. Actualizar metadata de la rutina
  const { error: updateError } = await supabase
    .from('routines')
    .update({
      name: payload.state.name,
      days_per_week: payload.state.days_per_week,
      total_weeks: payload.state.total_weeks ?? null,
      description: payload.state.description || null,
    })
    .eq('id', routineId)
    .eq('gym_id', gymId)

  if (updateError) return { data: null, error: { message: updateError.message } }

  // 2. Borrar días existentes (cascade borrará los ejercicios)
  await supabase.from('routine_days').delete().eq('routine_id', routineId)

  // 3. Recrear días y ejercicios
  for (const day of payload.state.days) {
    const { data: routineDay, error: dayError } = await supabase
      .from('routine_days')
      .insert({
        routine_id: routineId,
        gym_id: gymId,
        day_number: day.day_number,
        name: day.name,
      })
      .select('id')
      .single()

    if (dayError) continue

    if (day.exercises.length > 0) {
      await supabase.from('routine_day_exercises').insert(
        day.exercises.map((ex, idx) => ({
          routine_day_id: routineDay.id,
          gym_id: gymId,
          exercise_id: ex.exercise_id,
          sort_order: idx,
          sets: ex.sets,
          reps: ex.reps,
          suggested_weight: ex.suggested_weight,
          notes: ex.notes || null,
        }))
      )
    }
  }

  revalidatePath('/dashboard/routines')
  revalidatePath(`/dashboard/routines/${routineId}`)
  return { data: null, error: null }
}
