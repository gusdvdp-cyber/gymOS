import type { Metadata } from 'next'
import Link from 'next/link'
import { getGyms } from './actions'
import GymListTable from '@/components/gyms/gym-list-table'

export const metadata: Metadata = { title: 'Gimnasios' }

export default async function GymsPage() {
  const { data: gyms, error } = await getGyms()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gimnasios</h1>
          <p className="mt-1 text-sm text-gray-500">
            {gyms?.length ?? 0} gimnasio{gyms?.length !== 1 ? 's' : ''} registrado{gyms?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/superadmin/gyms/new"
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          + Nuevo gimnasio
        </Link>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error.message}</div>
      )}

      {gyms && <GymListTable gyms={gyms} />}
    </div>
  )
}
