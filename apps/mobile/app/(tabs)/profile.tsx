import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Switch,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/context/theme-context'
import { useSession } from '@/context/session-context'
import type { ProfileRow } from '@gymos/types'
import {
  scheduleWorkoutReminder,
  cancelWorkoutReminder,
  getScheduledReminderTime,
} from '@/hooks/useNotifications'

export default function PerfilScreen() {
  const { primaryColor, gymName } = useTheme()
  const { session, signOut } = useSession()
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState<{ hour: number; minute: number }>({ hour: 9, minute: 0 })

  // Reminder presets
  const REMINDER_PRESETS = [
    { label: '7:00', hour: 7, minute: 0 },
    { label: '9:00', hour: 9, minute: 0 },
    { label: '12:00', hour: 12, minute: 0 },
    { label: '18:00', hour: 18, minute: 0 },
    { label: '20:00', hour: 20, minute: 0 },
  ]

  useEffect(() => {
    getScheduledReminderTime().then(time => {
      if (time) {
        setReminderEnabled(true)
        setReminderTime(time)
      }
    })
  }, [])

  async function toggleReminder(enabled: boolean) {
    setReminderEnabled(enabled)
    if (enabled) {
      await scheduleWorkoutReminder(reminderTime.hour, reminderTime.minute)
      Alert.alert('Recordatorio activado', `Te vamos a avisar todos los días a las ${String(reminderTime.hour).padStart(2, '0')}:${String(reminderTime.minute).padStart(2, '0')}.`)
    } else {
      await cancelWorkoutReminder()
    }
  }

  async function changeReminderTime(hour: number, minute: number) {
    setReminderTime({ hour, minute })
    if (reminderEnabled) {
      await scheduleWorkoutReminder(hour, minute)
    }
  }

  const load = useCallback(async () => {
    if (!session) return
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    setProfile(data as ProfileRow | null)
    setLoading(false)
  }, [session])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        <ActivityIndicator size="large" color={primaryColor} />
      </SafeAreaView>
    )
  }

  const initials = profile
    ? `${profile.first_name[0] ?? ''}${profile.last_name[0] ?? ''}`.toUpperCase()
    : '?'

  const fullName = profile ? `${profile.first_name} ${profile.last_name}` : '—'

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: '#1a1a1a', borderColor: primaryColor }]}>
            <Text style={[styles.avatarText, { color: primaryColor }]}>{initials}</Text>
          </View>
          <Text style={styles.fullName}>{fullName}</Text>
          <Text style={styles.email}>{session?.user.email}</Text>
          <View style={[styles.gymBadge, { borderColor: primaryColor }]}>
            <Text style={[styles.gymBadgeText, { color: primaryColor }]}>{gymName.toUpperCase()}</Text>
          </View>
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>INFORMACIÓN</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nombre</Text>
            <Text style={styles.infoValue}>{fullName}</Text>
          </View>
          {profile?.phone ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Teléfono</Text>
              <Text style={styles.infoValue}>{profile.phone}</Text>
            </View>
          ) : null}
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Gimnasio</Text>
            <Text style={styles.infoValue}>{gymName}</Text>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.notifCard}>
          <Text style={styles.infoCardTitle}>RECORDATORIOS</Text>
          <View style={[styles.infoRow, { borderBottomWidth: reminderEnabled ? 1 : 0 }]}>
            <Text style={styles.infoLabel}>Recordatorio diario</Text>
            <Switch
              value={reminderEnabled}
              onValueChange={toggleReminder}
              trackColor={{ false: '#2a2a2a', true: primaryColor }}
              thumbColor={reminderEnabled ? '#0a0a0a' : '#444444'}
            />
          </View>
          {reminderEnabled && (
            <View style={styles.presetsRow}>
              {REMINDER_PRESETS.map(p => (
                <TouchableOpacity
                  key={p.label}
                  style={[
                    styles.presetChip,
                    reminderTime.hour === p.hour && reminderTime.minute === p.minute && { backgroundColor: primaryColor, borderColor: primaryColor },
                  ]}
                  onPress={() => changeReminderTime(p.hour, p.minute)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.presetChipText,
                    reminderTime.hour === p.hour && reminderTime.minute === p.minute && { color: '#0a0a0a' },
                  ]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Sign out */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={signOut}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutBtnText}>CERRAR SESIÓN</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' },
  scrollContent: { padding: 24, paddingBottom: 48 },

  avatarSection: { alignItems: 'center', marginBottom: 32, paddingTop: 8 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
  },
  avatarText: { fontSize: 28, fontWeight: '900', letterSpacing: 2 },
  fullName: { fontSize: 22, fontWeight: '900', color: '#ffffff', letterSpacing: 1 },
  email: { fontSize: 13, color: '#444444', marginTop: 4 },
  gymBadge: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  gymBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 2 },

  infoCard: {
    backgroundColor: '#111111',
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    overflow: 'hidden',
  },
  infoCardTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#444444',
    letterSpacing: 2,
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  infoLabel: { fontSize: 13, color: '#444444' },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#ffffff' },

  notifCard: {
    backgroundColor: '#111111',
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    overflow: 'hidden',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 14,
  },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    backgroundColor: '#1a1a1a',
  },
  presetChipText: { fontSize: 13, fontWeight: '700', color: '#555555' },

  signOutBtn: {
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutBtnText: { fontSize: 12, fontWeight: '800', color: '#ef4444', letterSpacing: 1.5 },
})
