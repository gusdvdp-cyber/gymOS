'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminContext } from '@/lib/get-admin-context'
import type { ApiResponse, Exercise, MuscleGroup } from '@gymos/types'

export async function getExercises(): Promise<ApiResponse<Exercise[]>> {
  const { gymId } = await getAdminContext()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('gym_id', gymId)
    .order('name')

  if (error) return { data: null, error: { message: error.message } }
  return { data: data as Exercise[], error: null }
}

export async function getExercise(exerciseId: string): Promise<ApiResponse<Exercise>> {
  const { gymId } = await getAdminContext()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', exerciseId)
    .eq('gym_id', gymId)
    .single()

  if (error) return { data: null, error: { message: error.message } }
  return { data: data as Exercise, error: null }
}

export async function createExercise(formData: FormData): Promise<void> {
  const { gymId, userId } = await getAdminContext()
  const supabase = await createClient()

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const muscleGroup = formData.get('muscle_group') as MuscleGroup
  const videoUrl = formData.get('video_url') as string || null
  const videoDurationStr = formData.get('video_duration') as string
  const videoDuration = videoDurationStr ? parseInt(videoDurationStr) : null

  const { data, error } = await supabase
    .from('exercises')
    .insert({
      gym_id: gymId,
      name,
      description: description || null,
      muscle_group: muscleGroup,
      video_url: videoUrl,
      video_duration: videoDuration,
      created_by: userId,
    })
    .select('id')
    .single()

  if (error) redirect(`/dashboard/exercises/new?error=${encodeURIComponent(error.message)}`)

  revalidatePath('/dashboard/exercises')
  redirect('/dashboard/exercises')
}

export async function updateExercise(exerciseId: string, formData: FormData): Promise<void> {
  const { gymId } = await getAdminContext()
  const supabase = await createClient()

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const muscleGroup = formData.get('muscle_group') as MuscleGroup
  const videoUrl = formData.get('video_url') as string || null
  const videoDurationStr = formData.get('video_duration') as string
  const videoDuration = videoDurationStr ? parseInt(videoDurationStr) : null

  const { error } = await supabase
    .from('exercises')
    .update({
      name,
      description: description || null,
      muscle_group: muscleGroup,
      video_url: videoUrl,
      video_duration: videoDuration,
    })
    .eq('id', exerciseId)
    .eq('gym_id', gymId)

  if (error) redirect(`/dashboard/exercises/${exerciseId}?error=${encodeURIComponent(error.message)}`)

  revalidatePath('/dashboard/exercises')
  revalidatePath(`/dashboard/exercises/${exerciseId}`)
  redirect(`/dashboard/exercises/${exerciseId}`)
}

export async function toggleExerciseActive(exerciseId: string, isActive: boolean): Promise<ApiResponse<null>> {
  const { gymId } = await getAdminContext()
  const supabase = await createClient()

  const { error } = await supabase
    .from('exercises')
    .update({ is_active: isActive })
    .eq('id', exerciseId)
    .eq('gym_id', gymId)

  if (error) return { data: null, error: { message: error.message } }

  revalidatePath('/dashboard/exercises')
  return { data: null, error: null }
}
