import Link from 'next/link'

const NAV_ITEMS = [
  { label: 'Gimnasios', href: '/superadmin/gyms', icon: '🏋️' },
]

export default function SuperAdminSidebar() {
  return (
    <aside className="flex w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center px-6 border-b border-gray-700">
        <span className="text-xl font-bold tracking-tight">GymOS</span>
        <span className="ml-2 rounded bg-blue-600 px-1.5 py-0.5 text-xs font-medium">SA</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-gray-700 px-4 py-4">
        <p className="text-xs text-gray-500">Super Admin</p>
      </div>
    </aside>
  )
}
