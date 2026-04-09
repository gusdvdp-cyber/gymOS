'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ClipboardList, ChevronRight } from 'lucide-react'
import type { Routine } from '@gymos/types'
import { formatDate } from '@gymos/utils'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

export default function RoutineList({ routines }: { routines: Routine[] }) {
  if (routines.length === 0) {
    return (
      <div className="surface flex flex-col items-center justify-center gap-3 py-16 text-center">
        <ClipboardList size={32} style={{ color: '#2a2a2a' }} />
        <p style={{ color: '#888888', fontSize: 14 }}>No hay rutinas todavía.</p>
        <Link href="/dashboard/routines/new" className="btn-accent" style={{ padding: '8px 16px', fontSize: 13 }}>
          Crear la primera
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
      {routines.map((routine) => (
        <motion.div key={routine.id} variants={item}>
          <Link
            href={`/dashboard/routines/${routine.id}`}
            className="card-hover surface flex flex-col gap-3 p-5 block"
          >
            <div className="flex items-start justify-between">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: '#1a1a1a' }}
              >
                <ClipboardList size={16} style={{ color: 'var(--color-accent)' }} strokeWidth={1.8} />
              </div>
              <div className="flex gap-1.5">
                <span className="badge-accent">{routine.days_per_week}d/sem</span>
                {routine.total_weeks && (
                  <span className="badge-inactive">{routine.total_weeks} sem</span>
                )}
              </div>
            </div>

            <div>
              <p className="font-semibold truncate" style={{ color: '#ffffff', fontFamily: 'var(--font-body)', fontSize: 14 }}>
                {routine.name}
              </p>
              {routine.description && (
                <p className="mt-1 line-clamp-2" style={{ color: '#888888', fontSize: 12 }}>
                  {routine.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between" style={{ borderTop: '1px solid #1a1a1a', paddingTop: 8 }}>
              <span style={{ color: '#444444', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                {formatDate(routine.created_at)}
              </span>
              <div className="flex items-center gap-1">
                {!routine.is_active && <span className="badge-inactive">Inactiva</span>}
                <ChevronRight size={14} style={{ color: '#2a2a2a' }} />
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  )
}
