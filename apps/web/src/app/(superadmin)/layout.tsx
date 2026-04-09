import SuperAdminSidebar from '@/components/layout/superadmin-sidebar'
import SuperAdminHeader from '@/components/layout/superadmin-header'

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <SuperAdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <SuperAdminHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
