'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Plus, Dumbbell, ClipboardList, UserPlus, UserCog } from 'lucide-react'

const ACTIONS = [
  { label: 'Nuevo ejercicio',  href: '/dashboard/exercises/new', icon: Dumbbell },
  { label: 'Nueva rutina',     href: '/dashboard/routines/new',  icon: ClipboardList },
  { label: 'Nuevo cliente',    href: '/dashboard/clients/new',   icon: UserPlus },
  { label: 'Nuevo profe',      href: '/dashboard/coaches/new',   icon: UserCog },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.35 } },
}
const item = {
  hidden: { opacity: 0, x: -12 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

export default function QuickActions() {
  return (
    <div
      className="rounded-xl p-5"
      style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}
    >
      <p
        className="mb-4 text-xs uppercase tracking-widest"
        style={{ color: '#444444', fontFamily: 'var(--font-mono)' }}
      >
        Accesos rápidos
      </p>

      <motion.div
        className="space-y-1"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <motion.div key={action.href} variants={item}>
              <Link
                href={action.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150 group"
                style={{
                  color: '#888888',
                  fontFamily: 'var(--font-body)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a1a1a'
                  e.currentTarget.style.color = '#ffffff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#888888'
                }}
              >
                <span
                  className="flex h-6 w-6 items-center justify-center rounded"
                  style={{ backgroundColor: '#1a1a1a' }}
                >
                  <Plus size={12} style={{ color: 'var(--color-accent)' }} strokeWidth={2.5} />
                </span>
                <Icon size={14} strokeWidth={1.8} />
                {action.label}
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
