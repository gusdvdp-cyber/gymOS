import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/context/theme-context'
import { MUSCLE_GROUP_LABELS } from '@gymos/types'

interface SetLog { id: string; set_number: number; reps: number | null; weight_kg: number | null }
interface ExerciseGroup { exerciseId: string; name: string; muscleGroup: string; sets: SetLog[] }
interface SessionDetail {
  started_at: string
  finished_at: string | null
  routineName: string | null
  dayName: string | null
  isFree: boolean
  exercises: ExerciseGroup[]
}

export default function HistorialDetailScreen() {
  const { id: sessionId } = useLocalSearchParams<{ id: string }>()
  const { primaryColor } = useTheme()
  const [detail, setDetail] = useState<SessionDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) return
    async function load() {
      const [{ data: session }, { data: logs }] = await Promise.all([
        supabase.from('workout_sessions').select('started_at, finished_at, routine_id, routines(name), routine_days(name)').eq('id', sessionId).single(),
        supabase.from('workout_set_logs').select('id, exercise_id, set_number, reps, weight_kg, exercises(id, name, muscle_group)').eq('session_id', sessionId).order('exercise_id').order('set_number'),
      ])

      if (!session) { setLoading(false); return }

      const grouped: Record<string, ExerciseGroup> = {}
      for (const log of (logs ?? []) as any[]) {
        const exId = log.exercise_id
        if (!grouped[exId]) {
          grouped[exId] = { exerciseId: exId, name: log.exercises?.name ?? 'Ejercicio', muscleGroup: log.exercises?.muscle_group ?? '', sets: [] }
        }
        grouped[exId]!.sets.push({ id: log.id, set_number: log.set_number, reps: log.reps, weight_kg: log.weight_kg })
      }

      const s = session as any
      setDetail({
        started_at: s.started_at,
        finished_at: s.finished_at,
        routineName: s.routines?.name ?? null,
        dayName: s.routine_days?.name ?? null,
        isFree: !s.routine_id,
        exercises: Object.values(grouped),
      })
      setLoading(false)
    }
    load()
  }, [sessionId])

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return '—'
    const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000)
    return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`
  }

  const totalSets = detail?.exercises.reduce((acc, ex) => acc + ex.sets.length, 0) ?? 0
  const totalVolume = detail?.exercises.reduce((acc, ex) =>
    acc + ex.sets.reduce((s, log) => s + (log.reps && log.weight_kg ? log.reps * log.weight_kg : 0), 0), 0) ?? 0

  if (loading) {
    return (
      <View style={styles.centered}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    )
  }

  if (!detail) {
    return (
      <View style={styles.centered}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        <Text style={styles.errorText}>Sesión no encontrada</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header card */}
        <View style={[styles.headerCard, { borderLeftColor: primaryColor }]}>
          <Text style={styles.headerTitle}>
            {detail.isFree
              ? 'Entrenamiento libre'
              : `${detail.routineName ?? 'Rutina'}${detail.dayName ? ` · ${detail.dayName}` : ''}`}
          </Text>
          <Text style={styles.headerDate}>{formatDate(detail.started_at)}</Text>
          <Text style={styles.headerTime}>
            {formatTime(detail.started_at)}
            {detail.finished_at ? ` — ${formatTime(detail.finished_at)}` : ''}
          </Text>

          <View style={styles.quickStats}>
            {[
              { value: formatDuration(detail.started_at, detail.finished_at), label: 'Duración' },
              { value: detail.exercises.length, label: 'Ejercicios' },
              { value: totalSets, label: 'Series' },
              ...(totalVolume > 0 ? [{ value: totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}t` : `${Math.round(totalVolume)}kg`, label: 'Volumen' }] : []),
            ].map((stat, idx, arr) => (
              <View key={stat.label} style={{ flex: 1, flexDirection: 'row' }}>
                <View style={styles.quickStat}>
                  <Text style={[styles.quickStatValue, { color: primaryColor }]}>{stat.value}</Text>
                  <Text style={styles.quickStatLabel}>{stat.label.toUpperCase()}</Text>
                </View>
                {idx < arr.length - 1 && <View style={styles.statDivider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Exercise breakdown */}
        {detail.exercises.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No se registraron series en esta sesión.</Text>
          </View>
        ) : (
          detail.exercises.map((ex, idx) => (
            <View key={ex.exerciseId} style={styles.exCard}>
              <View style={styles.exHeader}>
                <View style={[styles.exNum, { backgroundColor: '#1a1a1a' }]}>
                  <Text style={[styles.exNumText, { color: primaryColor }]}>{idx + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.exName}>{ex.name}</Text>
                  <Text style={styles.exMuscle}>
                    {MUSCLE_GROUP_LABELS[ex.muscleGroup as keyof typeof MUSCLE_GROUP_LABELS] ?? ex.muscleGroup}
                  </Text>
                </View>
                <Text style={[styles.exSetCount, { color: primaryColor }]}>{ex.sets.length} series</Text>
              </View>

              <View style={styles.setsTable}>
                <View style={styles.setsHeaderRow}>
                  <Text style={[styles.setsCell, styles.setsCellNum, styles.setsCellHeader]}>Serie</Text>
                  <Text style={[styles.setsCell, styles.setsCellHeader]}>Reps</Text>
                  <Text style={[styles.setsCell, styles.setsCellHeader]}>Peso</Text>
                  <Text style={[styles.setsCell, styles.setsCellHeader]}>Volumen</Text>
                </View>
                {ex.sets.map((log) => (
                  <View key={log.id} style={styles.setsRow}>
                    <Text style={[styles.setsCell, styles.setsCellNum]}>{log.set_number}</Text>
                    <Text style={[styles.setsCell, { color: '#ffffff' }]}>{log.reps ?? '—'}</Text>
                    <Text style={[styles.setsCell, { color: primaryColor }]}>
                      {log.weight_kg != null ? `${log.weight_kg} kg` : '—'}
                    </Text>
                    <Text style={[styles.setsCell, { color: '#333333' }]}>
                      {log.reps && log.weight_kg ? `${Math.round(log.reps * log.weight_kg)} kg` : '—'}
                    </Text>
                  </View>
                ))}
              </View>

              {ex.sets.some((s) => s.weight_kg) && (
                <View style={styles.exSummary}>
                  <Text style={styles.exSummaryText}>
                    Peso máx:{' '}
                    <Text style={[styles.exSummaryBold, { color: primaryColor }]}>
                      {Math.max(...ex.sets.map((s) => s.weight_kg ?? 0))} kg
                    </Text>
                  </Text>
                  <Text style={styles.exSummaryText}>
                    Vol. total:{' '}
                    <Text style={styles.exSummaryBold}>
                      {Math.round(ex.sets.reduce((acc, s) => acc + (s.reps && s.weight_kg ? s.reps * s.weight_kg : 0), 0))} kg
                    </Text>
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' },
  scrollContent: { padding: 16, paddingBottom: 40 },

  headerCard: {
    backgroundColor: '#111111',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#ffffff' },
  headerDate: { fontSize: 13, color: '#888888', marginTop: 4, textTransform: 'capitalize' },
  headerTime: { fontSize: 11, color: '#444444', marginTop: 2, fontVariant: ['tabular-nums'] },

  quickStats: { flexDirection: 'row', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#1a1a1a' },
  quickStat: { flex: 1, alignItems: 'center' },
  quickStatValue: { fontSize: 18, fontWeight: '900' },
  quickStatLabel: { fontSize: 9, color: '#444444', marginTop: 4, letterSpacing: 1.5, fontWeight: '700' },
  statDivider: { width: 1, backgroundColor: '#1a1a1a' },

  exCard: { backgroundColor: '#111111', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#1a1a1a' },
  exHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  exNum: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  exNumText: { fontSize: 13, fontWeight: '900' },
  exName: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
  exMuscle: { fontSize: 11, color: '#444444', marginTop: 1, textTransform: 'uppercase', letterSpacing: 0.5 },
  exSetCount: { fontSize: 12, fontWeight: '800' },

  setsTable: { marginBottom: 8, backgroundColor: '#1a1a1a', borderRadius: 8, overflow: 'hidden' },
  setsHeaderRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  setsRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 6 },
  setsCell: { flex: 1, fontSize: 13, color: '#555555', textAlign: 'center' },
  setsCellNum: { flex: 0.6 },
  setsCellHeader: { fontWeight: '700', color: '#333333', fontSize: 11, letterSpacing: 0.5 },

  exSummary: { flexDirection: 'row', gap: 16, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#1a1a1a' },
  exSummaryText: { fontSize: 12, color: '#555555' },
  exSummaryBold: { fontWeight: '800', color: '#ffffff' },

  emptyWrap: { alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 14, color: '#444444' },
  errorText: { fontSize: 15, color: '#ef4444' },
})
