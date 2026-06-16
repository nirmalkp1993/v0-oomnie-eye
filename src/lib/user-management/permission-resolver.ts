import {
  APP_PERMISSION_LEAF_MODULES,
  BITRIX_ACTION_LABELS,
  BITRIX_STANDARD_ACTIONS,
} from '@/src/constants/permissions-page-matrix'
import { MOCK_GROUPS } from '@/src/mock-data/groups'
import { MOCK_ROLES } from '@/src/mock-data/roles'
import { MOCK_USERS } from '@/src/mock-data/users'
import {
  SEED_BITRIX_GRANTS,
  SEED_BOOLEAN_GRANTS,
  coerceScopeGrantValues,
  getBitrixGrantSelection,
  mergeScopeValues,
} from '@/src/lib/user-management/bitrix-permissions.utils'
import type { BitrixAccessGrants, BitrixBooleanGrants, ScopeGrantValue } from '@/src/types/permissions-page'
import type { EffectivePermissionRow } from '@/src/types/effective-preview'

export interface ResolvedEffectiveGrant {
  moduleId: string
  moduleName: string
  action: string
  actionLabel: string
  scope: ScopeGrantValue
  resourceType: string
}

export interface UserEffectivePermissions {
  userId: string
  userName: string
  roleIds: string[]
  roleNames: string[]
  grants: ResolvedEffectiveGrant[]
}

function roleNameToId(name: string): string | null {
  const role = MOCK_ROLES.find((r) => r.name === name)
  return role?.id ?? null
}

export function resolveUserRoleIds(userId: string, directRoles?: string[]): string[] {
  const user = MOCK_USERS.find((u) => u.id === userId)
  const roles = directRoles ?? user?.roles ?? []
  const ids = new Set<string>()
  for (const name of roles) {
    const id = roleNameToId(name)
    if (id) ids.add(id)
  }

  if (user) {
    for (const groupName of user.groups) {
      const group = MOCK_GROUPS.find((g) => g.name === groupName)
      if (!group) continue
      for (const inheritedName of group.inheritedRoles) {
        const id = roleNameToId(inheritedName)
        if (id) ids.add(id)
      }
    }
  }

  return [...ids]
}

function capitalizeAction(action: string): string {
  return BITRIX_ACTION_LABELS[action] ?? action.charAt(0).toUpperCase() + action.slice(1)
}

export function resolveEffectiveGrants(
  userId: string,
  scopeGrants: BitrixAccessGrants = SEED_BITRIX_GRANTS,
  _booleanGrants: BitrixBooleanGrants = SEED_BOOLEAN_GRANTS,
): UserEffectivePermissions {
  const user = MOCK_USERS.find((u) => u.id === userId) ?? MOCK_USERS[0]
  const roleIds = resolveUserRoleIds(userId, user?.roles ?? [])
  const roleNames = roleIds
    .map((id) => MOCK_ROLES.find((r) => r.id === id)?.name)
    .filter(Boolean) as string[]

  const grants: ResolvedEffectiveGrant[] = []

  for (const mod of APP_PERMISSION_LEAF_MODULES) {
    for (const action of BITRIX_STANDARD_ACTIONS) {
      let merged: ScopeGrantValue = 'deny'
      for (const roleId of roleIds) {
        const selection = getBitrixGrantSelection(scopeGrants, mod.id, action, roleId)
        for (const scope of coerceScopeGrantValues(selection)) {
          merged = mergeScopeValues(merged, scope)
        }
      }
      if (merged !== 'deny') {
        grants.push({
          moduleId: mod.id,
          moduleName: mod.displayName ?? mod.name,
          action,
          actionLabel: capitalizeAction(action),
          scope: merged,
          resourceType: mod.resourceType,
        })
      }
    }
  }

  return {
    userId: user?.id ?? userId,
    userName: user?.name ?? 'Unknown',
    roleIds,
    roleNames,
    grants,
  }
}

export function toEffectivePreviewRows(
  resolved: UserEffectivePermissions,
): EffectivePermissionRow[] {
  return resolved.grants.map((g) => ({
    id: `${g.moduleId}-${g.action}`,
    resource: g.moduleName,
    resourceType: g.resourceType,
    module: g.moduleId,
    action: `${g.actionLabel} (${g.scope === 'deny' ? 'Deny' : g.scope.replace(/_/g, ' ')})`,
  }))
}

export function canAccessModuleAction(
  userId: string,
  moduleId: string,
  action: string,
  scopeGrants?: BitrixAccessGrants,
): boolean {
  const resolved = resolveEffectiveGrants(userId, scopeGrants)
  return resolved.grants.some(
    (g) => g.moduleId === moduleId && g.action === action && g.scope !== 'deny',
  )
}
