import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
  StatusBar,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/context/theme-context'
import { useSession } from '@/context/session-context'
import { MUSCLE_GROUP_LABELS } from '@gymos/types'
import type { ExerciseRow } from '@gymos/types'

export default function LibreScreen() {
  const { primaryColor } = useTheme()
  const { session } = useSession()
  const router = useRouter()

  const [exercises, setExercises] = useState<ExerciseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filterGroup, setFilterGroup] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const [searchText, setSearchText] = useState('')

  const loadExercises = useCallback(async () => {
    if (!session) return
    setLoading(true)
    const { data } = await supabase
      .from('exercises')
      .select('*')
      .eq('is_active', true)
      .order('name')
    setExercises((data ?? []) as ExerciseRow[])
    setLoading(false)
  }, [session])

  useEffect(() => { loadExercises() }, [loadExercises])

  const muscleGroups = [...new Set(exercises.map(e => e.muscle_group))].sort()

  const filtered = exercises.filter(ex => {
    const matchGroup = filterGroup ? ex.muscle_group === filterGroup : true
    const matchSearch = searchText ? ex.name.toLowerCase().includes(searchText.toLowerCase()) : true
    return matchGroup && matchSearch
  })

  async function handleStart() {
    if (!session) return
    setStarting(true)
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('gym_id')
        .eq('id', session.user.id)
        .single()

      if (!profile?.gym_id) throw new Error('Sin gimnasio')

      const { data: sessionData, error } = await supabase
        .from('workout_sessions')
        .insert({ gym_id: profile.gym_id, client_id: session.user.id, routine_id: null, routine_day_id: null })
        .select('id')
        .single()

      if (error) throw error
      router.push(`/sesion/${sessionData.id}`)
    } catch (e: any) {
      Alert.alert('Error', e.message)
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>LIBRE</Text>
          <Text style={styles.headerSub}>{exercises.length} ejercicios disponibles</Text>
        </View>
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: primaryColor }, starting && { opacity: 0.5 }]}
          onPress={handleStart}
          disabled={starting}
          activeOpacity={0.85}
        >
          <Text style={styles.startBtnText}>{starting ? '...' : 'INICIAR'}</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar ejercicio..."
          placeholderTextColor="#333333"
          value={searchText}
          onChangeText={setSearchText}
          selectionColor={primaryColor}
        />
      </View>

      {/* Muscle group filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[styles.filterChip, filterGroup === null && { backgroundColor: primaryColor, borderColor: primaryColor }]}
          onPress={() => setFilterGroup(null)}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterChipText, filterGroup === null && styles.filterChipTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>
        {muscleGroups.map(mg => (
          <TouchableOpacity
            key={mg}
            style={[styles.filterChip, filterGroup === mg && { backgroundColor: primaryColor, borderColor: primaryColor }]}
            onPress={() => setFilterGroup(filterGroup === mg ? null : mg)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, filterGroup === mg && styles.filterChipTextActive]}>
              {MUSCLE_GROUP_LABELS[mg as keyof typeof MUSCLE_GROUP_LABELS] ?? mg}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Exercise list */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.exCard}
            onPress={() => router.push(`/ejercicio/${item.id}`)}
            activeOpacity={0.75}
          >
            <View style={styles.exInfo}>
              <Text style={styles.exName}>{item.name}</Text>
              <Text style={styles.exMuscle}>
                {MUSCLE_GROUP_LABELS[item.muscle_group] ?? item.muscle_group}
              </Text>
            </View>
            {item.video_url && (
              <View style={[styles.videoBadge, { borderColor: primaryColor }]}>
                <Text style={[styles.videoBadgeText, { color: primaryColor }]}>VIDEO</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay ejercicios disponibles</Text>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#ffffff', letterSpacing: 2 },
  headerSub: { fontSize: 12, color: '#444444', marginTop: 4, letterSpacing: 0.5 },
  startBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  startBtnText: { color: '#0a0a0a', fontSize: 12, fontWeight: '900', letterSpacing: 1.5 },

  searchRow: { paddingHorizontal: 16, paddingVertical: 12 },
  searchInput: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#ffffff',
  },

  filterScroll: { maxHeight: 48, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  filterContent: { paddingHorizontal: 16, gap: 8, flexDirection: 'row', alignItems: 'center', paddingBottom: 10 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    backgroundColor: '#111111',
  },
  filterChipText: { fontSize: 12, fontWeight: '600', color: '#444444' },
  filterChipTextActive: { color: '#0a0a0a', fontWeight: '800' },

  listContent: { padding: 16, paddingTop: 12 },
  exCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  exInfo: { flex: 1 },
  exName: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
  exMuscle: { fontSize: 11, color: '#444444', marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.5 },

  videoBadge: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 3 },
  videoBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },

  emptyText: { textAlign: 'center', color: '#444444', fontSize: 14, marginTop: 40 },
})
