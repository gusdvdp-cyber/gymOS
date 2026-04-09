import type { GymBrandingRow } from '@gymos/types'
import { DEFAULT_BRANDING } from './constants'

export interface BrandingCSSVars {
  '--color-primary': string
  '--color-secondary': string
  '--color-accent': string
}

export function getBrandingCSSVars(branding: Partial<GymBrandingRow> | null): BrandingCSSVars {
  const primary = branding?.primary_color ?? DEFAULT_BRANDING.primary_color
  return {
    '--color-primary': primary,
    '--color-secondary': branding?.secondary_color ?? DEFAULT_BRANDING.secondary_color,
    '--color-accent': primary,
  }
}

export function mergeBranding(
  base: Omit<GymBrandingRow, 'gym_id' | 'logo_url' | 'updated_at'>,
  override: Partial<GymBrandingRow>
): typeof base {
  return {
    primary_color: override.primary_color ?? base.primary_color,
    secondary_color: override.secondary_color ?? base.secondary_color,
  }
}

export function isValidHexColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value)
}
