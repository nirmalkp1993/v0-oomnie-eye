import { MOCK_GROUPS } from '@/src/mock-data/groups'
import { MOCK_USERS } from '@/src/mock-data/users'
import type {
  RoleMemberEntityType,
  RoleMemberPickerItem,
  RoleMemberSelection,
} from '@/src/types/permissions-page'

export function buildRoleMemberPickerKey(type: RoleMemberEntityType, id: string): string {
  return `${type}:${id}`
}

export function filterPickerItems(items: RoleMemberPickerItem[], query: string): RoleMemberPickerItem[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return items
  return items.filter((item) =>
    `${item.label} ${item.subtitle ?? ''}`.toLowerCase().includes(normalized),
  )
}

export function getRoleMemberPickerItems() {
  const users: RoleMemberPickerItem[] = MOCK_USERS.map((user) => ({
    id: user.id,
    type: 'user',
    label: user.name,
    subtitle: user.email,
  }))

  const groups: RoleMemberPickerItem[] = MOCK_GROUPS.map((group) => ({
    id: group.id,
    type: 'group',
    label: group.name,
    subtitle: group.type === 'dynamic' ? 'Dynamic user group' : 'Static user group',
  }))

  const allItems = [...users, ...groups]
  const byKey = new Map(allItems.map((item) => [buildRoleMemberPickerKey(item.type, item.id), item]))

  return { users, groups, allItems, byKey }
}

export function selectionToKeys(selection: RoleMemberSelection): string[] {
  return [
    ...selection.userIds.map((id) => buildRoleMemberPickerKey('user', id)),
    ...selection.groupIds.map((id) => buildRoleMemberPickerKey('group', id)),
  ]
}

export function keysToSelection(keys: Iterable<string>): RoleMemberSelection {
  const userIds: string[] = []
  const groupIds: string[] = []

  for (const key of keys) {
    const [type, id] = key.split(':', 2)
    if (!id) continue
    if (type === 'user') userIds.push(id)
    if (type === 'group') groupIds.push(id)
  }

  return { userIds, groupIds, departmentIds: [] }
}

const pickerItemsCache = getRoleMemberPickerItems()

export function resolveRoleMemberItems(selection: RoleMemberSelection): RoleMemberPickerItem[] {
  const items: RoleMemberPickerItem[] = []
  for (const id of selection.userIds) {
    const item = pickerItemsCache.byKey.get(buildRoleMemberPickerKey('user', id))
    if (item) items.push(item)
  }
  for (const id of selection.groupIds) {
    const item = pickerItemsCache.byKey.get(buildRoleMemberPickerKey('group', id))
    if (item) items.push(item)
  }
  return items
}

export function getRoleMemberDisplaySummary(selection: RoleMemberSelection, maxVisible = 3) {
  const all = resolveRoleMemberItems(selection)
  const visible = all.slice(0, maxVisible)
  const overflow = Math.max(0, all.length - maxVisible)
  return { visible, overflow, total: all.length }
}
