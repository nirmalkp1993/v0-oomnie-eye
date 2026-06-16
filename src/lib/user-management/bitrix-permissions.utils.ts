import {
  BITRIX_ACCESS_MODULES,
  BITRIX_STANDARD_ACTIONS,
  createAdminMatrixGrants,
  createEmptyMatrixGrants,
} from '@/src/constants/permissions-page-matrix'
import { BITRIX_SCOPE_DROPDOWN_OPTIONS } from '@/src/constants/role-catalog'
import { BITRIX_GRID_ROLE_IDS } from '@/src/constants/bitrix-access-ui'
import { MOCK_ROLES } from '@/src/mock-data/roles'
import type {
  BitrixAccessGrants,
  BitrixBooleanGrants,
  BitrixPermissionsPersistPayload,
  BitrixStandardAction,
  MatrixAction,
  MatrixGrants,
  PermissionMatrixModule,
  ScopeGrantValue,
} from '@/src/types/permissions-page'
import type { DataScopeId, RoleListItem } from '@/src/types/user-management'

const ACTION_TO_MATRIX: Partial<Record<BitrixStandardAction, MatrixAction>> = {
  read: 'read',
  add: 'create',
  edit: 'edit',
  delete: 'delete',
  export: 'export',
  import: 'import',
}

const ROLE_DEFAULT_SCOPES: Record<string, ScopeGrantValue> = {
  'role-super-admin': 'global_all_tenants',
  'role-tenant-admin': 'all_tenant_data',
  'role-operations-manager': 'department',
  'role-viewer': 'own_records',
  'role-finance-country': 'country',
  'role-auditor': 'all_tenant_data',
}

const SYSTEM_ROLE_IDS = new Set(['role-super-admin', 'role-tenant-admin'])

const SCOPE_LABEL_BY_ID = new Map(
  BITRIX_SCOPE_DROPDOWN_OPTIONS.map((o) => [o.id, o.title] as const),
)

export function getInitialGridRoles(): RoleListItem[] {
  return BITRIX_GRID_ROLE_IDS.map((id) => MOCK_ROLES.find((r) => r.id === id)).filter(
    (r): r is RoleListItem => r != null,
  )
}

/** Seed scope/boolean grant columns for a newly added grid role (defaults to deny / off). */
export function appendRoleToScopeGrants(
  grants: BitrixAccessGrants,
  roleId: string,
  defaultScope: ScopeGrantValue = 'deny',
): BitrixAccessGrants {
  const next = cloneBitrixGrants(grants)
  for (const mod of BITRIX_ACCESS_MODULES) {
    if (!next[mod.id]) next[mod.id] = {}
    for (const action of BITRIX_STANDARD_ACTIONS) {
      if (!next[mod.id][action]) next[mod.id][action] = {}
      next[mod.id][action][roleId] = defaultScope
    }
  }
  return next
}

export function appendRoleToBooleanGrants(
  grants: BitrixBooleanGrants,
  roleId: string,
  defaultValue = false,
): BitrixBooleanGrants {
  const next = cloneBooleanGrants(grants)
  for (const mod of BITRIX_ACCESS_MODULES) {
    if (!mod.booleanPermissions?.length) continue
    if (!next[mod.id]) next[mod.id] = {}
    for (const perm of mod.booleanPermissions) {
      if (!next[mod.id][perm.id]) next[mod.id][perm.id] = {}
      next[mod.id][perm.id][roleId] = defaultValue
    }
  }
  return next
}

/** Remove a role column from scope grants. */
export function removeRoleFromScopeGrants(
  grants: BitrixAccessGrants,
  roleId: string,
): BitrixAccessGrants {
  const next = cloneBitrixGrants(grants)
  for (const mod of BITRIX_ACCESS_MODULES) {
    const moduleGrants = next[mod.id]
    if (!moduleGrants) continue
    for (const action of BITRIX_STANDARD_ACTIONS) {
      const actionGrants = moduleGrants[action]
      if (!actionGrants || !(roleId in actionGrants)) continue
      const { [roleId]: _removed, ...rest } = actionGrants
      moduleGrants[action] = rest
    }
  }
  return next
}

/** Remove a role column from boolean grants. */
export function removeRoleFromBooleanGrants(
  grants: BitrixBooleanGrants,
  roleId: string,
): BitrixBooleanGrants {
  const next = cloneBooleanGrants(grants)
  for (const mod of BITRIX_ACCESS_MODULES) {
    const moduleGrants = next[mod.id]
    if (!moduleGrants) continue
    for (const perm of mod.booleanPermissions ?? []) {
      const permGrants = moduleGrants[perm.id]
      if (!permGrants || !(roleId in permGrants)) continue
      const { [roleId]: _removed, ...rest } = permGrants
      moduleGrants[perm.id] = rest
    }
  }
  return next
}

/** Built-in grid roles and system roles cannot be removed from the access grid. */
export function isDeletableGridRole(roleId: string): boolean {
  if (isSystemRole(roleId)) return false
  return !(BITRIX_GRID_ROLE_IDS as readonly string[]).includes(roleId)
}

export function isSystemRole(roleId: string): boolean {
  return SYSTEM_ROLE_IDS.has(roleId)
}

export function formatScopeGrantLabel(value: ScopeGrantValue | ScopeGrantValue[]): string {
  const values = Array.isArray(value) ? value : [value]
  if (values.length === 0) return 'Deny access'
  if (values.length === 1) {
    return SCOPE_LABEL_BY_ID.get(values[0]) ?? String(values[0])
  }
  const first = SCOPE_LABEL_BY_ID.get(values[0]) ?? String(values[0])
  return `${first}… and ${values.length - 1} more`
}

export function normalizeScopeValue(
  value: ScopeGrantValue | ScopeGrantValue[] | undefined,
): ScopeGrantValue {
  if (value == null) return 'deny'
  if (Array.isArray(value)) return value[0] ?? 'deny'
  return value
}

export function createEmptyBitrixGrants(): BitrixAccessGrants {
  const grants: BitrixAccessGrants = {}
  for (const mod of BITRIX_ACCESS_MODULES) {
    grants[mod.id] = {}
    for (const action of BITRIX_STANDARD_ACTIONS) {
      grants[mod.id][action] = {}
      for (const role of MOCK_ROLES) {
        grants[mod.id][action][role.id] = 'deny'
      }
    }
  }
  return grants
}

export function createEmptyBooleanGrants(): BitrixBooleanGrants {
  const grants: BitrixBooleanGrants = {}
  for (const mod of BITRIX_ACCESS_MODULES) {
    if (!mod.booleanPermissions?.length) continue
    grants[mod.id] = {}
    for (const perm of mod.booleanPermissions) {
      grants[mod.id][perm.id] = {}
      for (const role of MOCK_ROLES) {
        grants[mod.id][perm.id][role.id] = false
      }
    }
  }
  return grants
}

function matrixActionGranted(matrixGrants: MatrixGrants, moduleId: string, action: BitrixStandardAction): boolean {
  const matrixAction = ACTION_TO_MATRIX[action]
  if (!matrixAction) return false
  const set = matrixGrants[moduleId]
  if (!set) return false
  return set.has(matrixAction) || (action === 'read' && set.has('view'))
}

/** Convert legacy checkbox grants to Bitrix scope grants for seeding. */
export function matrixGrantsToBitrix(
  matrixGrants: MatrixGrants,
  roleId: string,
  defaultScope: ScopeGrantValue = 'all_tenant_data',
): BitrixAccessGrants {
  const partial: BitrixAccessGrants = {}
  for (const mod of BITRIX_ACCESS_MODULES) {
    partial[mod.id] = {}
    for (const action of BITRIX_STANDARD_ACTIONS) {
      partial[mod.id][action] = {
        [roleId]: matrixActionGranted(matrixGrants, mod.id, action) ? defaultScope : 'deny',
      }
    }
  }
  return partial
}

function mergeBitrixGrants(base: BitrixAccessGrants, overlay: BitrixAccessGrants): BitrixAccessGrants {
  const next = cloneBitrixGrants(base)
  for (const [moduleId, actions] of Object.entries(overlay)) {
    if (!next[moduleId]) next[moduleId] = {}
    for (const [action, roles] of Object.entries(actions)) {
      if (!next[moduleId][action]) next[moduleId][action] = {}
      Object.assign(next[moduleId][action], roles)
    }
  }
  return next
}

export function cloneBitrixGrants(source: BitrixAccessGrants): BitrixAccessGrants {
  const next: BitrixAccessGrants = {}
  for (const [moduleId, actions] of Object.entries(source)) {
    next[moduleId] = {}
    for (const [action, roles] of Object.entries(actions)) {
      next[moduleId][action] = { ...roles }
    }
  }
  return next
}

export function cloneBooleanGrants(source: BitrixBooleanGrants): BitrixBooleanGrants {
  const next: BitrixBooleanGrants = {}
  for (const [moduleId, perms] of Object.entries(source)) {
    next[moduleId] = {}
    for (const [permId, roles] of Object.entries(perms)) {
      next[moduleId][permId] = { ...roles }
    }
  }
  return next
}

export function setBitrixGrant(
  grants: BitrixAccessGrants,
  moduleId: string,
  action: string,
  roleId: string,
  value: ScopeGrantValue,
): BitrixAccessGrants {
  const current = grants[moduleId]?.[action]?.[roleId]
  if (current === value) return grants

  const moduleGrants = grants[moduleId]
  const actionGrants = moduleGrants?.[action]

  return {
    ...grants,
    [moduleId]: {
      ...moduleGrants,
      [action]: {
        ...actionGrants,
        [roleId]: value,
      },
    },
  }
}

export function setBooleanGrant(
  grants: BitrixBooleanGrants,
  moduleId: string,
  permId: string,
  roleId: string,
  value: boolean,
): BitrixBooleanGrants {
  const current = grants[moduleId]?.[permId]?.[roleId]
  if (current === value) return grants

  const moduleGrants = grants[moduleId]
  const permGrants = moduleGrants?.[permId]

  return {
    ...grants,
    [moduleId]: {
      ...moduleGrants,
      [permId]: {
        ...permGrants,
        [roleId]: value,
      },
    },
  }
}

export function getBitrixGrant(
  grants: BitrixAccessGrants,
  moduleId: string,
  action: string,
  roleId: string,
): ScopeGrantValue {
  return normalizeScopeValue(grants[moduleId]?.[action]?.[roleId])
}

export function getBooleanGrant(
  grants: BitrixBooleanGrants,
  moduleId: string,
  permId: string,
  roleId: string,
): boolean {
  return grants[moduleId]?.[permId]?.[roleId] ?? false
}

function applyMatrixOverlayInPlace(
  grants: BitrixAccessGrants,
  matrixGrants: MatrixGrants,
  roleId: string,
  defaultScope: ScopeGrantValue,
): void {
  for (const mod of BITRIX_ACCESS_MODULES) {
    for (const action of BITRIX_STANDARD_ACTIONS) {
      grants[mod.id][action][roleId] = matrixActionGranted(matrixGrants, mod.id, action)
        ? defaultScope
        : 'deny'
    }
  }
}

function buildSeedBitrixGrants(): BitrixAccessGrants {
  const grants = createEmptyBitrixGrants()
  const adminMatrix = createAdminMatrixGrants()

  for (const role of MOCK_ROLES) {
    const defaultScope = ROLE_DEFAULT_SCOPES[role.id] ?? 'own_records'

    if (isSystemRole(role.id)) {
      const fullScope: ScopeGrantValue =
        role.id === 'role-super-admin' ? 'global_all_tenants' : 'all_tenant_data'
      for (const mod of BITRIX_ACCESS_MODULES) {
        for (const action of BITRIX_STANDARD_ACTIONS) {
          grants[mod.id][action][role.id] = fullScope
        }
      }
      continue
    }

    if (role.id === 'role-viewer') {
      const empty = createEmptyMatrixGrants()
      applyMatrixOverlayInPlace(
        grants,
        {
          ...empty,
          customer_master: new Set(['read'] as MatrixAction[]),
          vendor_master: new Set(['read'] as MatrixAction[]),
          expense_claims: new Set(['read'] as MatrixAction[]),
          reports_catalog: new Set(['read'] as MatrixAction[]),
          audit_trail: new Set(['read'] as MatrixAction[]),
          finance_overview: new Set(['view', 'read'] as MatrixAction[]),
        },
        role.id,
        'own_records',
      )
      continue
    }

    if (role.id === 'role-operations-manager') {
      const empty = createEmptyMatrixGrants()
      applyMatrixOverlayInPlace(
        grants,
        {
          ...empty,
          work_orders: new Set(['read', 'edit', 'manage'] as MatrixAction[]),
          inventory: new Set(['read', 'edit'] as MatrixAction[]),
          timesheets: new Set(['read', 'create'] as MatrixAction[]),
          purchase_orders: new Set(['read', 'create', 'edit'] as MatrixAction[]),
          expense_claims: new Set(['read', 'manage'] as MatrixAction[]),
        },
        role.id,
        defaultScope,
      )
      continue
    }

    if (role.id === 'role-finance-country') {
      const empty = createEmptyMatrixGrants()
      applyMatrixOverlayInPlace(
        grants,
        {
          ...empty,
          invoice_processing: new Set(['read', 'create', 'edit'] as MatrixAction[]),
          payment_runs: new Set(['read'] as MatrixAction[]),
          expense_claims: new Set(['read', 'export'] as MatrixAction[]),
          finance_overview: new Set(['view', 'read'] as MatrixAction[]),
        },
        role.id,
        'country',
      )
      continue
    }

    if (role.id === 'role-auditor') {
      const empty = createEmptyMatrixGrants()
      applyMatrixOverlayInPlace(
        grants,
        {
          ...empty,
          audit_trail: new Set(['read', 'export'] as MatrixAction[]),
          reports_catalog: new Set(['read'] as MatrixAction[]),
          user_admin: new Set(['read'] as MatrixAction[]),
        },
        role.id,
        'all_tenant_data',
      )
      continue
    }

    applyMatrixOverlayInPlace(grants, adminMatrix, role.id, defaultScope)
  }

  return grants
}

function buildSeedBooleanGrants(): BitrixBooleanGrants {
  const grants = createEmptyBooleanGrants()
  for (const mod of BITRIX_ACCESS_MODULES) {
    if (!mod.booleanPermissions) continue
    for (const perm of mod.booleanPermissions) {
      for (const role of MOCK_ROLES) {
        grants[mod.id][perm.id][role.id] =
          isSystemRole(role.id) || role.id === 'role-operations-manager'
      }
    }
  }
  return grants
}

/** Built once at module load — avoids thousands of clones on mount. */
export const SEED_BITRIX_GRANTS = buildSeedBitrixGrants()
export const SEED_BOOLEAN_GRANTS = buildSeedBooleanGrants()

/** Seed grants from MOCK_ROLES + admin matrix preset. */
export function createSeedBitrixGrants(): BitrixAccessGrants {
  return cloneBitrixGrants(SEED_BITRIX_GRANTS)
}

export function createSeedBooleanGrants(): BitrixBooleanGrants {
  return cloneBooleanGrants(SEED_BOOLEAN_GRANTS)
}

export function serializeBitrixPermissions(
  scopeGrants: BitrixAccessGrants,
  booleanGrants: BitrixBooleanGrants,
): BitrixPermissionsPersistPayload {
  return {
    version: 1,
    scopeGrants,
    booleanGrants,
    updatedAt: new Date().toISOString(),
  }
}

export function deserializeBitrixPermissions(payload: BitrixPermissionsPersistPayload): {
  scopeGrants: BitrixAccessGrants
  booleanGrants: BitrixBooleanGrants
} {
  return {
    scopeGrants: cloneBitrixGrants(payload.scopeGrants),
    booleanGrants: cloneBooleanGrants(payload.booleanGrants),
  }
}

export function getStandardActionsForModule(module: PermissionMatrixModule): readonly string[] {
  if (module.resourceType === 'widget' || module.resourceType === 'form') {
    return ['read', 'edit'] as const
  }
  return BITRIX_STANDARD_ACTIONS
}

export function scopeRank(value: ScopeGrantValue): number {
  if (value === 'deny') return 0
  const order: DataScopeId[] = [
    'own_records',
    'assigned_records',
    'department',
    'office',
    'territory',
    'country',
    'public_data',
    'all_tenant_data',
    'global_all_tenants',
  ]
  const idx = order.indexOf(value as DataScopeId)
  return idx >= 0 ? idx + 1 : 1
}

export function mergeScopeValues(a: ScopeGrantValue, b: ScopeGrantValue): ScopeGrantValue {
  return scopeRank(a) >= scopeRank(b) ? a : b
}
