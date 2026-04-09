import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getRoutines } from './actions'
import RoutineList from '@/components/routines/routine-list'

export const metadata: Metadata = { title: 'Rutinas' }

export default async function RoutinesPage() {
  const { data: routines, error } = await getRoutines()

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="page-title">RUTINAS</h1>
          <p className="page-subtitle">{routines?.length ?? 0} rutinas creadas</p>
        </div>
        <Link href="/dashboard/routines/new" className="btn-accent">
          <Plus size={14} /> Nueva rutina
        </Link>
      </div>
      {error && <div className="alert-error">{error.message}</div>}
      {routines && <RoutineList routines={routines} />}
    </div>
  )
}
