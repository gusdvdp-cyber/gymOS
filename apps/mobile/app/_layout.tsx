import { Stack } from 'expo-router'
import { SessionProvider } from '@/context/session-context'
import { ThemeProvider } from '@/context/theme-context'
import { useNotificationListener } from '@/hooks/useNotifications'

const DARK_HEADER = {
  headerStyle: { backgroundColor: '#0a0a0a' },
  headerTintColor: '#ffffff',
  headerShadowVisible: false,
  headerTitleStyle: { fontWeight: '700' as const, fontSize: 16, letterSpacing: 0.5, color: '#ffffff' },
  headerBackTitleStyle: { color: '#888888' },
}

function NotificationSetup() {
  useNotificationListener()
  return null
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <ThemeProvider>
        <NotificationSetup />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen
            name="auth/forgot-password"
            options={{
              ...DARK_HEADER,
              headerShown: true,
              headerTitle: 'Recuperar contraseña',
              headerBackTitle: 'Volver',
            }}
          />
          <Stack.Screen
            name="sesion/[id]"
            options={{
              ...DARK_HEADER,
              headerShown: true,
              headerTitle: 'Entrenamiento',
              headerBackTitle: 'Salir',
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="ejercicio/[id]"
            options={{
              ...DARK_HEADER,
              headerShown: true,
              headerTitle: 'Ejercicio',
              headerBackTitle: 'Volver',
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="historial/[id]"
            options={{
              ...DARK_HEADER,
              headerShown: true,
              headerTitle: 'Detalle del entreno',
              headerBackTitle: 'Volver',
              presentation: 'card',
            }}
          />
        </Stack>
      </ThemeProvider>
    </SessionProvider>
  )
}
