import type { GymBrandingRow, GymRow } from './database.types'
import type { GymPlan, GymStatus } from './enums'

export type Gym = GymRow

export type GymBranding = GymBrandingRow

export interface GymWithBranding extends GymRow {
  gym_branding: GymBrandingRow | null
}

export interface CreateGymPayload {
  name: string
  slug: string
  plan: GymPlan
  email?: string
  phone?: string
  address?: string
  adminEmail: string
  adminPassword: string
  adminFirstName: string
  adminLastName: string
}

export interface UpdateGymPayload {
  name?: string
  plan?: GymPlan
  status?: GymStatus
  email?: string
  phone?: string
  address?: string
}

export interface UpsertBrandingPayload {
  gymId: string
  primaryColor: string
  secondaryColor: string
  logoFile?: File
}
