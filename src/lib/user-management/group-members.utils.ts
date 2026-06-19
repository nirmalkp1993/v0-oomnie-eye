import { useUserGroupStore } from '@/lib/user-group-store'
import type { GroupListItem, UserListItem } from '@/src/types/user-management'

/** Applied automatically when no groups are explicitly assigned. */
export const DEFAULT_USER_GROUP_ID = 'grp-operations'

export function groupNameToMockId(name: string): string | null {
  const groups = useUserGroupStore.getState().groups
  const match = groups.find(
    (group) => group.name.toLowerCase() === name.trim().toLowerCase(),
  )
  return match?.id ?? null
}

export function groupMockIdToName(id: string): string | null {
  const groups = useUserGroupStore.getState().groups
  return groups.find((group) => group.id === id)?.name ?? null
}

export function userGroupNamesToMockIds(names: string[]): string[] {
  return names
    .map((name) => groupNameToMockId(name))
    .filter((id): id is string => Boolean(id))
}

export function resolveEffectiveUserGroupIds(groupIds: string[]): string[] {
  return groupIds.length > 0 ? groupIds : [DEFAULT_USER_GROUP_ID]
}

export function userGroupsToFormGroupIds(groupNames: string[]): string[] {
  const ids = userGroupNamesToMockIds(groupNames)

  if (ids.length === 0) return []

  if (ids.length === 1 && ids[0] === DEFAULT_USER_GROUP_ID) {
    return []
  }

  return ids.filter((id) => id !== DEFAULT_USER_GROUP_ID)
}

export function getDefaultUserGroup(groups: GroupListItem[]): GroupListItem | null {
  return groups.find((group) => group.id === DEFAULT_USER_GROUP_ID) ?? null
}

/** Groups shown in the picker — default group is never selectable. */
export function getAssignableUserGroups(groups: GroupListItem[]): GroupListItem[] {
  return groups.filter((group) => group.id !== DEFAULT_USER_GROUP_ID)
}

export function groupMockIdsToNames(ids: string[]): string[] {
  return ids
    .map((id) => groupMockIdToName(id))
    .filter((name): name is string => Boolean(name))
}

export function getGroupMembers(group: GroupListItem, users: UserListItem[]): UserListItem[] {
  if (group.type === 'static' && group.memberUserIds?.length) {
    const memberIds = new Set(group.memberUserIds)
    return users.filter((user) => memberIds.has(user.id))
  }

  return users.filter((user) =>
    user.groups.some((name) => name.toLowerCase() === group.name.toLowerCase()),
  )
}

export function getAssignedUserIds(groups: GroupListItem[], users: UserListItem[]): Set<string> {
  const assigned = new Set<string>()
  for (const group of groups) {
    for (const member of getGroupMembers(group, users)) {
      assigned.add(member.id)
    }
  }
  return assigned
}

export function getUnassignedUsers(groups: GroupListItem[], users: UserListItem[]): UserListItem[] {
  const assigned = getAssignedUserIds(groups, users)
  return users.filter((user) => !assigned.has(user.id))
}
