'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Users, ChevronRight } from 'lucide-react'
import type { ClientWithAssignment } from '@/app/(dashboard)/dashboard/clients/actions'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}
const row = {
  hidden: { opacity: 0, x: -8 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
}

export default function ClientList({ clients }: { clients: ClientWithAssignment[] }) {
  const [search, setSearch] = useState('')

  const filtered = clients.filter((c) =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase())
  )

  if (clients.length === 0) {
    return (
      <div className="surface flex flex-col items-center justify-center gap-3 py-16 text-center">
        <Users size={32} style={{ color: '#2a2a2a' }} />
        <p style={{ color: '#888888', fontSize: 14 }}>No hay clientes todavía.</p>
        <Link href="/dashboard/clients/new" className="btn-accent" style={{ padding: '8px 16px', fontSize: 13 }}>
          Agregar el primero
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#444', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-dark"
          style={{ paddingLeft: 36 }}
        />
      </div>

      <div className="surface overflow-hidden">
        <table className="table-dark">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Rutina asignada</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <motion.tbody variants={container} initial="hidden" animate="show">
            {filtered.map((client) => (
              <motion.tr key={client.id} variants={row}>
                <td>
                  <p className="font-medium" style={{ color: '#ffffff' }}>{client.first_name} {client.last_name}</p>
                  {client.phone && <p style={{ color: '#444444', fontSize: 11, marginTop: 2, fontFamily: 'var(--font-mono)' }}>{client.phone}</p>}
                </td>
                <td>
                  {(client.active_routine as any)?.routines?.name
                    ? <span style={{ color: '#cccccc' }}>{(client.active_routine as any).routines.name}</span>
                    : <span style={{ color: '#333333' }}>Sin asignar</span>
                  }
                </td>
                <td>
                  <span className={client.is_active ? 'badge-active' : 'badge-inactive'}>
                    {client.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <Link
                    href={`/dashboard/clients/${client.id}`}
                    className="flex items-center justify-end gap-1"
                    style={{ color: 'var(--color-accent)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
                  >
                    Ver <ChevronRight size={14} />
                  </Link>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
        {filtered.length === 0 && search && (
          <p className="py-8 text-center" style={{ color: '#444', fontSize: 13 }}>Sin resultados.</p>
        )}
      </div>
    </div>
  )
}
