import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getGym } from '../actions'
import GymStatusBadge from '@/components/gyms/gym-status-badge'
import { formatDate } from '@gymos/utils'

export const metadata: Metadata = { title: 'Detalle del gimnasio' }

export default async function GymDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ gymId: string }>
  searchParams: Promise<{ pwd?: string }>
}) {
  const [{ gymId }, { pwd }] = await Promise.all([params, searchParams])
  const { data: gym, error } = await getGym(gymId)

  if (error || !gym) notFound()

  return (
    <div className="space-y-6">
      {pwd && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-800">✓ Gimnasio creado correctamente</p>
          <p className="mt-1 text-sm text-green-700">
            Contraseña temporal del admin:{' '}
            <code className="rounded bg-green-100 px-2 py-0.5 font-mono font-bold text-green-900">
              {decodeURIComponent(pwd)}
            </code>
          </p>
          <p className="mt-1 text-xs text-green-600">
            Guardala ahora — no se volverá a mostrar. El admin puede cambiarla desde su perfil.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/superadmin/gyms" className="text-sm text-gray-500 hover:text-gray-700">
            ← Gimnasios
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{gym.name}</h1>
          <GymStatusBadge status={gym.status} />
        </div>
        <div className="flex gap-2">
          <Link
            href={`/superadmin/gyms/${gymId}/branding`}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Editar branding
          </Link>
          <Link
            href={`/superadmin/gyms/${gymId}/edit`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Editar datos
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Información del gym */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Información</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Plan</dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900">{gym.plan}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Slug</dt>
              <dd className="mt-1 font-mono text-sm text-gray-700">{gym.slug}</dd>
            </div>
            {gym.email && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-700">{gym.email}</dd>
              </div>
            )}
            {gym.phone && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Teléfono</dt>
                <dd className="mt-1 text-sm text-gray-700">{gym.phone}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Creado</dt>
              <dd className="mt-1 text-sm text-gray-700">{formatDate(gym.created_at)}</dd>
            </div>
          </dl>
        </div>

        {/* Branding */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Branding</h2>
          {gym.gym_branding ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full border shadow-inner"
                  style={{ backgroundColor: gym.gym_branding.primary_color }}
                />
                <div>
                  <p className="text-xs text-gray-500">Color primario</p>
                  <p className="font-mono text-sm font-medium">{gym.gym_branding.primary_color}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full border shadow-inner"
                  style={{ backgroundColor: gym.gym_branding.secondary_color }}
                />
                <div>
                  <p className="text-xs text-gray-500">Color secundario</p>
                  <p className="font-mono text-sm font-medium">{gym.gym_branding.secondary_color}</p>
                </div>
              </div>
              {gym.gym_branding.logo_url && (
                <div>
                  <p className="mb-2 text-xs text-gray-500">Logo</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={gym.gym_branding.logo_url} alt="Logo del gym" className="h-12 object-contain" />
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Sin branding configurado</p>
          )}
        </div>
      </div>
    </div>
  )
}
