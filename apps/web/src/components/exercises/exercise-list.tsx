'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Video, ChevronRight, Search } from 'lucide-react'
import type { Exercise } from '@gymos/types'
import { MUSCLE_GROUP_LABELS } from '@gymos/types'
import MuscleGroupSVG from './muscle-group-svg'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

export default function ExerciseList({ exercises }: { exercises: Exercise[] }) {
  const [filter, setFilter] = useState('')
  const [muscleFilter, setMuscleFilter] = useState('all')

  const filtered = exercises.filter((ex) => {
    const matchesName = ex.name.toLowerCase().includes(filter.toLowerCase())
    const matchesMuscle = muscleFilter === 'all' || ex.muscle_group === muscleFilter
    return matchesName && matchesMuscle
  })

  const muscleGroups = Array.from(new Set(exercises.map((e) => e.muscle_group)))

  if (exercises.length === 0) {
    return (
      <div className="surface flex flex-col items-center justify-center gap-3 py-16 text-center">
        <p style={{ color: '#888888', fontSize: 14 }}>No hay ejercicios todavía.</p>
        <Link href="/dashboard/exercises/new" className="btn-accent" style={{ padding: '8px 16px', fontSize: 13 }}>
          Crear el primero
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#444', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Buscar ejercicio..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-dark"
            style={{ paddingLeft: 36 }}
          />
        </div>
        <select
          value={muscleFilter}
          onChange={(e) => setMuscleFilter(e.target.value)}
          className="input-dark"
          style={{ width: 'auto', minWidth: 160 }}
        >
          <option value="all">Todos los grupos</option>
          {muscleGroups.map((mg) => (
            <option key={mg} value={mg}>{MUSCLE_GROUP_LABELS[mg]}</option>
          ))}
        </select>
      </div>

      <motion.div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {filtered.map((exercise) => (
          <motion.div key={exercise.id} variants={item}>
            <Link
              href={`/dashboard/exercises/${exercise.id}`}
              className="card-hover surface relative overflow-hidden flex items-center gap-3 p-4 block"
              style={{ minHeight: 80 }}
            >
              {/* Muscle silhouette — right-side watermark */}
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                <MuscleGroupSVG muscleGroup={exercise.muscle_group} height={72} opacity={0.55} />
              </div>

              {/* Thumbnail (if available) */}
              {exercise.thumbnail_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={exercise.thumbnail_url}
                  alt={exercise.name}
                  className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
                  style={{ border: '1px solid #2a2a2a', position: 'relative', zIndex: 1 }}
                />
              )}

              {/* Text */}
              <div className="min-w-0 flex-1" style={{ position: 'relative', zIndex: 1, paddingRight: 80 }}>
                <p className="truncate font-semibold" style={{ color: '#ffffff', fontFamily: 'var(--font-body)', fontSize: 14 }}>
                  {exercise.name}
                </p>
                <p style={{ color: '#888888', fontSize: 12, marginTop: 2 }}>
                  {MUSCLE_GROUP_LABELS[exercise.muscle_group]}
                </p>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  {exercise.video_url && (
                    <span className="flex items-center gap-1" style={{ color: 'var(--color-accent)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                      <Video size={10} />
                      {exercise.video_duration}s
                    </span>
                  )}
                  {!exercise.is_active && <span className="badge-inactive">Inactivo</span>}
                </div>
              </div>

              <ChevronRight size={14} style={{ color: '#2a2a2a', flexShrink: 0, position: 'relative', zIndex: 1 }} />
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <p className="py-10 text-center" style={{ color: '#444', fontSize: 13 }}>Sin resultados para tu búsqueda.</p>
      )}
    </div>
  )
}
