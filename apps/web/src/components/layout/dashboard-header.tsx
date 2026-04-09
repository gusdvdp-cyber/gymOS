'use client'

import { signOut } from '@/app/(auth)/login/actions'
import { LogOut } from 'lucide-react'
import type { ProfileRow } from '@gymos/types'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  profe: 'Profe',
  cliente: 'Cliente',
  superadmin: 'SuperAdmin',
}

export default function DashboardHeader({
  profile,
  gymName,
}: {
  profile: ProfileRow
  gymName: string
}) {
  return (
    <header
      className="flex h-16 items-center justify-between px-6 border-b"
      style={{
        backgroundColor: '#0a0a0a',
        borderColor: '#2a2a2a',
        borderTopWidth: 2,
        borderTopStyle: 'solid',
        borderTopColor: 'var(--color-accent)',
      }}
    >
      <span
        className="text-sm tracking-widest uppercase"
        style={{ color: '#444444', fontFamily: 'var(--font-mono)', fontSize: 11 }}
      >
        {gymName}
      </span>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p
            className="text-sm font-semibold"
            style={{ color: '#ffffff', fontFamily: 'var(--font-body)' }}
          >
            {profile.first_name} {profile.last_name}
          </p>
          <p
            className="text-xs"
            style={{ color: '#888888', fontFamily: 'var(--font-mono)' }}
          >
            {ROLE_LABELS[profile.role] ?? profile.role}
          </p>
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors"
            style={{
              border: '1px solid #2a2a2a',
              background: 'transparent',
              color: '#888888',
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#ff4444'
              e.currentTarget.style.color = '#ff4444'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2a2a2a'
              e.currentTarget.style.color = '#888888'
            }}
          >
            <LogOut size={14} />
            Salir
          </button>
        </form>
      </div>
    </header>
  )
}
