export type UserRole = 'superadmin' | 'admin' | 'profe' | 'cliente'

export type GymPlan = 'PART' | 'FULL'

export type GymStatus = 'active' | 'inactive' | 'suspended'

export type MemberStatus = 'active' | 'expiring_soon' | 'expired' | 'inactive'

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'glutes'
  | 'core'
  | 'cardio'
  | 'full_body'
  | 'other'

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: 'Pecho',
  back: 'Espalda',
  shoulders: 'Hombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  legs: 'Piernas',
  glutes: 'Glúteos',
  core: 'Core / Abdomen',
  cardio: 'Cardio',
  full_body: 'Cuerpo completo',
  other: 'Otro',
}
