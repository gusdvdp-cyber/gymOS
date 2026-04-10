'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { UserCog } from 'lucide-react'
import type { ProfileRow } from '@gymos/types'
import { formatDate } from '@gymos/utils'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

export default function CoachList({ coaches }: { coaches: ProfileRow[] }) {
  if (coaches.length === 0) {
    return (
      <div className="surface flex flex-col items-center justify-center gap-3 py-16 text-center">
        <UserCog size={32} style={{ color: '#2a2a2a' }} />
        <p style={{ color: '#888888', fontSize: 14 }}>No hay profes todavía.</p>
        <Link href="/dashboard/coaches/new" className="btn-accent" style={{ padding: '8px 16px', fontSize: 13 }}>
          Agregar el primero
        </Link>
      </div>
    )
  }

  return (
    <motion.div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {coaches.map((coach) => (
        <motion.div key={coach.id} variants={item}>
          <div className="surface p-5">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold flex-shrink-0"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: '#0a0a0a',
                  fontFamily: 'var(--font-display)',
                  fontSize: 16,
                }}
              >
                {coach.first_name[0]}{coach.last_name[0]}
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate" style={{ color: '#ffffff', fontSize: 14 }}>
                  {coach.first_name} {coach.last_name}
                </p>
                {coach.phone && (
                  <p style={{ color: '#444444', fontSize: 11, marginTop: 1, fontFamily: 'var(--font-mono)' }}>
                    {coach.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4" style={{ borderTop: '1px solid #1a1a1a', paddingTop: 12 }}>
              <span className={coach.is_active ? 'badge-active' : 'badge-inactive'}>
                {coach.is_active ? 'Activo' : 'Inactivo'}
              </span>
              <span style={{ color: '#333333', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                {formatDate(coach.created_at)}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
