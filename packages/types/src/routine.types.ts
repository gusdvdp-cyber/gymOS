import type {
  RoutineRow,
  RoutineDayRow,
  RoutineDayExerciseRow,
  ExerciseRow,
} from './database.types'

export type Routine = RoutineRow
export type RoutineDay = RoutineDayRow
export type RoutineDayExercise = RoutineDayExerciseRow

export interface RoutineDayExerciseWithExercise extends RoutineDayExerciseRow {
  exercises: Pick<ExerciseRow, 'id' | 'name' | 'muscle_group' | 'thumbnail_url' | 'video_url' | 'description'>
}

export interface RoutineDayWithExercises extends RoutineDayRow {
  routine_day_exercises: RoutineDayExerciseWithExercise[]
}

export interface RoutineWithDays extends RoutineRow {
  routine_days: RoutineDayWithExercises[]
}

// ─── Builder types (client-side state) ───────────────────────────────────────

export interface RoutineDayExerciseDraft {
  tempId: string
  exercise_id: string
  exercise_name: string
  muscle_group: string
  sets: number
  reps: string
  suggested_weight: number | null
  notes: string
}

export interface RoutineDayDraft {
  day_number: number
  name: string
  exercises: RoutineDayExerciseDraft[]
}

export interface RoutineBuilderState {
  name: string
  days_per_week: 3 | 4 | 5
  total_weeks: number | null
  description: string
  days: RoutineDayDraft[]
}

export interface CreateRoutinePayload {
  gymId: string
  createdBy: string
  state: RoutineBuilderState
}
