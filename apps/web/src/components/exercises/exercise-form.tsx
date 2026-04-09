'use client'

import { useState, useRef, useTransition } from 'react'
import type { Exercise, MuscleGroup } from '@gymos/types'
import { MUSCLE_GROUP_LABELS } from '@gymos/types'
import { createExercise, updateExercise } from '@/app/(dashboard)/dashboard/exercises/actions'
import { createClient } from '@/lib/supabase/client'
import { Upload, CheckCircle } from 'lucide-react'

interface ExerciseFormProps {
  exercise?: Exercise
  error?: string
}

export default function ExerciseForm({ exercise, error: initialError }: ExerciseFormProps) {
  const isEditing = !!exercise
  const [videoUrl, setVideoUrl] = useState(exercise?.video_url ?? '')
  const [videoDuration, setVideoDuration] = useState<number | null>(exercise?.video_duration ?? null)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPending, startTransition] = useTransition()

  async function handleVideoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Formato no soportado. Usá MP4, WebM o MOV.')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadError('El video supera los 50MB.')
      return
    }

    const objectUrl = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.src = objectUrl
    video.onloadedmetadata = async () => {
      URL.revokeObjectURL(objectUrl)
      if (video.duration > 30) {
        setUploadError('El video supera los 30 segundos.')
        return
      }
      setUploadError(null)
      setUploadProgress('Subiendo video...')

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setUploadError('No autenticado'); return }

      const { data: profile } = await supabase.from('profiles').select('gym_id').eq('id', user.id).single()
      if (!profile?.gym_id) { setUploadError('Sin gym asignado'); return }

      const ext = file.name.split('.').pop()
      const path = `gyms/${profile.gym_id}/exercises/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadErr } = await supabase.storage.from('gym-assets').upload(path, file)
      if (uploadErr) { setUploadError(uploadErr.message); setUploadProgress(null); return }

      const { data: { publicUrl } } = supabase.storage.from('gym-assets').getPublicUrl(path)
      setVideoUrl(publicUrl)
      setVideoDuration(Math.round(video.duration))
      setUploadProgress(null)
    }
  }

  const action = isEditing ? updateExercise.bind(null, exercise.id) : createExercise

  return (
    <form action={action} className="surface p-6 space-y-5">
      {(initialError || uploadError) && (
        <div className="alert-error">{initialError ? decodeURIComponent(initialError) : uploadError}</div>
      )}

      <div>
        <label className="label-dark">Nombre *</label>
        <input
          name="name"
          type="text"
          required
          defaultValue={exercise?.name}
          className="input-dark"
          placeholder="Ej: Press de banca"
        />
      </div>

      <div>
        <label className="label-dark">Grupo muscular *</label>
        <select
          name="muscle_group"
          required
          defaultValue={exercise?.muscle_group ?? 'other'}
          className="input-dark"
        >
          {(Object.entries(MUSCLE_GROUP_LABELS) as [MuscleGroup, string][]).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-dark">Descripción</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={exercise?.description ?? ''}
          className="textarea-dark"
          placeholder="Descripción opcional del ejercicio..."
        />
      </div>

      <div>
        <label className="label-dark">Video (≤30s · MP4/WebM/MOV · máx. 50MB)</label>
        <label
          className="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 transition-colors"
          style={{ border: '1px dashed #2a2a2a', backgroundColor: '#1a1a1a' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2a2a2a')}
        >
          <Upload size={16} style={{ color: '#444', flexShrink: 0 }} />
          <span style={{ color: '#888888', fontSize: 13 }}>
            {uploadProgress ?? 'Seleccionar archivo de video...'}
          </span>
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={handleVideoSelect}
            className="sr-only"
          />
        </label>

        {videoUrl && (
          <div className="mt-3 space-y-2">
            <video
              src={videoUrl}
              controls
              className="w-full rounded-lg object-contain"
              style={{ maxHeight: 160, backgroundColor: '#000' }}
            />
            <p className="flex items-center gap-1.5 text-xs" style={{ color: '#22c55e' }}>
              <CheckCircle size={12} />
              Video listo ({videoDuration}s)
            </p>
          </div>
        )}
        <input type="hidden" name="video_url" value={videoUrl} />
        <input type="hidden" name="video_duration" value={videoDuration ?? ''} />
      </div>

      <div className="flex justify-end gap-3 pt-2" style={{ borderTop: '1px solid #1a1a1a' }}>
        <button
          type="submit"
          disabled={isPending || !!uploadProgress}
          className="btn-accent"
        >
          {isEditing ? 'Guardar cambios' : 'Crear ejercicio'}
        </button>
      </div>
    </form>
  )
}
