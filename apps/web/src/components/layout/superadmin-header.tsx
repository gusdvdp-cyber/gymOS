import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/(auth)/login/actions'

export default async function SuperAdminHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{user?.email}</span>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            Salir
          </button>
        </form>
      </div>
    </header>
  )
}
