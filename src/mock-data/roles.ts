import type { PermissionMatrix } from '@/src/constants/permissions-matrix'
import { createEmptyPermissionMatrix } from '@/src/constants/permissions-matrix'
import type { RoleRow } from '@/src/types/user-management'

export const MOCK_ROLES: RoleRow[] = [
  {
    id: 'r1',
    roleName: 'Super Admin',
    description: 'Full platform access including billing and org settings.',
    userCount: 3,
    createdDate: '2023-11-02',
  },
  {
    id: 'r2',
    roleName: 'Security Admin',
    description: 'Manage users, cameras, and patrol policies.',
    userCount: 11,
    createdDate: '2023-11-15',
  },
  {
    id: 'r3',
    roleName: 'Operator',
    description: 'Live monitoring, incident acknowledgement, and exports.',
    userCount: 42,
    createdDate: '2023-12-01',
  },
  {
    id: 'r4',
    roleName: 'Auditor',
    description: 'Read-only access to logs and compliance dashboards.',
    userCount: 8,
    createdDate: '2024-01-20',
  },
]

function seedMatrix(partial: Partial<Record<string, Partial<Record<string, boolean>>>>): PermissionMatrix {
  const base = createEmptyPermissionMatrix()
  for (const [mod, cols] of Object.entries(partial)) {
    if (!cols) continue
    for (const [col, val] of Object.entries(cols)) {
      const m = mod as keyof PermissionMatrix
      const c = col as keyof PermissionMatrix[typeof m]
      if (base[m] && c in base[m]) {
        base[m][c] = Boolean(val)
      }
    }
  }
  return base
}

/** Mock permission presets keyed by role id */
export const MOCK_ROLE_PERMISSIONS: Record<string, PermissionMatrix> = {
  r1: seedMatrix({
    Earth: { Create: true, View: true, Update: true, Delete: true, Export: true, Assign: true },
    'User Management': { Create: true, View: true, Update: true, Delete: true, Export: true, Assign: true },
    'Camera Management': { Create: true, View: true, Update: true, Delete: true, Export: true, Assign: true },
  }),
  r2: seedMatrix({
    Earth: { View: true, Update: true, Export: true },
    'User Management': { View: true, Update: true, Assign: true },
    'Camera Management': { Create: true, View: true, Update: true, Export: true, Assign: true },
    'Patrol Management': { Create: true, View: true, Update: true, Assign: true },
  }),
  r3: seedMatrix({
    Earth: { View: true, Export: true },
    'Camera Management': { View: true, Export: true },
    'Patrol Management': { View: true, Update: true },
  }),
  r4: seedMatrix({
    Earth: { View: true },
    'User Management': { View: true, Export: true },
    'Camera Management': { View: true },
    'Asset Management': { View: true, Export: true },
  }),
}
