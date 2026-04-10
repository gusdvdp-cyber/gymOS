import type { Metadata } from 'next'
import Link from 'next/link'
import ClientForm from '@/components/clients/client-form'

export const metadata: Metadata = { title: 'Nuevo cliente' }

export default async function NewClientPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div>
        <Link href="/dashboard/clients" className="back-link">← Clientes</Link>
        <h1 className="page-title" style={{ fontSize: 36, marginTop: 8 }}>NUEVO CLIENTE</h1>
      </div>
      <ClientForm {...(error ? { error } : {})} />
    </div>
  )
}
