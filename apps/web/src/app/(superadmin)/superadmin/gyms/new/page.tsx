import type { Metadata } from 'next'
import Link from 'next/link'
import GymForm from '@/components/gyms/gym-form'

export const metadata: Metadata = { title: 'Nuevo gimnasio' }

export default async function NewGymPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/superadmin/gyms" className="text-sm text-gray-500 hover:text-gray-700">
          ← Volver
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo gimnasio</h1>
      </div>
      <GymForm error={params.error} />
    </div>
  )
}
