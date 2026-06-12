import type { UserAuditEntry, UserGroupOption, UserRoleOption } from '@/src/types/user-management'

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
    action: 'user.view',
    context: 'users / user',
    date: '2024-05-23',
    category: 'read_view',
  },
  {
    id: 'audit-2',
    action: 'users.list.view',
    context: 'users / list',
    date: '2024-05-22',
    category: 'read_view',
  },
  {
    id: 'audit-3',
    action: 'user.roles.update',
    context: 'users / roles',
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

export function groupNameToCatalogId(name: string): string | null {
  const match = AVAILABLE_USER_GROUPS.find(
    (g) => g.name.toLowerCase() === name.trim().toLowerCase()
  )
  return match?.id ?? null
}
