import type { RoleListItem } from '@/src/types/user-management'
import {
  clonePermissionMatrix,
  createEmptyPermissionMatrix,
  type PermissionMatrix,
  type PermissionModule,
} from '@/src/constants/permissions-matrix'

export const MOCK_ROLES: RoleListItem[] = [
  {
    id: 'role-super-admin',
    name: 'Super Admin',
    description: 'Platform-wide access across all tenants.',
    badges: ['system', 'high-risk'],
    iconVariant: 'shield-danger',
    userCount: 0,
    groupCount: 0,
    permissionCount: 48,
    dataScope: 'Global (all tenants)',
    status: 'active',
    lastUpdated: '2026-05-15',
  },
  {
    id: 'role-tenant-admin',
    name: 'Tenant Admin',
    description: 'Full control within this tenant.',
    badges: ['system'],
    iconVariant: 'shield-danger',
    userCount: 1,
    groupCount: 1,
    permissionCount: 32,
    dataScope: 'All tenant data',
    status: 'active',
    lastUpdated: '2026-05-14',
  },
  {
    id: 'role-operations-manager',
    name: 'Operations Manager',
    description: 'Manages day-to-day operations within their business unit.',
    badges: [],
    iconVariant: 'hexagon',
    userCount: 2,
    groupCount: 1,
    permissionCount: 18,
    dataScope: 'Business unit',
    status: 'active',
    lastUpdated: '2026-05-13',
  },
  {
    id: 'role-viewer',
    name: 'Viewer',
    description: 'Read-only access to assigned resources.',
    badges: [],
    iconVariant: 'hexagon',
    userCount: 3,
    groupCount: 2,
    permissionCount: 8,
    dataScope: 'Own records',
    status: 'active',
    lastUpdated: '2026-05-12',
  },
  {
    id: 'role-finance-country',
    name: 'Finance Manager - Country',
    description: 'Finance scope limited to assigned countries.',
    badges: [],
    iconVariant: 'hexagon',
    userCount: 1,
    groupCount: 0,
    permissionCount: 14,
    dataScope: 'Country',
    status: 'active',
    lastUpdated: '2026-05-11',
  },
  {
    id: 'role-auditor',
    name: 'Auditor',
    description: 'Read-only access for audit and compliance review.',
    badges: [],
    iconVariant: 'hexagon',
    userCount: 0,
    groupCount: 0,
    permissionCount: 6,
    dataScope: 'All tenant data',
    status: 'inactive',
    lastUpdated: '2026-04-28',
  },
]

import type { PermissionColumn, PermissionMatrix, PermissionModule } from '@/src/constants/permissions-matrix'

function setModule(
  matrix: PermissionMatrix,
  mod: PermissionModule,
  cols: Partial<Record<PermissionColumn, boolean>>,
): void {
  for (const col of Object.keys(cols) as PermissionColumn[]) {
    const value = cols[col]
    if (value) matrix[mod][col] = true
  }
}

function buildRolePermissions(roleId: string): PermissionMatrix {
  const matrix = createEmptyPermissionMatrix()

  if (roleId === 'role-super-admin' || roleId === 'role-tenant-admin') {
    for (const mod of Object.keys(matrix) as PermissionModule[]) {
      setModule(matrix, mod, {
        Create: true,
        View: true,
        Update: true,
        Delete: true,
        Export: true,
        Assign: true,
      })
    }
    return matrix
  }

  if (roleId === 'role-viewer') {
    setModule(matrix, 'Earth', { View: true })
    setModule(matrix, 'Dashboard', { View: true })
    setModule(matrix, 'Reports', { View: true })
    setModule(matrix, 'Alerts', { View: true })
    return matrix
  }

  if (roleId === 'role-operations-manager') {
    setModule(matrix, 'Dashboard', { View: true, Update: true })
    setModule(matrix, 'Reports', { View: true, Export: true })
    setModule(matrix, 'Camera', { View: true, Update: true })
    setModule(matrix, 'Camera Group', { View: true, Update: true })
    setModule(matrix, 'Camera Recording', { View: true, Update: true })
    setModule(matrix, 'Alerts', { View: true })
    return matrix
  }

  if (roleId === 'role-finance-country') {
    setModule(matrix, 'Reports', { View: true, Export: true })
    return matrix
  }

  if (roleId === 'role-auditor') {
    setModule(matrix, 'Users', { View: true })
    setModule(matrix, 'Groups', { View: true })
    setModule(matrix, 'Roles', { View: true })
    setModule(matrix, 'Permissions', { View: true })
    return matrix
  }

  return matrix
}

/** Per-role permission matrices aligned with app modules. */
export const MOCK_ROLE_PERMISSIONS: Record<string, PermissionMatrix> = Object.fromEntries(
  MOCK_ROLES.map((r) => [r.id, clonePermissionMatrix(buildRolePermissions(r.id))]),
)
