import type { Metadata } from 'next'
import Link from 'next/link'
import ExerciseForm from '@/components/exercises/exercise-form'

export const metadata: Metadata = { title: 'Nuevo ejercicio' }

export default async function NewExercisePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <Link href="/dashboard/exercises" className="back-link">← Ejercicios</Link>
        <h1 className="page-title" style={{ fontSize: 36, marginTop: 8 }}>NUEVO EJERCICIO</h1>
      </div>
      <ExerciseForm {...(error ? { error } : {})} />
    </div>
  )
}
