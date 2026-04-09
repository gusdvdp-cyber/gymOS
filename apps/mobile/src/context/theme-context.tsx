import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useSession } from './session-context'

interface ThemeContextValue {
  primaryColor: string
  secondaryColor: string
  gymName: string
  logoUrl: string | null
  loading: boolean
}

const DEFAULT_THEME: ThemeContextValue = {
  primaryColor: '#e8ff47',
  secondaryColor: '#0d0d0d',
  gymName: 'GymOS',
  logoUrl: null,
  loading: true,
}

const ThemeContext = createContext<ThemeContextValue>(DEFAULT_THEME)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { session } = useSession()
  const [theme, setTheme] = useState<ThemeContextValue>(DEFAULT_THEME)

  useEffect(() => {
    if (!session) {
      setTheme({ ...DEFAULT_THEME, loading: false })
      return
    }

    async function loadTheme() {
      const { data: profile } = await supabase
        .from('profiles')
        .select('gym_id')
        .eq('id', session!.user.id)
        .single()

      if (!profile?.gym_id) {
        setTheme({ ...DEFAULT_THEME, loading: false })
        return
      }

      const { data: gymData } = await supabase
        .from('gyms')
        .select('name, gym_branding(primary_color, secondary_color, logo_url)')
        .eq('id', profile.gym_id)
        .single()

      if (!gymData) {
        setTheme({ ...DEFAULT_THEME, loading: false })
        return
      }

      const branding = (gymData as any).gym_branding ?? {}
      setTheme({
        primaryColor: branding.primary_color ?? '#e8ff47',
        secondaryColor: branding.secondary_color ?? '#0d0d0d',
        gymName: gymData.name,
        logoUrl: branding.logo_url ?? null,
        loading: false,
      })
    }

    loadTheme()
  }, [session])

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
