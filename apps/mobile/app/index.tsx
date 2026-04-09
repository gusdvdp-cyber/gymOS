import { Redirect } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { useSession } from '@/context/session-context'

export default function Index() {
  const { session, loading } = useSession()

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    )
  }

  if (!session) {
    return <Redirect href="/auth/login" />
  }

  return <Redirect href="/(tabs)" />
}
