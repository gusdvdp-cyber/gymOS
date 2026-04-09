import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/context/theme-context'
import { useSession } from '@/context/session-context'
import type { WorkoutSessionRow } from '@gymos/types'

interface SessionWithCount extends WorkoutSessionRow {
  setCount: number
  exerciseCount: number
  routineName?: string
  dayName?: string
}

export default function ProgresoScreen() {
  const { primaryColor } = useTheme()
  const { session } = useSession()
  const router = useRouter()
  const [sessions, setSessions] = useState<SessionWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalSessions: 0, totalSets: 0, thisWeek: 0 })

  const load = useCallback(async () => {
    if (!session) return
    setLoading(true)

    const { data: sessionsData } = await supabase
      .from('workout_sessions')
      .select(`*, routines(name), routine_days(name), workout_set_logs(id, exercise_id)`)
      .eq('client_id', session.user.id)
      .not('finished_at', 'is', null)
      .order('started_at', { ascending: false })
      .limit(30)

    const enriched: SessionWithCount[] = ((sessionsData ?? []) as any[]).map(s => {
      const logs = s.workout_set_logs ?? []
      return {
        ...s,
        setCount: logs.length,
        exerciseCount: new Set(logs.map((l: any) => l.exercise_id)).size,
        routineName: s.routines?.name,
        dayName: s.routine_days?.name,
      }
    })

    setSessions(enriched)

    const totalSets = enriched.reduce((acc, s) => acc + s.setCount, 0)
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
    const thisWeek = enriched.filter(s => new Date(s.started_at) >= weekAgo).length
    setStats({ totalSessions: enriched.length, totalSets, thisWeek })
    setLoading(false)
  }, [session])

  useEffect(() => { load() }, [load])

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' })

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return '-'
    const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000)
    return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        <ActivityIndicator size="large" color={primaryColor} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PROGRESO</Text>
        <Text style={styles.headerSub}>Historial de entrenamientos</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { value: stats.totalSessions, label: 'Entrenos' },
            { value: stats.thisWeek, label: 'Esta semana' },
            { value: stats.totalSets, label: 'Series' },
          ].map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: primaryColor }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label.toUpperCase()}</Text>
            </View>
          ))}
        </View>

        {sessions.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>Sin entrenamientos</Text>
            <Text style={styles.emptySub}>
              Completá tu primer entrenamiento para ver tu progreso aquí.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>HISTORIAL</Text>
            {sessions.map(s => (
              <TouchableOpacity
                key={s.id}
                style={styles.sessionCard}
                onPress={() => router.push(`/historial/${s.id}`)}
                activeOpacity={0.75}
              >
                <View style={[styles.sessionAccent, { backgroundColor: primaryColor }]} />
                <View style={styles.sessionInfo}>
                  <View style={styles.sessionTopRow}>
                    <Text style={styles.sessionDate}>{formatDate(s.started_at)}</Text>
                    <Text style={[styles.sessionDuration, { color: primaryColor }]}>
                      {formatDuration(s.started_at, s.finished_at)}
                    </Text>
                  </View>
                  <Text style={styles.sessionRoutine}>
                    {s.routineName
                      ? `${s.routineName}${s.dayName ? ` · ${s.dayName}` : ''}`
                      : 'Entrenamiento libre'}
                  </Text>
                  <Text style={styles.sessionMeta}>
                    {s.exerciseCount} ejerc. · {s.setCount} series
                  </Text>
                </View>
                <Text style={styles.sessionChevron}>›</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#ffffff', letterSpacing: 2 },
  headerSub: { fontSize: 12, color: '#444444', marginTop: 4, letterSpacing: 0.5 },

  scrollContent: { padding: 16, paddingBottom: 40 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  statValue: { fontSize: 28, fontWeight: '900' },
  statLabel: { fontSize: 9, color: '#444444', marginTop: 6, letterSpacing: 1.5, fontWeight: '700' },

  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#444444',
    letterSpacing: 2,
    marginBottom: 12,
  },

  sessionCard: {
    flexDirection: 'row',
    backgroundColor: '#111111',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    alignItems: 'center',
  },
  sessionAccent: { width: 3, alignSelf: 'stretch' },
  sessionInfo: { flex: 1, paddingHorizontal: 14, paddingVertical: 12 },
  sessionTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sessionDate: { fontSize: 11, color: '#444444', textTransform: 'capitalize', letterSpacing: 0.3 },
  sessionDuration: { fontSize: 13, fontWeight: '800', fontVariant: ['tabular-nums'] },
  sessionRoutine: { fontSize: 14, fontWeight: '700', color: '#ffffff', marginTop: 3 },
  sessionMeta: { fontSize: 11, color: '#444444', marginTop: 4, letterSpacing: 0.3 },
  sessionChevron: { fontSize: 20, color: '#2a2a2a', paddingRight: 14 },

  emptyWrap: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#ffffff', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#444444', textAlign: 'center', lineHeight: 22 },
})
