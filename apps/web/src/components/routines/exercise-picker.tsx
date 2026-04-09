'use client'

import { useState } from 'react'
import { Search, Dumbbell, X } from 'lucide-react'
import { MUSCLE_GROUP_LABELS } from '@gymos/types'

interface ExerciseOption {
  id: string
  name: string
  muscle_group: string
  thumbnail_url: string | null
}

interface ExercisePickerProps {
  exercises: ExerciseOption[]
  usedIds: string[]
  onSelect: (exercise: ExerciseOption) => void
  onClose: () => void
}

export default function ExercisePicker({ exercises, usedIds, onSelect, onClose }: ExercisePickerProps) {
  const [search, setSearch] = useState('')
  const [muscleFilter, setMuscleFilter] = useState('all')

  const filtered = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase())
    const matchesMuscle = muscleFilter === 'all' || ex.muscle_group === muscleFilter
    return matchesSearch && matchesMuscle
  })

  const muscleGroups = Array.from(new Set(exercises.map((e) => e.muscle_group)))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        className="relative flex w-full max-w-lg flex-col rounded-xl"
        style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a', maxHeight: '80vh' }}
      >
        <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid #2a2a2a' }}>
          <p style={{ color: '#ffffff', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600 }}>
            Agregar ejercicio
          </p>
          <button type="button" onClick={onClose} style={{ color: '#444444' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#444444')}
          ><X size={16} /></button>
        </div>

        <div className="flex gap-2 p-3" style={{ borderBottom: '1px solid #1a1a1a' }}>
          <div className="relative flex-1">
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#444', pointerEvents: 'none' }} />
            <input
              autoFocus
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-dark"
              style={{ paddingLeft: 30, paddingTop: 8, paddingBottom: 8, fontSize: 13 }}
            />
          </div>
          <select
            value={muscleFilter}
            onChange={(e) => setMuscleFilter(e.target.value)}
            className="input-dark"
            style={{ width: 'auto', minWidth: 120, paddingTop: 8, paddingBottom: 8, fontSize: 13 }}
          >
            <option value="all">Todos</option>
            {muscleGroups.map((mg) => (
              <option key={mg} value={mg}>{MUSCLE_GROUP_LABELS[mg as keyof typeof MUSCLE_GROUP_LABELS] ?? mg}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="py-8 text-center" style={{ color: '#444', fontSize: 13 }}>Sin resultados</p>
          )}
          {filtered.map((ex) => {
            const isUsed = usedIds.includes(ex.id)
            return (
              <button
                key={ex.id}
                type="button"
                disabled={isUsed}
                onClick={() => onSelect(ex)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors"
                style={{ opacity: isUsed ? 0.35 : 1, cursor: isUsed ? 'not-allowed' : 'pointer' }}
                onMouseEnter={(e) => { if (!isUsed) e.currentTarget.style.backgroundColor = '#1a1a1a' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                {ex.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ex.thumbnail_url} alt={ex.name} className="h-10 w-10 flex-shrink-0 rounded-lg object-cover" style={{ border: '1px solid #2a2a2a' }} />
                ) : (
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                    <Dumbbell size={16} style={{ color: 'var(--color-accent)' }} strokeWidth={1.5} />
                  </div>
                )}
                <div className="min-w-0">
                  <p style={{ color: '#ffffff', fontSize: 13, fontWeight: 500 }}>{ex.name}</p>
                  <p style={{ color: '#888888', fontSize: 11 }}>{MUSCLE_GROUP_LABELS[ex.muscle_group as keyof typeof MUSCLE_GROUP_LABELS] ?? ex.muscle_group}</p>
                </div>
                {isUsed && <span style={{ marginLeft: 'auto', color: '#333', fontSize: 11, fontFamily: 'var(--font-mono)', flexShrink: 0 }}>Ya agregado</span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
