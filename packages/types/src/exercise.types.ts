import type { ExerciseRow } from './database.types'
import type { MuscleGroup } from './enums'

export type Exercise = ExerciseRow

export interface CreateExercisePayload {
  gymId: string
  name: string
  description?: string
  muscleGroup: MuscleGroup
  videoUrl?: string
  videoDuration?: number
  thumbnailUrl?: string
  createdBy: string
}

export interface UpdateExercisePayload {
  name?: string
  description?: string
  muscleGroup?: MuscleGroup
  videoUrl?: string
  videoDuration?: number
  thumbnailUrl?: string
  isActive?: boolean
}
