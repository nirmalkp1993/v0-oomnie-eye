import {
  APP_PERMISSION_LEAF_MODULES,
  BITRIX_STANDARD_ACTIONS,
} from '@/src/constants/permissions-page-matrix'
import { SCOPE_GRANT_LABELS } from '@/src/constants/role-catalog'
import { BITRIX_GRID_ROLE_IDS } from '@/src/constants/bitrix-access-ui'
import { MOCK_ROLES } from '@/src/mock-data/roles'
import type {
  BitrixAccessGrants,
  BitrixBooleanGrants,
  BitrixPermissionsPersistPayload,
  BitrixStandardAction,
  PermissionMatrixModule,
  ScopeGrantValue,
  ScopeGrantSelection,
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
  Object.entries(SCOPE_GRANT_LABELS).map(([id, title]) => [id, title] as const),
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

function isRoleNameTaken(roles: RoleListItem[], name: string, excludeId?: string): boolean {
  const normalized = name.trim().toLowerCase()
  return roles.some(
    (r) => r.id !== excludeId && r.name.trim().toLowerCase() === normalized,
  )
}

export function createBlankGridRole(existing: RoleListItem[]): RoleListItem {
  const baseName = 'New role'
  let name = baseName
  let suffix = 2
  while (isRoleNameTaken(existing, name)) {
    name = `${baseName} (${suffix++})`
  }

  return {
    id: `role-${Date.now()}`,
    name,
    description: '—',
    badges: [],
    iconVariant: 'hexagon',
    userCount: 0,
    groupCount: 0,
    permissionCount: 0,
    dataScope: '—',
    status: 'active',
    lastUpdated: new Date().toISOString().slice(0, 10),
  }
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

export function getScopeGrantLabels(value: ScopeGrantSelection | undefined): string[] {
  if (isScopeGrantDenied(value)) return [SCOPE_GRANT_LABELS.deny]
  return coerceScopeGrantValues(value).map((v) => SCOPE_LABEL_BY_ID.get(v) ?? String(v))
}

export function formatScopeGrantLabel(
  value: ScopeGrantSelection | undefined,
  options?: { compact?: boolean },
): string {
  const labels = getScopeGrantLabels(value)
  if (labels.length === 1) return labels[0]
  const joined = labels.join(', ')
  if (options?.compact === false || joined.length <= 34) return joined
  return `${labels[0]} +${labels.length - 1}`
}

export function coerceScopeGrantValues(value: ScopeGrantSelection | undefined): DataScopeId[] {
  if (value == null || value === 'deny') return []
  if (Array.isArray(value)) {
    return value.filter((v): v is DataScopeId => v !== 'deny')
  }
  return [value]
}

export function isScopeGrantDenied(value: ScopeGrantSelection | undefined): boolean {
  if (value == null || value === 'deny') return true
  if (Array.isArray(value)) return value.length === 0
  return false
}

export function isScopeOptionSelected(
  value: ScopeGrantSelection | undefined,
  optionId: ScopeGrantValue,
): boolean {
  if (optionId === 'deny') return isScopeGrantDenied(value)
  return coerceScopeGrantValues(value).includes(optionId)
}

export function toggleScopeGrantOption(
  current: ScopeGrantSelection | undefined,
  optionId: ScopeGrantValue,
): ScopeGrantSelection {
  if (optionId === 'deny') return 'deny'

  const selected = coerceScopeGrantValues(current)
  const next = selected.includes(optionId)
    ? selected.filter((id) => id !== optionId)
    : [...selected, optionId]

  return normalizeScopeSelection(next)
}

function normalizeScopeSelection(values: DataScopeId[]): ScopeGrantSelection {
  if (values.length === 0) return 'deny'
  const sorted = [...values].sort((a, b) => scopeRank(a) - scopeRank(b))
  if (sorted.length === 1) return sorted[0]
  return sorted
}

function scopeGrantSelectionsEqual(
  a: ScopeGrantSelection | undefined,
  b: ScopeGrantSelection,
): boolean {
  const key = (value: ScopeGrantSelection | undefined) => {
    if (value == null || value === 'deny') return 'deny'
    const ids = Array.isArray(value) ? value : [value]
    return ids.length === 0 ? 'deny' : [...ids].sort().join('|')
  }
  return key(a) === key(b)
}

export function normalizeScopeValue(
  value: ScopeGrantSelection | undefined,
): ScopeGrantValue {
  if (value == null) return 'deny'
  if (value === 'deny') return 'deny'
  if (Array.isArray(value)) {
    if (value.length === 0) return 'deny'
    return value.reduce((best, current) => mergeScopeValues(best, current), value[0])
  }
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
  value: ScopeGrantSelection,
): BitrixAccessGrants {
  const current = grants[moduleId]?.[action]?.[roleId]
  if (scopeGrantSelectionsEqual(current, value)) return grants

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

export function getBitrixGrantSelection(
  grants: BitrixAccessGrants,
  moduleId: string,
  action: string,
  roleId: string,
): ScopeGrantSelection {
  const raw = grants[moduleId]?.[action]?.[roleId]
  if (raw == null) return 'deny'
  return raw
}

export function getBitrixGrant(
  grants: BitrixAccessGrants,
  moduleId: string,
  action: string,
  roleId: string,
): ScopeGrantValue {
  return normalizeScopeValue(getBitrixGrantSelection(grants, moduleId, action, roleId))
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
    'department_subdepartments',
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

/** Set every scope grant for a role across all leaf modules and standard actions. */
export function setAllRoleScopeGrants(
  grants: BitrixAccessGrants,
  roleId: string,
  scope: ScopeGrantValue,
): BitrixAccessGrants {
  const next = cloneBitrixGrants(grants)
  forEachLeafModule((mod) => {
    if (!next[mod.id]) next[mod.id] = {}
    for (const action of BITRIX_STANDARD_ACTIONS) {
      if (!next[mod.id][action]) next[mod.id][action] = {}
      next[mod.id][action][roleId] = scope
    }
  })
  return next
}

/** Copy all scope grants from one role column to another. */
export function copyRoleScopeGrants(
  grants: BitrixAccessGrants,
  sourceRoleId: string,
  targetRoleId: string,
): BitrixAccessGrants {
  const next = cloneBitrixGrants(grants)
  forEachLeafModule((mod) => {
    const moduleGrants = next[mod.id]
    if (!moduleGrants) return
    for (const action of BITRIX_STANDARD_ACTIONS) {
      const actionGrants = moduleGrants[action]
      if (!actionGrants) continue
      const sourceValue = actionGrants[sourceRoleId]
      if (sourceValue !== undefined) {
        actionGrants[targetRoleId] = sourceValue
      }
    }
  })
  return next
}
