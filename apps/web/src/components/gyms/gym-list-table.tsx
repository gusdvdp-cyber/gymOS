import Link from 'next/link'
import type { GymWithBranding } from '@gymos/types'
import GymStatusBadge from './gym-status-badge'
import { formatDate } from '@gymos/utils'

interface GymListTableProps {
  gyms: GymWithBranding[]
}

export default function GymListTable({ gyms }: GymListTableProps) {
  if (gyms.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-12 text-center text-gray-400">
        No hay gimnasios registrados todavía.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['Nombre', 'Plan', 'Estado', 'Creado', 'Branding', ''].map((h) => (
              <th
                key={h}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {gyms.map((gym) => (
            <tr key={gym.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{gym.name}</div>
                <div className="text-xs text-gray-400 font-mono">{gym.slug}</div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex rounded bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                  {gym.plan}
                </span>
              </td>
              <td className="px-6 py-4">
                <GymStatusBadge status={gym.status} />
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">{formatDate(gym.created_at)}</td>
              <td className="px-6 py-4">
                {gym.gym_branding ? (
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-4 w-4 rounded-full border"
                      style={{ backgroundColor: gym.gym_branding.primary_color }}
                      title={gym.gym_branding.primary_color}
                    />
                    <span
                      className="h-4 w-4 rounded-full border"
                      style={{ backgroundColor: gym.gym_branding.secondary_color }}
                      title={gym.gym_branding.secondary_color}
                    />
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">—</span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <Link
                  href={`/superadmin/gyms/${gym.id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Ver →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
