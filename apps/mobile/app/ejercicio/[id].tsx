import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { VideoView, useVideoPlayer } from 'expo-video'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/context/theme-context'
import { MUSCLE_GROUP_LABELS } from '@gymos/types'
import type { ExerciseRow } from '@gymos/types'

const { width } = Dimensions.get('window')

export default function EjercicioDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { primaryColor } = useTheme()
  const [exercise, setExercise] = useState<ExerciseRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    supabase.from('exercises').select('*').eq('id', id).single().then(({ data }) => {
      setExercise(data as ExerciseRow | null)
      setLoading(false)
    })
  }, [id])

  const player = useVideoPlayer(exercise?.video_url ?? null, (p) => {
    p.loop = true
  })

  if (loading) {
    return (
      <View style={styles.centered}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    )
  }

  if (!exercise) {
    return (
      <View style={styles.centered}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        <Text style={styles.errorText}>Ejercicio no encontrado</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Video or placeholder */}
        {exercise.video_url ? (
          <VideoView
            player={player}
            style={styles.video}
            allowsFullscreen
            allowsPictureInPicture
          />
        ) : (
          <View style={styles.videoPlaceholder}>
            <View style={[styles.videoPlaceholderIcon, { borderColor: primaryColor }]}>
              <Text style={[styles.videoPlaceholderText, { color: primaryColor }]}>SIN VIDEO</Text>
            </View>
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          <View style={[styles.muscleBadge, { backgroundColor: '#1a1a1a', borderColor: primaryColor }]}>
            <Text style={[styles.muscleBadgeText, { color: primaryColor }]}>
              {(MUSCLE_GROUP_LABELS[exercise.muscle_group] ?? exercise.muscle_group).toUpperCase()}
            </Text>
          </View>

          <Text style={styles.name}>{exercise.name.toUpperCase()}</Text>

          {exercise.description ? (
            <Text style={styles.description}>{exercise.description}</Text>
          ) : null}

          {exercise.video_duration ? (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>DURACIÓN DEL VIDEO</Text>
              <Text style={[styles.metaValue, { color: primaryColor }]}>{exercise.video_duration}s</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' },

  video: { width, height: width * 0.56, backgroundColor: '#000000' },

  videoPlaceholder: {
    width,
    height: width * 0.56,
    backgroundColor: '#0d0d0d',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  videoPlaceholderIcon: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  videoPlaceholderText: { fontSize: 11, fontWeight: '800', letterSpacing: 2 },

  content: { padding: 20 },

  muscleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
  },
  muscleBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },

  name: { fontSize: 28, fontWeight: '900', color: '#ffffff', marginBottom: 12, letterSpacing: 1, lineHeight: 32 },
  description: { fontSize: 15, color: '#888888', lineHeight: 26, marginBottom: 20 },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  metaLabel: { fontSize: 11, color: '#444444', fontWeight: '700', letterSpacing: 1.5 },
  metaValue: { fontSize: 15, fontWeight: '900' },

  errorText: { fontSize: 16, color: '#ef4444' },
})
