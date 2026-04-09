import { useCallback, useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Modal,
  StatusBar,
  Animated,
} from 'react-native'
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/context/theme-context'
import { MUSCLE_GROUP_LABELS } from '@gymos/types'
import type { RoutineDayExerciseWithExercise, WorkoutSetLogRow, ExerciseRow } from '@gymos/types'

interface PrescribedExercise extends RoutineDayExerciseWithExercise {
  loggedSets: WorkoutSetLogRow[]
}
interface FreeExercise {
  exercise_id: string
  exerciseName: string
  muscleGroup: string
  loggedSets: WorkoutSetLogRow[]
}

export default function SesionScreen() {
  const { id: sessionId } = useLocalSearchParams<{ id: string }>()
  const { primaryColor } = useTheme()
  const router = useRouter()
  const navigation = useNavigation()

  const [isFree, setIsFree] = useState(false)
  const [gymId, setGymId] = useState<string | null>(null)
  const [prescribed, setPrescribed] = useState<PrescribedExercise[]>([])
  const [freeExercises, setFreeExercises] = useState<FreeExercise[]>([])
  const [loading, setLoading] = useState(true)
  const [finishing, setFinishing] = useState(false)
  const [addingSet, setAddingSet] = useState<Record<string, { reps: string; weight: string }>>({})
  const [showPicker, setShowPicker] = useState(false)
  const [allExercises, setAllExercises] = useState<ExerciseRow[]>([])
  const [pickerSearch, setPickerSearch] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Rest timer
  const REST_PRESETS = [30, 60, 90, 120]
  const DEFAULT_REST = 60
  const [restLeft, setRestLeft] = useState(0)
  const [restTotal, setRestTotal] = useState(DEFAULT_REST)
  const [restActive, setRestActive] = useState(false)
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const restProgress = useRef(new Animated.Value(1)).current

  useEffect(() => {
    intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (restIntervalRef.current) clearInterval(restIntervalRef.current)
    }
  }, [])

  function startRestTimer(seconds: number) {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current)
    setRestTotal(seconds)
    setRestLeft(seconds)
    setRestActive(true)
    restProgress.setValue(1)
    Animated.timing(restProgress, {
      toValue: 0,
      duration: seconds * 1000,
      useNativeDriver: false,
    }).start()
    restIntervalRef.current = setInterval(() => {
      setRestLeft(prev => {
        if (prev <= 1) {
          clearInterval(restIntervalRef.current!)
          setRestActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  function skipRest() {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current)
    restProgress.stopAnimation()
    setRestActive(false)
    setRestLeft(0)
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const loadSession = useCallback(async () => {
    if (!sessionId) return
    const { data: session } = await supabase
      .from('workout_sessions')
      .select('routine_day_id, gym_id')
      .eq('id', sessionId)
      .single()

    if (!session) { setLoading(false); return }
    setGymId(session.gym_id)

    if (session.routine_day_id) {
      const { data: rdeData } = await supabase
        .from('routine_day_exercises')
        .select('*, exercises(id, name, muscle_group, thumbnail_url, video_url, description)')
        .eq('routine_day_id', session.routine_day_id)
        .order('sort_order')

      const { data: logsData } = await supabase
        .from('workout_set_logs')
        .select('*')
        .eq('session_id', sessionId)
        .order('logged_at')

      const logs = (logsData ?? []) as WorkoutSetLogRow[]
      const rdes = (rdeData ?? []) as RoutineDayExerciseWithExercise[]
      setPrescribed(rdes.map(rde => ({ ...rde, loggedSets: logs.filter(l => l.exercise_id === rde.exercise_id) })))
      setIsFree(false)
    } else {
      setIsFree(true)
      const { data: logsData } = await supabase
        .from('workout_set_logs')
        .select('*, exercises(id, name, muscle_group)')
        .eq('session_id', sessionId)
        .order('logged_at')

      const logs = (logsData ?? []) as any[]
      const byEx: Record<string, FreeExercise> = {}
      for (const log of logs) {
        if (!byEx[log.exercise_id]) {
          byEx[log.exercise_id] = { exercise_id: log.exercise_id, exerciseName: log.exercises?.name ?? 'Ejercicio', muscleGroup: log.exercises?.muscle_group ?? '', loggedSets: [] }
        }
        byEx[log.exercise_id]!.loggedSets.push(log as WorkoutSetLogRow)
      }
      setFreeExercises(Object.values(byEx))

      const { data: exData } = await supabase.from('exercises').select('*').eq('is_active', true).order('name')
      setAllExercises((exData ?? []) as ExerciseRow[])
    }
    setLoading(false)
  }, [sessionId])

  useEffect(() => { loadSession() }, [loadSession])

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (finishing) return
      e.preventDefault()
      Alert.alert(
        '¿Salir del entrenamiento?',
        'El entrenamiento quedará guardado sin finalizar.',
        [
          { text: 'Seguir entrenando', style: 'cancel' },
          { text: 'Salir', style: 'destructive', onPress: () => navigation.dispatch(e.data.action) },
        ]
      )
    })
    return unsubscribe
  }, [navigation, finishing])

  async function handleLogSet(exerciseId: string) {
    const state = addingSet[exerciseId]
    if (!state || !gymId) return
    const reps = parseInt(state.reps)
    if (isNaN(reps) || reps <= 0) { Alert.alert('Error', 'Ingresá las reps'); return }
    const weight = state.weight ? parseFloat(state.weight) : null
    const currentSets = isFree
      ? (freeExercises.find(e => e.exercise_id === exerciseId)?.loggedSets.length ?? 0)
      : (prescribed.find(p => p.exercise_id === exerciseId)?.loggedSets.length ?? 0)

    const { data: logData, error } = await supabase
      .from('workout_set_logs')
      .insert({ gym_id: gymId, session_id: sessionId, exercise_id: exerciseId, set_number: currentSets + 1, reps, weight_kg: weight })
      .select('*')
      .single()

    if (error) { Alert.alert('Error', error.message); return }
    const newLog = logData as WorkoutSetLogRow

    // Start rest timer after every logged set
    startRestTimer(DEFAULT_REST)

    if (isFree) {
      setFreeExercises(prev => {
        const exists = prev.find(e => e.exercise_id === exerciseId)
        if (exists) return prev.map(e => e.exercise_id === exerciseId ? { ...e, loggedSets: [...e.loggedSets, newLog] } : e)
        return prev
      })
    } else {
      setPrescribed(prev => prev.map(p => p.exercise_id === exerciseId ? { ...p, loggedSets: [...p.loggedSets, newLog] } : p))
    }

    setAddingSet(prev => { const next = { ...prev }; delete next[exerciseId]; return next })
  }

  function addFreeExercise(exercise: ExerciseRow) {
    if (!freeExercises.some(e => e.exercise_id === exercise.id)) {
      setFreeExercises(prev => [...prev, { exercise_id: exercise.id, exerciseName: exercise.name, muscleGroup: exercise.muscle_group, loggedSets: [] }])
    }
    setShowPicker(false)
    setPickerSearch('')
  }

  async function handleFinish() {
    Alert.alert(
      'Finalizar entrenamiento',
      '¿Querés guardar y cerrar este entrenamiento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          onPress: async () => {
            setFinishing(true)
            await supabase.from('workout_sessions').update({ finished_at: new Date().toISOString() }).eq('id', sessionId)
            router.back()
          },
        },
      ]
    )
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    )
  }

  const exerciseList = isFree
    ? freeExercises.map(e => ({ id: e.exercise_id, exerciseId: e.exercise_id, name: e.exerciseName, muscle: e.muscleGroup, loggedSets: e.loggedSets, prescribed: null as { sets: number; reps: string; weight: number | null } | null }))
    : prescribed.map(p => ({ id: p.id, exerciseId: p.exercise_id, name: p.exercises.name, muscle: p.exercises.muscle_group, loggedSets: p.loggedSets, prescribed: { sets: p.sets, reps: p.reps, weight: p.suggested_weight } }))

  const pickerFiltered = allExercises.filter(e => e.name.toLowerCase().includes(pickerSearch.toLowerCase()))

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={80}>
        <SafeAreaView style={styles.container} edges={['bottom']}>
          {/* Elapsed timer */}
          <View style={[styles.timerBar, { backgroundColor: '#111111', borderBottomColor: primaryColor }]}>
            <Text style={[styles.timerText, { color: primaryColor }]}>{formatTime(elapsed)}</Text>
            <Text style={styles.timerLabel}>{isFree ? 'LIBRE' : 'EN CURSO'}</Text>
          </View>

          {/* Rest timer panel */}
          {restActive && (
            <View style={styles.restPanel}>
              <View style={styles.restTop}>
                <View style={styles.restLeft}>
                  <Text style={styles.restLabel}>DESCANSO</Text>
                  <Text style={[styles.restCount, { color: primaryColor }]}>
                    {restLeft}
                    <Text style={styles.restCountUnit}>s</Text>
                  </Text>
                </View>
                <View style={styles.restRight}>
                  <View style={styles.restPresets}>
                    {REST_PRESETS.map(p => (
                      <TouchableOpacity
                        key={p}
                        onPress={() => startRestTimer(p)}
                        style={[styles.restPresetBtn, restTotal === p && { backgroundColor: primaryColor }]}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.restPresetText, restTotal === p && { color: '#0a0a0a' }]}>
                          {p}s
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity onPress={skipRest} style={styles.restSkipBtn} activeOpacity={0.8}>
                    <Text style={[styles.restSkipText, { color: primaryColor }]}>SALTAR ›</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {/* Progress bar */}
              <View style={styles.restBarBg}>
                <Animated.View
                  style={[
                    styles.restBarFill,
                    { backgroundColor: primaryColor, width: restProgress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
                  ]}
                />
              </View>
            </View>
          )}

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            {exerciseList.map((ex) => {
              const isAdding = !!addingSet[ex.exerciseId]
              return (
                <View key={ex.id} style={styles.exCard}>
                  <View style={styles.exHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.exName}>{ex.name}</Text>
                      <Text style={styles.exMuscle}>
                        {MUSCLE_GROUP_LABELS[ex.muscle as keyof typeof MUSCLE_GROUP_LABELS] ?? ex.muscle}
                      </Text>
                      {ex.prescribed && (
                        <Text style={[styles.exPrescribed, { color: primaryColor }]}>
                          {ex.prescribed.sets} × {ex.prescribed.reps}
                          {ex.prescribed.weight ? ` · ${ex.prescribed.weight} kg` : ''}
                        </Text>
                      )}
                    </View>
                    <Text style={[styles.setCount, { color: ex.loggedSets.length > 0 ? primaryColor : '#333333' }]}>
                      {ex.loggedSets.length} series
                    </Text>
                  </View>

                  {ex.loggedSets.length > 0 && (
                    <View style={styles.setsTable}>
                      <View style={styles.setsHeaderRow}>
                        <Text style={[styles.setsCell, styles.setsCellHeader]}>Serie</Text>
                        <Text style={[styles.setsCell, styles.setsCellHeader]}>Reps</Text>
                        <Text style={[styles.setsCell, styles.setsCellHeader]}>Peso</Text>
                      </View>
                      {ex.loggedSets.map(log => (
                        <View key={log.id} style={styles.setsRow}>
                          <Text style={styles.setsCell}>{log.set_number}</Text>
                          <Text style={[styles.setsCell, { color: '#ffffff' }]}>{log.reps ?? '-'}</Text>
                          <Text style={[styles.setsCell, { color: primaryColor }]}>
                            {log.weight_kg != null ? `${log.weight_kg} kg` : '-'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {isAdding ? (
                    <View style={styles.addSetRow}>
                      <TextInput
                        style={styles.setInput}
                        placeholder="Reps"
                        placeholderTextColor="#333333"
                        keyboardType="number-pad"
                        value={addingSet[ex.exerciseId]?.reps ?? ''}
                        onChangeText={v => setAddingSet(prev => ({ ...prev, [ex.exerciseId]: { ...prev[ex.exerciseId]!, reps: v } }))}
                        selectionColor={primaryColor}
                      />
                      <TextInput
                        style={styles.setInput}
                        placeholder="Kg (opt.)"
                        placeholderTextColor="#333333"
                        keyboardType="decimal-pad"
                        value={addingSet[ex.exerciseId]?.weight ?? ''}
                        onChangeText={v => setAddingSet(prev => ({ ...prev, [ex.exerciseId]: { ...prev[ex.exerciseId]!, weight: v } }))}
                        selectionColor={primaryColor}
                      />
                      <TouchableOpacity
                        style={[styles.confirmBtn, { backgroundColor: primaryColor }]}
                        onPress={() => handleLogSet(ex.exerciseId)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.confirmBtnText}>✓</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => setAddingSet(prev => { const next = { ...prev }; delete next[ex.exerciseId]; return next })}
                      >
                        <Text style={styles.cancelBtnText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.addSetBtn, { borderColor: primaryColor }]}
                      onPress={() => setAddingSet(prev => ({ ...prev, [ex.exerciseId]: { reps: '', weight: '' } }))}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.addSetBtnText, { color: primaryColor }]}>+ SERIE</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )
            })}

            {isFree && (
              <TouchableOpacity
                style={[styles.addExBtn, { borderColor: '#2a2a2a' }]}
                onPress={() => setShowPicker(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.addExBtnText}>+ AGREGAR EJERCICIO</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.finishBtn, finishing && { opacity: 0.5 }]}
              onPress={handleFinish}
              disabled={finishing}
              activeOpacity={0.85}
            >
              <Text style={styles.finishBtnText}>
                {finishing ? 'GUARDANDO...' : 'FINALIZAR ENTRENAMIENTO'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>

      {/* Exercise picker modal */}
      <Modal visible={showPicker} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>ELEGÍ UN EJERCICIO</Text>
            <TouchableOpacity onPress={() => { setShowPicker(false); setPickerSearch('') }} activeOpacity={0.7}>
              <Text style={styles.pickerClose}>Cerrar</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.pickerSearch}
            placeholder="Buscar..."
            placeholderTextColor="#333333"
            value={pickerSearch}
            onChangeText={setPickerSearch}
            selectionColor={primaryColor}
          />
          <FlatList
            data={pickerFiltered}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.pickerItem}
                onPress={() => addFreeExercise(item)}
                activeOpacity={0.75}
              >
                <Text style={styles.pickerItemName}>{item.name}</Text>
                <Text style={styles.pickerItemMuscle}>
                  {MUSCLE_GROUP_LABELS[item.muscle_group] ?? item.muscle_group}
                </Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' },

  timerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 2,
  },
  timerText: { fontSize: 28, fontWeight: '900', fontVariant: ['tabular-nums'], letterSpacing: 2 },
  timerLabel: { fontSize: 10, color: '#444444', letterSpacing: 2, fontWeight: '700' },

  // Rest timer
  restPanel: {
    backgroundColor: '#111111',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  restTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 12,
  },
  restLeft: { alignItems: 'flex-start' },
  restLabel: { fontSize: 9, fontWeight: '800', color: '#444444', letterSpacing: 2 },
  restCount: { fontSize: 36, fontWeight: '900', fontVariant: ['tabular-nums'], lineHeight: 40 },
  restCountUnit: { fontSize: 16, fontWeight: '600' },
  restRight: { flex: 1, alignItems: 'flex-end', gap: 6 },
  restPresets: { flexDirection: 'row', gap: 6 },
  restPresetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  restPresetText: { fontSize: 11, fontWeight: '700', color: '#555555' },
  restSkipBtn: { paddingVertical: 4 },
  restSkipText: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  restBarBg: { height: 3, backgroundColor: '#1a1a1a' },
  restBarFill: { height: 3 },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  exCard: {
    backgroundColor: '#111111',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  exHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  exName: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  exMuscle: { fontSize: 11, color: '#444444', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  exPrescribed: { fontSize: 12, fontWeight: '700', marginTop: 6 },
  setCount: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },

  setsTable: { marginBottom: 8, backgroundColor: '#1a1a1a', borderRadius: 8, overflow: 'hidden' },
  setsHeaderRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  setsRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 6 },
  setsCell: { flex: 1, fontSize: 13, color: '#555555', textAlign: 'center' },
  setsCellHeader: { fontWeight: '700', color: '#333333', fontSize: 11, letterSpacing: 0.5 },

  addSetRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  setInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
  },
  confirmBtn: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  confirmBtnText: { color: '#0a0a0a', fontWeight: '900', fontSize: 18 },
  cancelBtn: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2a2a2a' },
  cancelBtnText: { color: '#444444', fontWeight: '700', fontSize: 14 },

  addSetBtn: { paddingVertical: 8, alignItems: 'flex-start', marginTop: 4, borderTopWidth: 1 },
  addSetBtnText: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginTop: 6 },

  addExBtn: { borderWidth: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4, marginBottom: 10, borderStyle: 'dashed' },
  addExBtnText: { fontSize: 12, fontWeight: '700', color: '#444444', letterSpacing: 1 },

  finishBtn: { backgroundColor: '#1a1a1a', borderRadius: 14, paddingVertical: 18, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#ef4444' },
  finishBtnText: { color: '#ef4444', fontSize: 12, fontWeight: '900', letterSpacing: 2 },

  pickerContainer: { flex: 1, backgroundColor: '#0a0a0a' },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  pickerTitle: { fontSize: 14, fontWeight: '900', color: '#ffffff', letterSpacing: 2 },
  pickerClose: { fontSize: 14, color: '#444444' },
  pickerSearch: { margin: 16, backgroundColor: '#111111', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#ffffff' },
  pickerItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#111111' },
  pickerItemName: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
  pickerItemMuscle: { fontSize: 11, color: '#444444', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
})
