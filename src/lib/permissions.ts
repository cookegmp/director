import type { UserRole } from '@/types'

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    'view-dashboard',
    'create-ideas',
    'edit-ideas',
    'generate-charters',
    'view-charters',
    'control-builds',
    'advance-status',
    'file-issues',
    'manage-issues',
    'view-scaffolding',
    'view-technical',
    'access-admin',
    'manage-users',
    'configure-servers',
    'manage-ai-settings',
    'configure-translation',
  ],
  developer: [
    'view-dashboard',
    'create-ideas',
    'edit-ideas',
    'generate-charters',
    'view-charters',
    'control-builds',
    'advance-status',
    'file-issues',
    'manage-issues',
    'view-scaffolding',
    'view-technical',
  ],
  viewer: ['view-dashboard', 'view-charters', 'view-scaffolding', 'file-issues'],
}

export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function canAccessAdmin(role: UserRole): boolean {
  return hasPermission(role, 'access-admin')
}
