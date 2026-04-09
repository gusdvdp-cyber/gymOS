import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getExercise } from '../actions'
import ExerciseForm from '@/components/exercises/exercise-form'
import MuscleGroupSVG from '@/components/exercises/muscle-group-svg'
import { MUSCLE_GROUP_LABELS } from '@gymos/types'

export const metadata: Metadata = { title: 'Editar ejercicio' }

export default async function ExercisePage({
  params,
  searchParams,
}: {
  params: Promise<{ exerciseId: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const [{ exerciseId }, { error }] = await Promise.all([params, searchParams])
  const { data: exercise, error: fetchError } = await getExercise(exerciseId)

  if (fetchError || !exercise) notFound()

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <Link href="/dashboard/exercises" className="back-link">← Ejercicios</Link>
        <div className="flex items-end gap-4 mt-2">
          <div className="flex-1">
            <h1 className="page-title" style={{ fontSize: 36 }}>{exercise.name.toUpperCase()}</h1>
            <span className="badge-accent">{MUSCLE_GROUP_LABELS[exercise.muscle_group]}</span>
          </div>
          <div style={{ opacity: 0.9, flexShrink: 0 }}>
            <MuscleGroupSVG muscleGroup={exercise.muscle_group} height={100} />
          </div>
        </div>
      </div>

      {exercise.video_url && (
        <div className="overflow-hidden rounded-xl" style={{ backgroundColor: '#000', border: '1px solid #2a2a2a' }}>
          <video src={exercise.video_url} controls className="w-full object-contain" style={{ maxHeight: 256 }} />
        </div>
      )}

      <ExerciseForm exercise={exercise} error={error} />
    </div>
  )
}
