import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useSession } from '@/context/session-context'
import type { ProfileRow } from '@gymos/types'

export function useProfile() {
  const { session } = useSession()
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      setProfile(null)
      setLoading(false)
      return
    }

    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        setProfile(data as ProfileRow | null)
        setLoading(false)
      })
  }, [session])

  return { profile, loading }
}
