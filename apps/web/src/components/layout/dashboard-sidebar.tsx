'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Dumbbell,
  ClipboardList,
  Users,
  UserCog,
  Settings,
} from 'lucide-react'
import type { UserRole } from '@gymos/types'

interface DashboardSidebarProps {
  gymName: string
  logoUrl: string | null
  role: UserRole
}

const NAV_ITEMS = [
  { label: 'Inicio',          href: '/dashboard',           icon: LayoutDashboard, roles: ['admin', 'profe'] },
  { label: 'Ejercicios',      href: '/dashboard/exercises', icon: Dumbbell,        roles: ['admin', 'profe'] },
  { label: 'Rutinas',         href: '/dashboard/routines',  icon: ClipboardList,   roles: ['admin', 'profe'] },
  { label: 'Clientes',        href: '/dashboard/clients',   icon: Users,           roles: ['admin', 'profe'] },
  { label: 'Profes',          href: '/dashboard/coaches',   icon: UserCog,         roles: ['admin'] },
  { label: 'Configuración',   href: '/dashboard/settings',  icon: Settings,        roles: ['admin'] },
]

export default function DashboardSidebar({ gymName, logoUrl, role }: DashboardSidebarProps) {
  const pathname = usePathname()
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role))

  return (
    <aside
      className="flex w-60 flex-col border-r"
      style={{
        backgroundColor: '#0d0d0d',
        borderColor: '#2a2a2a',
        minHeight: '100vh',
      }}
    >
      {/* Logo / gym name */}
      <div
        className="flex h-16 items-center gap-3 px-4 border-b"
        style={{ borderColor: '#2a2a2a' }}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt="Logo"
            className="h-8 w-8 rounded object-contain"
            style={{ background: '#1a1a1a', padding: 2 }}
          />
        ) : (
          <div
            className="flex h-8 w-8 items-center justify-center rounded text-xs font-bold"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: '#0a0a0a',
              fontFamily: 'var(--font-display)',
              fontSize: 16,
            }}
          >
            {gymName[0]}
          </div>
        )}
        <span
          className="truncate text-sm font-semibold tracking-wide"
          style={{ color: '#ffffff', fontFamily: 'var(--font-body)' }}
        >
          {gymName}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150"
              style={{
                backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
                color: isActive ? '#0a0a0a' : '#888888',
                fontFamily: 'var(--font-body)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#1a1a1a'
                  e.currentTarget.style.color = '#ffffff'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#888888'
                }
              }}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-4 py-3 border-t"
        style={{ borderColor: '#2a2a2a' }}
      >
        <span
          className="text-xs"
          style={{ color: '#444444', fontFamily: 'var(--font-mono)' }}
        >
          GymOS v1.0
        </span>
      </div>
    </aside>
  )
}
