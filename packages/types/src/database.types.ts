import type { GymPlan, GymStatus, UserRole, MuscleGroup } from './enums'

export interface Database {
  public: {
    Tables: {
      gyms: {
        Row: GymRow
        Insert: GymInsert
        Update: GymUpdate
        Relationships: []
      }
      profiles: {
        Row: ProfileRow
        Insert: ProfileInsert
        Update: ProfileUpdate
        Relationships: []
      }
      gym_branding: {
        Row: GymBrandingRow
        Insert: GymBrandingInsert
        Update: GymBrandingUpdate
        Relationships: []
      }
      gym_invitations: {
        Row: GymInvitationRow
        Insert: GymInvitationInsert
        Update: GymInvitationUpdate
        Relationships: []
      }
      exercises: {
        Row: ExerciseRow
        Insert: ExerciseInsert
        Update: ExerciseUpdate
        Relationships: []
      }
      routines: {
        Row: RoutineRow
        Insert: RoutineInsert
        Update: RoutineUpdate
        Relationships: []
      }
      routine_days: {
        Row: RoutineDayRow
        Insert: RoutineDayInsert
        Update: RoutineDayUpdate
        Relationships: []
      }
      routine_day_exercises: {
        Row: RoutineDayExerciseRow
        Insert: RoutineDayExerciseInsert
        Update: RoutineDayExerciseUpdate
        Relationships: []
      }
      client_routine_assignments: {
        Row: ClientRoutineAssignmentRow
        Insert: ClientRoutineAssignmentInsert
        Update: ClientRoutineAssignmentUpdate
        Relationships: []
      }
      workout_sessions: {
        Row: WorkoutSessionRow
        Insert: WorkoutSessionInsert
        Update: WorkoutSessionUpdate
        Relationships: []
      }
      workout_set_logs: {
        Row: WorkoutSetLogRow
        Insert: WorkoutSetLogInsert
        Update: WorkoutSetLogUpdate
        Relationships: []
      }
      body_measurements: {
        Row: BodyMeasurementRow
        Insert: BodyMeasurementInsert
        Update: BodyMeasurementUpdate
        Relationships: []
      }
    }
    Functions: {
      is_superadmin: {
        Args: Record<string, never>
        Returns: boolean
      }
      get_user_gym_id: {
        Args: Record<string, never>
        Returns: string | null
      }
    }
  }
}

// ─── gyms ────────────────────────────────────────────────────────────────────

export interface GymRow {
  id: string
  name: string
  slug: string
  plan: GymPlan
  status: GymStatus
  email: string | null
  phone: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export type GymInsert = Omit<GymRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
}

export type GymUpdate = Partial<Omit<GymRow, 'id' | 'created_at'>>

// ─── profiles ────────────────────────────────────────────────────────────────

export interface ProfileRow {
  id: string
  gym_id: string | null
  role: UserRole
  first_name: string
  last_name: string
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ProfileInsert = Omit<ProfileRow, 'created_at' | 'updated_at'> & {
  is_active?: boolean
}

export type ProfileUpdate = Partial<Omit<ProfileRow, 'id' | 'created_at'>>

// ─── gym_branding ─────────────────────────────────────────────────────────────

export interface GymBrandingRow {
  gym_id: string
  primary_color: string
  secondary_color: string
  logo_url: string | null
  updated_at: string
}

export type GymBrandingInsert = Omit<GymBrandingRow, 'updated_at'>

export type GymBrandingUpdate = Partial<Omit<GymBrandingRow, 'gym_id'>>

// ─── exercises ────────────────────────────────────────────────────────────────

export interface ExerciseRow {
  id: string
  gym_id: string
  name: string
  description: string | null
  muscle_group: MuscleGroup
  video_url: string | null
  video_duration: number | null
  thumbnail_url: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type ExerciseInsert = Omit<ExerciseRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  is_active?: boolean
}

export type ExerciseUpdate = Partial<Omit<ExerciseRow, 'id' | 'gym_id' | 'created_at'>>

// ─── routines ────────────────────────────────────────────────────────────────

export interface RoutineRow {
  id: string
  gym_id: string
  name: string
  days_per_week: 3 | 4 | 5
  total_weeks: number | null
  description: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type RoutineInsert = Omit<RoutineRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  is_active?: boolean
}

export type RoutineUpdate = Partial<Omit<RoutineRow, 'id' | 'gym_id' | 'created_at'>>

// ─── routine_days ─────────────────────────────────────────────────────────────

export interface RoutineDayRow {
  id: string
  routine_id: string
  gym_id: string
  day_number: number
  name: string
  created_at: string
}

export type RoutineDayInsert = Omit<RoutineDayRow, 'id' | 'created_at'>

export type RoutineDayUpdate = Partial<Pick<RoutineDayRow, 'name'>>

// ─── routine_day_exercises ────────────────────────────────────────────────────

export interface RoutineDayExerciseRow {
  id: string
  routine_day_id: string
  gym_id: string
  exercise_id: string
  sort_order: number
  sets: number
  reps: string
  suggested_weight: number | null
  notes: string | null
  created_at: string
}

export type RoutineDayExerciseInsert = Omit<RoutineDayExerciseRow, 'id' | 'created_at'>

export type RoutineDayExerciseUpdate = Partial<
  Pick<RoutineDayExerciseRow, 'sort_order' | 'sets' | 'reps' | 'suggested_weight' | 'notes'>
>

// ─── client_routine_assignments ───────────────────────────────────────────────

export interface ClientRoutineAssignmentRow {
  id: string
  gym_id: string
  client_id: string
  routine_id: string
  assigned_by: string | null
  assigned_at: string
  is_active: boolean
  notes: string | null
}

export type ClientRoutineAssignmentInsert = Omit<
  ClientRoutineAssignmentRow,
  'id' | 'assigned_at'
> & { is_active?: boolean }

export type ClientRoutineAssignmentUpdate = Partial<
  Pick<ClientRoutineAssignmentRow, 'is_active' | 'notes'>
>

// ─── workout_sessions ─────────────────────────────────────────────────────────

export interface WorkoutSessionRow {
  id: string
  gym_id: string
  client_id: string
  routine_id: string | null
  routine_day_id: string | null
  started_at: string
  finished_at: string | null
  notes: string | null
}

export type WorkoutSessionInsert = Omit<WorkoutSessionRow, 'id' | 'started_at'> & {
  id?: string
  started_at?: string
}

export type WorkoutSessionUpdate = Partial<
  Pick<WorkoutSessionRow, 'finished_at' | 'notes'>
>

// ─── workout_set_logs ─────────────────────────────────────────────────────────

export interface WorkoutSetLogRow {
  id: string
  gym_id: string
  session_id: string
  exercise_id: string
  set_number: number
  reps: number | null
  weight_kg: number | null
  logged_at: string
}

export type WorkoutSetLogInsert = Omit<WorkoutSetLogRow, 'id' | 'logged_at'> & {
  id?: string
  logged_at?: string
}

export type WorkoutSetLogUpdate = Partial<Pick<WorkoutSetLogRow, 'reps' | 'weight_kg'>>

// ─── body_measurements ────────────────────────────────────────────────────────

export interface BodyMeasurementRow {
  id: string
  gym_id: string
  client_id: string
  measured_at: string
  weight_kg: number | null
  height_cm: number | null
  body_fat_pct: number | null
  chest_cm: number | null
  waist_cm: number | null
  hips_cm: number | null
  bicep_cm: number | null
  thigh_cm: number | null
  notes: string | null
  created_at: string
}

export type BodyMeasurementInsert = Omit<BodyMeasurementRow, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
  measured_at?: string
}

export type BodyMeasurementUpdate = Partial<
  Omit<BodyMeasurementRow, 'id' | 'gym_id' | 'client_id' | 'created_at'>
>

// ─── gym_invitations ──────────────────────────────────────────────────────────

export interface GymInvitationRow {
  id: string
  gym_id: string
  token: string
  role: string
  created_by: string
  used_by: string | null
  used_at: string | null
  expires_at: string | null
  created_at: string
}

export type GymInvitationInsert = Omit<GymInvitationRow, 'id' | 'token' | 'used_by' | 'used_at' | 'created_at'> & {
  id?: string
  token?: string
  expires_at?: string | null
}

export type GymInvitationUpdate = Partial<Pick<GymInvitationRow, 'used_by' | 'used_at'>>
