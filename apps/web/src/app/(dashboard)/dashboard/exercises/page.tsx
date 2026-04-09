import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getExercises } from './actions'
import ExerciseList from '@/components/exercises/exercise-list'

export const metadata: Metadata = { title: 'Ejercicios' }

export default async function ExercisesPage() {
  const { data: exercises, error } = await getExercises()

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="page-title">EJERCICIOS</h1>
          <p className="page-subtitle">{exercises?.length ?? 0} ejercicios en tu gimnasio</p>
        </div>
        <Link href="/dashboard/exercises/new" className="btn-accent">
          <Plus size={14} /> Nuevo ejercicio
        </Link>
      </div>
      {error && <div className="alert-error">{error.message}</div>}
      {exercises && <ExerciseList exercises={exercises} />}
    </div>
  )
}
