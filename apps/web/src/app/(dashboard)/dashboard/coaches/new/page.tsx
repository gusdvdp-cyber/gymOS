import type { Metadata } from 'next'
import Link from 'next/link'
import CoachForm from '@/components/coaches/coach-form'

export const metadata: Metadata = { title: 'Nuevo profe' }

export default async function NewCoachPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div>
        <Link href="/dashboard/coaches" className="back-link">← Profes</Link>
        <h1 className="page-title" style={{ fontSize: 36, marginTop: 8 }}>NUEVO PROFE</h1>
      </div>
      <CoachForm error={error} />
    </div>
  )
}
