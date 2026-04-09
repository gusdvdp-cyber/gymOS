import type { GymBrandingRow } from '@gymos/types'

export const DEFAULT_BRANDING: Omit<GymBrandingRow, 'gym_id' | 'logo_url' | 'updated_at'> = {
  primary_color: '#e8ff47',
  secondary_color: '#0d0d0d',
}

export const ROLES_HIERARCHY = {
  superadmin: 4,
  admin: 3,
  profe: 2,
  cliente: 1,
} as const

export const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024 // 2MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']

export const GYM_ASSETS_BUCKET = 'gym-assets'
