import {
  flattenAppModuleTree,
  getAppPermissionLeafModules,
} from '@/src/mock-data/app-modules'
import type { MatrixAction, MatrixColumnKey, PermissionMatrixModule } from '@/src/types/permissions-page'

export const BITRIX_STANDARD_ACTIONS = [
  'read',
  'add',
  'edit',
  'delete',
  'export',
  'import',
] as const

export const BITRIX_ACTION_LABELS: Record<string, string> = {
  read: 'Read',
  add: 'Add',
  edit: 'Edit',
  delete: 'Delete',
  export: 'Export',
  import: 'Import',
}

/** Full app module tree flattened for grid and sidebar (headers + leaves). */
export const BITRIX_ACCESS_MODULES: PermissionMatrixModule[] = flattenAppModuleTree()

/** Leaf modules only — used for grant keys and legacy matrix. */
export const APP_PERMISSION_LEAF_MODULES: PermissionMatrixModule[] = getAppPermissionLeafModules()

/** @deprecated Use APP_PERMISSION_LEAF_MODULES */
export const PERMISSION_MATRIX_MODULES: PermissionMatrixModule[] = APP_PERMISSION_LEAF_MODULES

export const MATRIX_ACTIONS: MatrixAction[] = [
  'view',
  'read',
  'create',
  'edit',
  'delete',
  'admin',
  'export',
  'import',
  'print',
  'restore',
  'archive',
  'share',
  'manage',
]

export const MATRIX_COLUMNS: { key: MatrixColumnKey; labelKey: string }[] = [
  { key: 'all', labelKey: 'all' },
  { key: 'view', labelKey: 'view' },
  { key: 'read', labelKey: 'read' },
  { key: 'create', labelKey: 'create' },
  { key: 'edit', labelKey: 'edit' },
  { key: 'delete', labelKey: 'delete' },
  { key: 'admin', labelKey: 'admin' },
  { key: 'export', labelKey: 'export' },
  { key: 'import', labelKey: 'import' },
  { key: 'print', labelKey: 'print' },
  { key: 'restore', labelKey: 'restore' },
  { key: 'archive', labelKey: 'archive' },
  { key: 'share', labelKey: 'share' },
  { key: 'manage', labelKey: 'manage' },
]

export function createEmptyMatrixGrants(): Record<string, Set<MatrixAction>> {
  const grants: Record<string, Set<MatrixAction>> = {}
  APP_PERMISSION_LEAF_MODULES.forEach((m) => {
    grants[m.id] = new Set()
  })
  return grants
}

export function cloneGrants(
  source: Record<string, Set<MatrixAction>>,
): Record<string, Set<MatrixAction>> {
  const next: Record<string, Set<MatrixAction>> = {}
  for (const [moduleId, actions] of Object.entries(source)) {
    next[moduleId] = new Set(actions)
  }
  return next
}

export function getModuleDisplayName(module: PermissionMatrixModule): string {
  return module.displayName ?? module.name
}
