import {
  APP_PERMISSION_LEAF_MODULES,
  BITRIX_STANDARD_ACTIONS,
} from '@/src/constants/permissions-page-matrix'
import { BITRIX_SCOPE_DROPDOWN_OPTIONS } from '@/src/constants/role-catalog'
import { BITRIX_GRID_ROLE_IDS } from '@/src/constants/bitrix-access-ui'
import { MOCK_ROLES } from '@/src/mock-data/roles'
import type {
  BitrixAccessGrants,
  BitrixBooleanGrants,
  BitrixPermissionsPersistPayload,
  BitrixStandardAction,
  PermissionMatrixModule,
  ScopeGrantValue,
} from '@/src/types/permissions-page'
import type { DataScopeId, RoleListItem } from '@/src/types/user-management'

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

const VIEWER_READ_MODULES = ['earth', 'dashboard', 'reports', 'alerts'] as const

const OPS_MANAGER_MODULES = [
  'camera_devices',
  'camera_groups',
  'camera_recording',
  'reports',
  'dashboard',
] as const

const FINANCE_MODULES = ['reports'] as const

const AUDITOR_MODULES = ['um_users', 'um_groups', 'um_roles', 'um_permissions'] as const

const ALL_ACTIONS: BitrixStandardAction[] = [...BITRIX_STANDARD_ACTIONS]

export function getInitialGridRoles(): RoleListItem[] {
  return BITRIX_GRID_ROLE_IDS.map((id) => MOCK_ROLES.find((r) => r.id === id)).filter(
    (r): r is RoleListItem => r != null,
  )
}

function forEachLeafModule(fn: (mod: PermissionMatrixModule) => void): void {
  for (const mod of APP_PERMISSION_LEAF_MODULES) fn(mod)
}

export function appendRoleToScopeGrants(
  grants: BitrixAccessGrants,
  roleId: string,
  defaultScope: ScopeGrantValue = 'deny',
): BitrixAccessGrants {
  const next = cloneBitrixGrants(grants)
  forEachLeafModule((mod) => {
    if (!next[mod.id]) next[mod.id] = {}
    for (const action of BITRIX_STANDARD_ACTIONS) {
      if (!next[mod.id][action]) next[mod.id][action] = {}
      next[mod.id][action][roleId] = defaultScope
    }
  })
  return next
}

export function appendRoleToBooleanGrants(
  grants: BitrixBooleanGrants,
  roleId: string,
  defaultValue = false,
): BitrixBooleanGrants {
  return cloneBooleanGrants(grants)
}

export function removeRoleFromScopeGrants(
  grants: BitrixAccessGrants,
  roleId: string,
): BitrixAccessGrants {
  const next = cloneBitrixGrants(grants)
  forEachLeafModule((mod) => {
    const moduleGrants = next[mod.id]
    if (!moduleGrants) return
    for (const action of BITRIX_STANDARD_ACTIONS) {
      const actionGrants = moduleGrants[action]
      if (!actionGrants || !(roleId in actionGrants)) continue
      const { [roleId]: _removed, ...rest } = actionGrants
      moduleGrants[action] = rest
    }
  })
  return next
}

export function removeRoleFromBooleanGrants(
  grants: BitrixBooleanGrants,
  roleId: string,
): BitrixBooleanGrants {
  return cloneBooleanGrants(grants)
}

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
  forEachLeafModule((mod) => {
    grants[mod.id] = {}
    for (const action of BITRIX_STANDARD_ACTIONS) {
      grants[mod.id][action] = {}
      for (const role of MOCK_ROLES) {
        grants[mod.id][action][role.id] = 'deny'
      }
    }
  })
  return grants
}

export function createEmptyBooleanGrants(): BitrixBooleanGrants {
  return {}
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
  return grants
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
  _grants: BitrixBooleanGrants,
  _moduleId: string,
  _permId: string,
  _roleId: string,
): boolean {
  return false
}

function grantModuleActions(
  grants: BitrixAccessGrants,
  roleId: string,
  moduleIds: readonly string[],
  actions: readonly BitrixStandardAction[],
  scope: ScopeGrantValue,
): void {
  for (const moduleId of moduleIds) {
    if (!grants[moduleId]) continue
    for (const action of actions) {
      if (!grants[moduleId][action]) continue
      grants[moduleId][action][roleId] = scope
    }
  }
}

function buildSeedBitrixGrants(): BitrixAccessGrants {
  const grants = createEmptyBitrixGrants()

  for (const role of MOCK_ROLES) {
    const defaultScope = ROLE_DEFAULT_SCOPES[role.id] ?? 'own_records'

    if (isSystemRole(role.id)) {
      const fullScope: ScopeGrantValue =
        role.id === 'role-super-admin' ? 'global_all_tenants' : 'all_tenant_data'
      forEachLeafModule((mod) => {
        for (const action of BITRIX_STANDARD_ACTIONS) {
          grants[mod.id][action][role.id] = fullScope
        }
      })
      continue
    }

    if (role.id === 'role-viewer') {
      grantModuleActions(grants, role.id, VIEWER_READ_MODULES, ['read'], 'own_records')
      continue
    }

    if (role.id === 'role-operations-manager') {
      grantModuleActions(
        grants,
        role.id,
        OPS_MANAGER_MODULES,
        ['read', 'add', 'edit'],
        defaultScope,
      )
      continue
    }

    if (role.id === 'role-finance-country') {
      grantModuleActions(grants, role.id, FINANCE_MODULES, ['read', 'export'], 'country')
      continue
    }

    if (role.id === 'role-auditor') {
      grantModuleActions(grants, role.id, AUDITOR_MODULES, ['read'], 'all_tenant_data')
      continue
    }
  }

  return grants
}

export const SEED_BITRIX_GRANTS = buildSeedBitrixGrants()
export const SEED_BOOLEAN_GRANTS: BitrixBooleanGrants = {}

export function createSeedBitrixGrants(): BitrixAccessGrants {
  return cloneBitrixGrants(SEED_BITRIX_GRANTS)
}

export function createSeedBooleanGrants(): BitrixBooleanGrants {
  return {}
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

export function getStandardActionsForModule(_module: PermissionMatrixModule): readonly string[] {
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
