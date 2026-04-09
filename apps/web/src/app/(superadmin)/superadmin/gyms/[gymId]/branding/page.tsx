import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getGym } from '../../actions'
import BrandingEditor from '@/components/branding/branding-editor'

export const metadata: Metadata = { title: 'Editar branding' }

export default async function BrandingPage({ params }: { params: Promise<{ gymId: string }> }) {
  const { gymId } = await params
  const { data: gym, error } = await getGym(gymId)

  if (error || !gym) notFound()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/superadmin/gyms/${gymId}`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Volver
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Branding — {gym.name}</h1>
      </div>
      <BrandingEditor gymId={gymId} initialBranding={gym.gym_branding} />
    </div>
  )
}
