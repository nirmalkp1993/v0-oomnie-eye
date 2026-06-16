import {
  GROUP_INHERITABLE_ROLES,
  GROUP_SELECTABLE_USERS,
} from '@/src/constants/add-group'
import type { CreateGroupFormValues, DynamicRule, GroupListItem } from '@/src/types/user-management'

export function createEmptyRule(): DynamicRule {
  return {
    id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    field: 'Department',
    operator: 'equals',
    value: '',
  }
}

export function roleNameToInheritId(name: string): string | null {
  const match = GROUP_INHERITABLE_ROLES.find(
    (r) => r.name.toLowerCase() === name.trim().toLowerCase()
  )
  return match?.id ?? null
}

export function validateCreateGroupForm(form: CreateGroupFormValues): string | null {
  if (!form.name.trim()) return 'name'
  return null
}

function buildScopeLabel(form: CreateGroupFormValues): string {
  if (form.groupType === 'static') {
    const n = form.selectedUserIds.length
    return n === 1 ? '1 manually selected' : `${n} manually selected`
  }
  const count = form.rules.length
  if (count === 0) return 'No rules defined'
  const first = form.rules[0]
  const suffix =
    count > 1
      ? ` + ${count - 1} more (${form.ruleMatchMode})`
      : ` (${form.ruleMatchMode})`
  return `${first.field} ${first.operator} ${first.value || '…'}${suffix}`
}

export function countMatchedUsers(_form: CreateGroupFormValues): number {
  return 0
}

export function groupToFormValues(group: GroupListItem): CreateGroupFormValues {
  const inheritedRoleIds = group.inheritedRoles
    .map((name) => roleNameToInheritId(name))
    .filter((id): id is string => id != null)

  return {
    name: group.name,
    description: group.description === '—' ? '' : group.description,
    status: group.status,
    groupType: group.type,
    ruleMatchMode: group.ruleMatchMode ?? 'ALL',
    rules: group.rules ? [...group.rules] : [],
    inheritedRoleIds,
    selectedUserIds: group.memberUserIds ? [...group.memberUserIds] : [],
  }
}

export function buildGroupListItemFromForm(
  form: CreateGroupFormValues,
  existing?: GroupListItem,
  parentGroupId?: string | null,
): GroupListItem {
  const inheritedRoles = GROUP_INHERITABLE_ROLES.filter((r) =>
    form.inheritedRoleIds.includes(r.id)
  ).map((r) => r.name)

  const memberCount =
    form.groupType === 'static' ? form.selectedUserIds.length : countMatchedUsers(form)

  return {
    id: existing?.id ?? `grp-${Date.now()}`,
    name: form.name.trim(),
    description: form.description.trim() || '—',
    type: form.groupType,
    memberCount,
    inheritedRoles,
    scope: buildScopeLabel(form),
    status: form.status,
    lastUpdated: new Date().toISOString().slice(0, 10),
    parentGroupIds:
      existing?.parentGroupIds ??
      (parentGroupId ? [parentGroupId] : []),
    memberUserIds: form.groupType === 'static' ? [...form.selectedUserIds] : undefined,
    ruleMatchMode: form.groupType === 'dynamic' ? form.ruleMatchMode : undefined,
    rules: form.groupType === 'dynamic' ? [...form.rules] : undefined,
  }
}

/** Map mock users into selectable list when not in GROUP_SELECTABLE_USERS */
export function mergeSelectableUsers(
  extra: { id: string; name: string; email: string }[]
): typeof GROUP_SELECTABLE_USERS {
  const ids = new Set(GROUP_SELECTABLE_USERS.map((u) => u.id))
  const merged = [...GROUP_SELECTABLE_USERS]
  for (const u of extra) {
    if (!ids.has(u.id)) merged.push(u)
  }
  return merged
}
