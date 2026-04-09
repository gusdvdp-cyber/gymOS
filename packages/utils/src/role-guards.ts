import type { UserRole } from '@gymos/types'
import { ROLES_HIERARCHY } from './constants'

export function isSuperAdmin(role: UserRole): boolean {
  return role === 'superadmin'
}

export function isAdmin(role: UserRole): boolean {
  return role === 'admin' || role === 'superadmin'
}

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLES_HIERARCHY[userRole] >= ROLES_HIERARCHY[requiredRole]
}

export function canManageGym(role: UserRole): boolean {
  return role === 'admin' || role === 'superadmin'
}

export function canManageRoutines(role: UserRole): boolean {
  return role === 'profe' || role === 'admin' || role === 'superadmin'
}
