import { BITRIX_ACCESS_MODULES, BITRIX_ACTION_LABELS } from '@/src/constants/permissions-page-matrix'
import { MOCK_GROUPS } from '@/src/mock-data/groups'
import { MOCK_ROLES } from '@/src/mock-data/roles'
import { MOCK_USERS } from '@/src/mock-data/users'
import {
  SEED_BITRIX_GRANTS,
  SEED_BOOLEAN_GRANTS,
  getBitrixGrant,
  getBooleanGrant,
  mergeScopeValues,
  normalizeScopeValue,
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

function resolveUserRoleIds(userId: string, directRoles: string[]): string[] {
  const ids = new Set<string>()
  for (const name of directRoles) {
    const id = roleNameToId(name)
    if (id) ids.add(id)
  }

  const user = MOCK_USERS.find((u) => u.id === userId)
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
  booleanGrants: BitrixBooleanGrants = SEED_BOOLEAN_GRANTS,
): UserEffectivePermissions {
  const user = MOCK_USERS.find((u) => u.id === userId) ?? MOCK_USERS[0]
  const roleIds = resolveUserRoleIds(userId, user?.roles ?? [])
  const roleNames = roleIds
    .map((id) => MOCK_ROLES.find((r) => r.id === id)?.name)
    .filter(Boolean) as string[]

  const grants: ResolvedEffectiveGrant[] = []

  for (const mod of BITRIX_ACCESS_MODULES) {
    const actions =
      mod.resourceType === 'widget' || mod.resourceType === 'form'
        ? (['read', 'edit'] as const)
        : (['read', 'add', 'edit', 'delete', 'export', 'import'] as const)

    for (const action of actions) {
      let merged: ScopeGrantValue = 'deny'
      for (const roleId of roleIds) {
        const value = normalizeScopeValue(getBitrixGrant(scopeGrants, mod.id, action, roleId))
        merged = mergeScopeValues(merged, value)
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

    if (mod.booleanPermissions) {
      for (const perm of mod.booleanPermissions) {
        const allowed = roleIds.some((roleId) =>
          getBooleanGrant(booleanGrants, mod.id, perm.id, roleId),
        )
        if (allowed) {
          grants.push({
            moduleId: mod.id,
            moduleName: mod.displayName ?? mod.name,
            action: perm.id,
            actionLabel: perm.label,
            scope: 'all_tenant_data',
            resourceType: mod.resourceType,
          })
        }
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

/** Check whether a user may perform an action on a module (client-side preview). */
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
