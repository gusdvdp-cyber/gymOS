import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getCoaches } from './actions'
import CoachList from '@/components/coaches/coach-list'
import InviteCoachButton from '@/components/coaches/invite-coach-button'

export const metadata: Metadata = { title: 'Profes' }

export default async function CoachesPage({
  searchParams,
}: {
  searchParams: Promise<{ pwd?: string; email?: string }>
}) {
  const [{ data: coaches, error }, { pwd, email }] = await Promise.all([getCoaches(), searchParams])

  return (
    <div className="space-y-6">
      {pwd && email && (
        <div className="alert-success">
          <p className="font-semibold">Profe creado correctamente</p>
          <p className="mt-1">
            Email: <strong>{decodeURIComponent(email)}</strong> — Contraseña:{' '}
            <code style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{decodeURIComponent(pwd)}</code>
          </p>
          <p className="mt-1" style={{ fontSize: 11, opacity: 0.7 }}>Compartila con el profe — no se volverá a mostrar.</p>
        </div>
      )}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="page-title">PROFES</h1>
          <p className="page-subtitle">{coaches?.length ?? 0} profes registrados</p>
        </div>
        <div className="flex items-center gap-2">
          <InviteCoachButton />
          <Link href="/dashboard/coaches/new" className="btn-accent">
            <Plus size={14} /> Nuevo profe
          </Link>
        </div>
      </div>
      {error && <div className="alert-error">{error.message}</div>}
      {coaches && <CoachList coaches={coaches} />}
    </div>
  )
}
