import { MOCK_GROUPS } from '@/src/mock-data/groups'
import type { GroupListItem, UserListItem } from '@/src/types/user-management'

export function groupNameToMockId(name: string): string | null {
  const match = MOCK_GROUPS.find(
    (group) => group.name.toLowerCase() === name.trim().toLowerCase(),
  )
  return match?.id ?? null
}

export function groupMockIdToName(id: string): string | null {
  return MOCK_GROUPS.find((group) => group.id === id)?.name ?? null
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
