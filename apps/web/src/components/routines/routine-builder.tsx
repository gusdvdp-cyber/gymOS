'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import type { RoutineBuilderState, RoutineDayDraft, RoutineDayExerciseDraft } from '@gymos/types'
import { MUSCLE_GROUP_LABELS } from '@gymos/types'
import { createRoutineWithDays, updateRoutineWithDays } from '@/app/(dashboard)/dashboard/routines/actions'
import ExercisePicker from './exercise-picker'

interface ExerciseOption {
  id: string
  name: string
  muscle_group: string
  thumbnail_url: string | null
}

interface RoutineBuilderProps {
  exercises: ExerciseOption[]
  initialState?: RoutineBuilderState
  routineId?: string
}

function buildDefaultDays(count: 3 | 4 | 5): RoutineDayDraft[] {
  return Array.from({ length: count }, (_, i) => ({
    day_number: i + 1,
    name: `Día ${i + 1}`,
    exercises: [],
  }))
}

export default function RoutineBuilder({ exercises, initialState, routineId }: RoutineBuilderProps) {
  const router = useRouter()
  const isEditing = !!routineId
  const [step, setStep] = useState<'meta' | 'days'>(isEditing ? 'days' : 'meta')
  const [activeDay, setActiveDay] = useState(0)
  const [showPicker, setShowPicker] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [state, setState] = useState<RoutineBuilderState>(
    initialState ?? { name: '', days_per_week: 3, total_weeks: null, description: '', days: buildDefaultDays(3) }
  )

  function handleDaysChange(count: 3 | 4 | 5) {
    setState((prev) => ({
      ...prev,
      days_per_week: count,
      days: prev.days.length === count
        ? prev.days
        : count > prev.days.length
          ? [...prev.days, ...buildDefaultDays(count).slice(prev.days.length)]
          : prev.days.slice(0, count),
    }))
  }

  function addExercise(ex: ExerciseOption) {
    setState((prev) => {
      const days = [...prev.days]
      const day = { ...days[activeDay]! }
      day.exercises = [
        ...day.exercises,
        { tempId: `${ex.id}_${Date.now()}`, exercise_id: ex.id, exercise_name: ex.name, muscle_group: ex.muscle_group, sets: 3, reps: '10', suggested_weight: null, notes: '' },
      ]
      days[activeDay] = day
      return { ...prev, days }
    })
    setShowPicker(false)
  }

  function updateExerciseField(dayIdx: number, exIdx: number, field: keyof RoutineDayExerciseDraft, value: string | number | null) {
    setState((prev) => ({
      ...prev,
      days: prev.days.map((d, di) =>
        di !== dayIdx ? d : { ...d, exercises: d.exercises.map((ex, ei) => ei !== exIdx ? ex : { ...ex, [field]: value }) }
      ),
    }))
  }

  function removeExercise(dayIdx: number, exIdx: number) {
    setState((prev) => ({
      ...prev,
      days: prev.days.map((d, di) =>
        di !== dayIdx ? d : { ...d, exercises: d.exercises.filter((_, ei) => ei !== exIdx) }
      ),
    }))
  }

  function moveExercise(dayIdx: number, exIdx: number, direction: 'up' | 'down') {
    setState((prev) => ({
      ...prev,
      days: prev.days.map((d, di) => {
        if (di !== dayIdx) return d
        const exs = [...d.exercises]
        const newIdx = direction === 'up' ? exIdx - 1 : exIdx + 1
        if (newIdx < 0 || newIdx >= exs.length) return d
        ;[exs[exIdx], exs[newIdx]] = [exs[newIdx]!, exs[exIdx]!]
        return { ...d, exercises: exs }
      }),
    }))
  }

  function handleSave() {
    if (!state.name.trim()) { setError('El nombre de la rutina es requerido.'); return }
    setError(null)
    startTransition(async () => {
      const payload = { gymId: '', createdBy: '', state }
      const result = isEditing
        ? await updateRoutineWithDays(routineId, payload)
        : await createRoutineWithDays(payload)
      if (result.error) { setError(result.error.message) } else { router.push('/dashboard/routines') }
    })
  }

  const currentDay = state.days[activeDay]

  return (
    <div className="space-y-5">
      {/* ── Step: Meta ─────────────────────────────────────────────────────────── */}
      {step === 'meta' && (
        <div className="surface p-6 space-y-5">
          <p className="label-dark" style={{ marginBottom: 0 }}>Información de la rutina</p>

          <div>
            <label className="label-dark">Nombre *</label>
            <input
              type="text"
              value={state.name}
              onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
              className="input-dark"
              placeholder="Ej: Rutina Fuerza 3 días"
            />
          </div>

          <div>
            <label className="label-dark">Días por semana *</label>
            <div className="flex gap-2 mt-1">
              {([3, 4, 5] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleDaysChange(n)}
                  className="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: state.days_per_week === n ? 'var(--color-accent)' : '#1a1a1a',
                    color: state.days_per_week === n ? '#0a0a0a' : '#888888',
                    border: `1px solid ${state.days_per_week === n ? 'var(--color-accent)' : '#2a2a2a'}`,
                  }}
                >
                  {n} días
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label-dark">Duración (semanas)</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {([null, 4, 6, 8, 10, 12, 16] as const).map((w) => (
                <button
                  key={w ?? 'libre'}
                  type="button"
                  onClick={() => setState((s) => ({ ...s, total_weeks: w }))}
                  className="rounded-lg px-3 py-2 text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: state.total_weeks === w ? 'var(--color-accent)' : '#1a1a1a',
                    color: state.total_weeks === w ? '#0a0a0a' : '#888888',
                    border: `1px solid ${state.total_weeks === w ? 'var(--color-accent)' : '#2a2a2a'}`,
                  }}
                >
                  {w === null ? 'Sin límite' : `${w} sem`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label-dark">Descripción</label>
            <textarea
              rows={2}
              value={state.description}
              onChange={(e) => setState((s) => ({ ...s, description: e.target.value }))}
              className="textarea-dark"
              placeholder="Descripción opcional..."
            />
          </div>

          {error && <p className="alert-error">{error}</p>}

          <div className="flex justify-end pt-2" style={{ borderTop: '1px solid #1a1a1a' }}>
            <button
              type="button"
              onClick={() => {
                if (!state.name.trim()) { setError('El nombre es requerido.'); return }
                setError(null)
                setStep('days')
              }}
              className="btn-accent"
            >
              Continuar → Armar días
            </button>
          </div>
        </div>
      )}

      {/* ── Step: Days ─────────────────────────────────────────────────────────── */}
      {step === 'days' && (
        <div className="space-y-4">
          {/* Day tabs */}
          <div className="flex gap-1 overflow-x-auto rounded-xl p-1" style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}>
            {state.days.map((day, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveDay(idx)}
                className="flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all"
                style={{
                  backgroundColor: activeDay === idx ? 'var(--color-accent)' : 'transparent',
                  color: activeDay === idx ? '#0a0a0a' : '#888888',
                }}
              >
                Día {idx + 1}
                {day.exercises.length > 0 && (
                  <span style={{ marginLeft: 4, fontSize: 11, opacity: 0.7 }}>({day.exercises.length})</span>
                )}
              </button>
            ))}
          </div>

          {/* Active day editor */}
          {currentDay && (
            <div className="surface overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid #2a2a2a' }}>
                <input
                  type="text"
                  value={currentDay.name}
                  onChange={(e) => setState((prev) => {
                    const days = [...prev.days]
                    days[activeDay] = { ...currentDay, name: e.target.value }
                    return { ...prev, days }
                  })}
                  className="input-dark-sm flex-1"
                  style={{ fontWeight: 600 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPicker(true)}
                  className="btn-accent"
                  style={{ padding: '6px 14px', fontSize: 13 }}
                >
                  <Plus size={13} /> Ejercicio
                </button>
              </div>

              <div>
                {currentDay.exercises.length === 0 && (
                  <p className="py-10 text-center" style={{ color: '#333', fontSize: 13 }}>
                    Sin ejercicios. Hacé click en "Ejercicio" para agregar.
                  </p>
                )}

                {currentDay.exercises.map((ex, exIdx) => (
                  <div
                    key={ex.tempId}
                    className="flex items-start gap-3 px-4 py-3"
                    style={{ borderBottom: '1px solid #1a1a1a' }}
                  >
                    {/* Order controls */}
                    <div className="flex flex-col items-center gap-0.5 pt-1 flex-shrink-0">
                      <button type="button" onClick={() => moveExercise(activeDay, exIdx, 'up')} style={{ color: '#333', lineHeight: 1 }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#888')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#333')}
                      ><ChevronUp size={14} /></button>
                      <span style={{ color: '#444', fontSize: 11, fontFamily: 'var(--font-mono)', textAlign: 'center', minWidth: 16 }}>{exIdx + 1}</span>
                      <button type="button" onClick={() => moveExercise(activeDay, exIdx, 'down')} style={{ color: '#333', lineHeight: 1 }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#888')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#333')}
                      ><ChevronDown size={14} /></button>
                    </div>

                    {/* Exercise info + fields */}
                    <div className="flex-1 min-w-0">
                      <p style={{ color: '#ffffff', fontSize: 13, fontWeight: 600 }} className="truncate">{ex.exercise_name}</p>
                      <p style={{ color: '#444', fontSize: 11 }}>{MUSCLE_GROUP_LABELS[ex.muscle_group as keyof typeof MUSCLE_GROUP_LABELS] ?? ex.muscle_group}</p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {[
                          { label: 'Series', field: 'sets' as const, type: 'number', width: 64, value: ex.sets, placeholder: '' },
                          { label: 'Reps', field: 'reps' as const, type: 'text', width: 80, value: ex.reps, placeholder: '8-12' },
                        ].map(({ label, field, type, width, value, placeholder }) => (
                          <div key={field}>
                            <p className="label-dark" style={{ marginBottom: 3 }}>{label}</p>
                            <input
                              type={type}
                              min={field === 'sets' ? 1 : undefined}
                              max={field === 'sets' ? 20 : undefined}
                              value={value}
                              onChange={(e) => updateExerciseField(activeDay, exIdx, field, field === 'sets' ? (parseInt(e.target.value) || 1) : e.target.value)}
                              className="input-dark-sm text-center"
                              style={{ width }}
                              placeholder={placeholder}
                            />
                          </div>
                        ))}
                        <div>
                          <p className="label-dark" style={{ marginBottom: 3 }}>Peso (kg)</p>
                          <input
                            type="number"
                            min={0}
                            step={0.5}
                            value={ex.suggested_weight ?? ''}
                            onChange={(e) => updateExerciseField(activeDay, exIdx, 'suggested_weight', e.target.value ? parseFloat(e.target.value) : null)}
                            className="input-dark-sm text-center"
                            style={{ width: 80 }}
                            placeholder="—"
                          />
                        </div>
                        <div className="flex-1" style={{ minWidth: 120 }}>
                          <p className="label-dark" style={{ marginBottom: 3 }}>Notas</p>
                          <input
                            type="text"
                            value={ex.notes}
                            onChange={(e) => updateExerciseField(activeDay, exIdx, 'notes', e.target.value)}
                            className="input-dark-sm w-full"
                            placeholder="Opcional"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeExercise(activeDay, exIdx)}
                      style={{ color: '#333', marginTop: 2, flexShrink: 0 }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ff4444')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#333')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep('meta')}
              className="back-link"
            >
              ← Volver a datos
            </button>
            <div className="flex items-center gap-3">
              {error && <p className="alert-error" style={{ padding: '6px 12px' }}>{error}</p>}
              <button type="button" onClick={handleSave} disabled={isPending} className="btn-accent">
                {isPending ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear rutina'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPicker && (
        <ExercisePicker
          exercises={exercises}
          usedIds={currentDay?.exercises.map((e) => e.exercise_id) ?? []}
          onSelect={addExercise}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
