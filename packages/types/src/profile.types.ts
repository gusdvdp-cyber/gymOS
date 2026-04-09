import type { ProfileRow } from './database.types'
import type { GymRow } from './database.types'

export type Profile = ProfileRow

export interface ProfileWithGym extends ProfileRow {
  gyms: Pick<GymRow, 'id' | 'name' | 'slug' | 'plan'> | null
}

export interface UpdateProfilePayload {
  firstName?: string
  lastName?: string
  phone?: string
  avatarUrl?: string
}
