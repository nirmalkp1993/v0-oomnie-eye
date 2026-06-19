import type { UserAuditEntry, UserGroupOption, UserRoleOption } from '@/src/types/user-management'

/** Applied automatically when no roles are explicitly assigned. */
export const DEFAULT_USER_ROLE_ID = 'viewer'

export const AVAILABLE_USER_ROLES: UserRoleOption[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Platform-wide access across all tenants.',
  },
  {
    id: 'tenant_admin',
    name: 'Tenant Admin',
    description: 'Full control within this tenant.',
  },
  {
    id: 'operations_manager',
    name: 'Operations Manager',
    description: 'Manage operations data and workflows.',
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to assigned resources.',
  },
]

export const AVAILABLE_USER_GROUPS: UserGroupOption[] = [
  {
    id: 'operations',
    name: 'Operations',
    description: 'Operations team membership.',
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Security and compliance workflows.',
  },
  {
    id: 'emea_finance',
    name: 'EMEA Finance',
    description: 'Finance users in the EMEA region.',
  },
]

export const MOCK_USER_AUDIT: UserAuditEntry[] = [
  {
    id: 'audit-1',
    actionType: 'READ & VIEW',
    description: 'User profile viewed',
    details: 'users / user',
    date: '2024-05-23',
    category: 'read_view',
  },
  {
    id: 'audit-2',
    actionType: 'READ & VIEW',
    description: 'User record viewed from list',
    details: 'users / list',
    date: '2024-05-22',
    category: 'read_view',
  },
  {
    id: 'audit-3',
    actionType: 'ADMIN DATA ADDED',
    description: 'Role assignments updated',
    details: 'users / roles',
    date: '2024-05-20',
    category: 'admin_data_add',
  },
]

export function roleNameToCatalogId(name: string): string | null {
  const match = AVAILABLE_USER_ROLES.find(
    (r) => r.name.toLowerCase() === name.trim().toLowerCase()
  )
  return match?.id ?? null
}

export function catalogIdToRoleName(id: string): string | null {
  return AVAILABLE_USER_ROLES.find((r) => r.id === id)?.name ?? null
}

export function catalogIdsToRoleNames(ids: string[]): string[] {
  const names: string[] = []
  for (const id of ids) {
    const name = AVAILABLE_USER_ROLES.find((role) => role.id === id)?.name
    if (name) names.push(name)
  }
  return names
}

export function getDefaultUserRole(): UserRoleOption {
  return (
    AVAILABLE_USER_ROLES.find((role) => role.id === DEFAULT_USER_ROLE_ID) ?? AVAILABLE_USER_ROLES[3]!
  )
}

/** Roles shown in the picker — default role is never selectable. */
export function getAssignableUserRoles(): UserRoleOption[] {
  return AVAILABLE_USER_ROLES.filter((role) => role.id !== DEFAULT_USER_ROLE_ID)
}

export function resolveEffectiveUserRoleIds(roleIds: string[]): string[] {
  return roleIds.length > 0 ? roleIds : [DEFAULT_USER_ROLE_ID]
}

export function userRolesToFormRoleIds(roleNames: string[]): string[] {
  const catalogIds = roleNames
    .map((name) => roleNameToCatalogId(name))
    .filter((id): id is string => Boolean(id))

  if (catalogIds.length === 0) return []

  if (catalogIds.length === 1 && catalogIds[0] === DEFAULT_USER_ROLE_ID) {
    return []
  }

  return catalogIds.filter((id) => id !== DEFAULT_USER_ROLE_ID)
}

export function groupNameToCatalogId(name: string): string | null {
  const match = AVAILABLE_USER_GROUPS.find(
    (g) => g.name.toLowerCase() === name.trim().toLowerCase()
  )
  return match?.id ?? null
}
