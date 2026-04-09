import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminContext } from '@/lib/get-admin-context'
import { getClient } from '../actions'
import AssignRoutine from '@/components/clients/assign-routine'
import ClientProgress from '@/components/clients/client-progress'
import { formatDate } from '@gymos/utils'

export const metadata: Metadata = { title: 'Perfil del cliente' }

export default async function ClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>
  searchParams: Promise<{ pwd?: string }>
}) {
  const [{ clientId }, { pwd }] = await Promise.all([params, searchParams])
  const { gymId } = await getAdminContext()
  const supabase = await createClient()

  const adminSupabase = createAdminClient()

  const [{ data: client, error }, { data: routines }, { data: assignment }, { data: authUser }] = await Promise.all([
    getClient(clientId),
    supabase.from('routines').select('id, name, days_per_week').eq('gym_id', gymId).eq('is_active', true).order('name'),
    supabase
      .from('client_routine_assignments')
      .select('routine_id, is_active, assigned_at, routines(name, days_per_week)')
      .eq('client_id', clientId)
      .eq('is_active', true)
      .maybeSingle(),
    adminSupabase.auth.admin.getUserById(clientId),
  ])

  if (error || !client) notFound()

  return (
    <div className="space-y-6">
      {pwd && (
        <div className="alert-success">
          <p className="font-semibold">Cliente creado correctamente</p>
          <p className="mt-1">
            Contraseña:{' '}
            <code style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{decodeURIComponent(pwd)}</code>
          </p>
          <p style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>Compartila con el cliente — no se volverá a mostrar.</p>
        </div>
      )}

      <div>
        <Link href="/dashboard/clients" className="back-link">← Clientes</Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="page-title" style={{ fontSize: 36 }}>
            {client.first_name.toUpperCase()} {client.last_name.toUpperCase()}
          </h1>
          <span className={client.is_active ? 'badge-active' : 'badge-inactive'}>
            {client.is_active ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="surface p-5">
          <p className="label-dark" style={{ marginBottom: 16 }}>Datos personales</p>
          <dl className="space-y-4">
            {[
              ['Email', authUser?.user?.email ?? '—'],
              ['Teléfono', client.phone ?? '—'],
              ['Registrado', formatDate(client.created_at)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="label-dark" style={{ marginBottom: 2 }}>{label}</dt>
                <dd style={{ color: '#cccccc', fontSize: 14 }}>{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <AssignRoutine
          clientId={clientId}
          routines={routines ?? []}
          currentAssignment={assignment as any}
        />
      </div>

      <div>
        <p className="label-dark" style={{ marginBottom: 16 }}>Progreso y actividad</p>
        <ClientProgress clientId={clientId} gymId={gymId} />
      </div>
    </div>
  )
}
