import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getClients } from './actions'
import ClientList from '@/components/clients/client-list'
import InviteButton from '@/components/clients/invite-button'

export const metadata: Metadata = { title: 'Clientes' }

export default async function ClientsPage() {
  const { data: clients, error } = await getClients()

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="page-title">CLIENTES</h1>
          <p className="page-subtitle">{clients?.length ?? 0} clientes registrados</p>
        </div>
        <div className="flex items-center gap-2">
          <InviteButton />
          <Link href="/dashboard/clients/new" className="btn-ghost">
            <Plus size={14} /> Crear manualmente
          </Link>
        </div>
      </div>
      {error && <div className="alert-error">{error.message}</div>}
      {clients && <ClientList clients={clients} />}
    </div>
  )
}
