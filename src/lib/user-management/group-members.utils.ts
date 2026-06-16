import { useUserGroupStore } from '@/lib/user-group-store'
import type { GroupListItem, UserListItem } from '@/src/types/user-management'

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
