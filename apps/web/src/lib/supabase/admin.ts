import { createClient } from '@supabase/supabase-js'
import type { Database } from '@gymos/types'

/**
 * Cliente con SERVICE_ROLE_KEY — bypasea RLS.
 * Usar EXCLUSIVAMENTE en Server Actions y Route Handlers del superadmin.
 * NUNCA importar en Client Components.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Variables de entorno de Supabase no configuradas')
  }

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
