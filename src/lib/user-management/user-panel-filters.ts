import type { UserListItem } from '@/src/types/user-management'

export function userMatchesPanelSearch(user: UserListItem, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const hay = [
    user.name,
    user.email,
    user.phone,
    ...(user.jobTitle ?? []),
    ...user.department,
    user.office,
    user.roles.join(' '),
    user.groups.join(' '),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return hay.includes(q)
}

export function filterPanelUsers(users: UserListItem[], searchQuery: string): UserListItem[] {
  if (!searchQuery.trim()) return users
  return users.filter((user) => userMatchesPanelSearch(user, searchQuery))
}
