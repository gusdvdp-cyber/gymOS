import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useMyRoutine } from '@/hooks/useMyRoutine'
import { useTheme } from '@/context/theme-context'
import { useSession } from '@/context/session-context'
import { supabase } from '@/lib/supabase'
import { MUSCLE_GROUP_LABELS } from '@gymos/types'
import type { RoutineDayWithExercises } from '@gymos/types'
import { useDailyMotivation } from '@/hooks/useMotivation'

export default function MiRutinaScreen() {
  const { routine, loading, error, refresh } = useMyRoutine()
  const { primaryColor, gymName } = useTheme()
  const { session } = useSession()
  const router = useRouter()
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [starting, setStarting] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(0)

  useEffect(() => {
    if (!session || !routine) return
    supabase
      .from('workout_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', session.user.id)
      .eq('routine_id', routine.id)
      .not('finished_at', 'is', null)
      .then(({ count }) => setCompletedSessions(count ?? 0))
  }, [session, routine])

  const daysInCycle = routine?.routine_days?.length ?? 1
  const currentCycle = Math.floor(completedSessions / daysInCycle) + 1
  const weeksInfo = routine
    ? { current: currentCycle, total: routine.total_weeks ?? null }
    : null

  const motivation = useDailyMotivation()

  async function handleStart(day: RoutineDayWithExercises) {
    if (!session || !routine) return
    setStarting(true)
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('gym_id')
        .eq('id', session.user.id)
        .single()

      if (!profile?.gym_id) throw new Error('Sin gimnasio')

      const { data: sessionData, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          gym_id: profile.gym_id,
          client_id: session.user.id,
          routine_id: routine.id,
          routine_day_id: day.id,
        })
        .select('id')
        .single()

      if (sessionError) throw sessionError
      router.push(`/sesion/${sessionData.id}`)
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo iniciar el entrenamiento')
    } finally {
      setStarting(false)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        <ActivityIndicator size="large" color={primaryColor} />
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={refresh} style={[styles.retryBtn, { borderColor: primaryColor }]}>
          <Text style={[styles.retryBtnText, { color: primaryColor }]}>Reintentar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  if (!routine) {
    return (
      <SafeAreaView style={styles.centered}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        <View style={[styles.emptyIcon, { borderColor: '#2a2a2a' }]}>
          <Text style={{ fontSize: 28 }}>🏋️</Text>
        </View>
        <Text style={styles.emptyTitle}>Sin rutina asignada</Text>
        <Text style={styles.emptySubtitle}>
          Tu entrenador aún no te asignó una rutina.{'\n'}Consultale para comenzar.
        </Text>
      </SafeAreaView>
    )
  }

  const selectedDay = routine.routine_days[selectedDayIndex]

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerGym, { color: primaryColor }]}>{gymName.toUpperCase()}</Text>
        <Text style={styles.headerTitle}>{routine.name.toUpperCase()}</Text>
        <View style={styles.headerMeta}>
          <View style={[styles.headerBadge, { borderColor: '#2a2a2a' }]}>
            <Text style={styles.headerBadgeText}>{routine.days_per_week} días/sem</Text>
          </View>
          {weeksInfo && (
            <View style={[styles.headerBadge, { borderColor: '#2a2a2a' }]}>
              <Text style={[styles.headerBadgeText, { color: primaryColor }]}>
                {weeksInfo.total
                  ? `Sem ${weeksInfo.current}/${weeksInfo.total}`
                  : `Semana ${weeksInfo.current}`}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Day tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dayTabsScroll}
        contentContainerStyle={styles.dayTabsContent}
      >
        {routine.routine_days.map((day, idx) => (
          <TouchableOpacity
            key={day.id}
            style={[
              styles.dayTab,
              idx === selectedDayIndex && { backgroundColor: primaryColor, borderColor: primaryColor },
            ]}
            onPress={() => setSelectedDayIndex(idx)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.dayTabText,
                idx === selectedDayIndex && styles.dayTabTextActive,
              ]}
            >
              Día {day.day_number}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Exercises */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentPad}>
        {/* Daily motivation card */}
        <View style={[styles.motivationCard, { borderLeftColor: primaryColor }]}>
          <Text style={[styles.motivationLabel, { color: primaryColor }]}>FRASE DEL DÍA</Text>
          <Text style={styles.motivationText}>"{motivation.text}"</Text>
          {motivation.author && (
            <Text style={styles.motivationAuthor}>— {motivation.author}</Text>
          )}
        </View>

        {selectedDay && (
          <>
            <View style={styles.dayHeader}>
              <Text style={styles.dayName}>{selectedDay.name.toUpperCase()}</Text>
              <Text style={styles.dayExCount}>{selectedDay.routine_day_exercises.length} ejercicios</Text>
            </View>

            {selectedDay.routine_day_exercises.map((rde, idx) => (
              <View key={rde.id} style={styles.exerciseCard}>
                <View style={[styles.exerciseNum, { backgroundColor: '#1a1a1a' }]}>
                  <Text style={[styles.exerciseNumText, { color: primaryColor }]}>{idx + 1}</Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{rde.exercises.name}</Text>
                  <Text style={styles.exerciseMuscle}>
                    {MUSCLE_GROUP_LABELS[rde.exercises.muscle_group] ?? rde.exercises.muscle_group}
                  </Text>
                  <Text style={[styles.exerciseSets, { color: primaryColor }]}>
                    {rde.sets} × {rde.reps} reps
                    {rde.suggested_weight ? (
                      <Text style={styles.exerciseSetsSecondary}>  ·  {rde.suggested_weight} kg sugeridos</Text>
                    ) : null}
                  </Text>
                  {rde.notes ? (
                    <Text style={styles.exerciseNotes}>{rde.notes}</Text>
                  ) : null}
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.startBtn, { backgroundColor: primaryColor }, starting && styles.startBtnDisabled]}
              onPress={() => handleStart(selectedDay)}
              disabled={starting}
              activeOpacity={0.85}
            >
              <Text style={styles.startBtnText}>
                {starting ? 'INICIANDO...' : 'INICIAR ENTRENAMIENTO'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#0a0a0a' },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerGym: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.5,
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
    lineHeight: 30,
  },
  headerMeta: { flexDirection: 'row', gap: 8, marginTop: 10 },
  headerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  headerBadgeText: { fontSize: 11, fontWeight: '600', color: '#666666', letterSpacing: 0.5 },

  dayTabsScroll: { backgroundColor: '#0a0a0a', maxHeight: 52, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  dayTabsContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  dayTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    backgroundColor: '#111111',
  },
  dayTabText: { fontSize: 12, fontWeight: '600', color: '#444444', letterSpacing: 0.5 },
  dayTabTextActive: { color: '#0a0a0a', fontWeight: '800' },

  content: { flex: 1 },
  contentPad: { padding: 16, paddingBottom: 40 },

  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  dayName: { fontSize: 14, fontWeight: '900', color: '#ffffff', letterSpacing: 2 },
  dayExCount: { fontSize: 11, color: '#444444', letterSpacing: 0.5 },

  exerciseCard: {
    flexDirection: 'row',
    backgroundColor: '#111111',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  exerciseNum: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseNumText: { fontSize: 16, fontWeight: '900' },
  exerciseInfo: { flex: 1, padding: 14 },
  exerciseName: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
  exerciseMuscle: { fontSize: 11, color: '#444444', marginTop: 2, letterSpacing: 0.5, textTransform: 'uppercase' },
  exerciseSets: { fontSize: 13, fontWeight: '700', marginTop: 8 },
  exerciseSetsSecondary: { color: '#555555', fontWeight: '400' },
  exerciseNotes: { fontSize: 12, color: '#555555', marginTop: 6, fontStyle: 'italic' },

  startBtn: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 8,
  },
  startBtnDisabled: { opacity: 0.5 },
  startBtnText: { color: '#0a0a0a', fontSize: 14, fontWeight: '900', letterSpacing: 2 },

  errorText: { fontSize: 14, color: '#ef4444', textAlign: 'center', marginBottom: 12 },
  retryBtn: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  retryBtnText: { fontSize: 14, fontWeight: '700' },

  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#ffffff', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#444444', textAlign: 'center', lineHeight: 22 },

  motivationCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  motivationLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 2, marginBottom: 8 },
  motivationText: { fontSize: 14, color: '#cccccc', lineHeight: 22, fontStyle: 'italic' },
  motivationAuthor: { fontSize: 11, color: '#444444', marginTop: 8, fontWeight: '600' },
})
