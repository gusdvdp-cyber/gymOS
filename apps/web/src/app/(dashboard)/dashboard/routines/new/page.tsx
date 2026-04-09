import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getAdminContext } from '@/lib/get-admin-context'
import RoutineBuilder from '@/components/routines/routine-builder'

export const metadata: Metadata = { title: 'Nueva rutina' }

export default async function NewRoutinePage() {
  const { gymId } = await getAdminContext()
  const supabase = await createClient()

  const { data: exercises } = await supabase
    .from('exercises')
    .select('id, name, muscle_group, thumbnail_url')
    .eq('gym_id', gymId)
    .eq('is_active', true)
    .order('name')

  return (
    <div className="space-y-5">
      <div>
        <Link href="/dashboard/routines" className="back-link">← Rutinas</Link>
        <h1 className="page-title" style={{ fontSize: 36, marginTop: 8 }}>NUEVA RUTINA</h1>
      </div>
      <RoutineBuilder exercises={exercises ?? []} />
    </div>
  )
}
