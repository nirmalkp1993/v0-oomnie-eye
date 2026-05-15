export const PERMISSION_MODULES = [
  'Earth',
  'Theme Management',
  'User Management',
  'Camera Management',
  'Asset Management',
  'Patrol Management',
  'IoT Management',
] as const

export const PERMISSION_COLUMNS = [
  'Create',
  'View',
  'Update',
  'Delete',
  'Export',
  'Assign',
] as const

export type PermissionModule = (typeof PERMISSION_MODULES)[number]
export type PermissionColumn = (typeof PERMISSION_COLUMNS)[number]

export type PermissionMatrix = Record<
  PermissionModule,
  Record<PermissionColumn, boolean>
>

export function createEmptyPermissionMatrix(): PermissionMatrix {
  return PERMISSION_MODULES.reduce((acc, mod) => {
    acc[mod] = PERMISSION_COLUMNS.reduce(
      (inner, col) => {
        inner[col] = false
        return inner
      },
      {} as Record<PermissionColumn, boolean>
    )
    return acc
  }, {} as PermissionMatrix)
}

export function clonePermissionMatrix(m: PermissionMatrix): PermissionMatrix {
  const o = createEmptyPermissionMatrix()
  for (const mod of PERMISSION_MODULES) {
    for (const col of PERMISSION_COLUMNS) {
      o[mod][col] = m[mod][col]
    }
  }
  return o
}
