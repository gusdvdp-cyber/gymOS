import type { GymStatus } from '@gymos/types'

const STATUS_CONFIG: Record<GymStatus, { label: string; className: string }> = {
  active: { label: 'Activo', className: 'bg-green-50 text-green-700' },
  inactive: { label: 'Inactivo', className: 'bg-gray-100 text-gray-600' },
  suspended: { label: 'Suspendido', className: 'bg-red-50 text-red-700' },
}

export default function GymStatusBadge({ status }: { status: GymStatus }) {
  const { label, className } = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold ${className}`}>
      {label}
    </span>
  )
}
