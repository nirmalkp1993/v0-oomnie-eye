import { SELECT_EMPTY_VALUE } from '@/src/constants/add-user'
import type { UserListItem } from '@/src/types/user-management'

const PATH_SEPARATOR = ' > '

function getOfficeLeafName(pathLabel: string): string {
  const parts = pathLabel.split(PATH_SEPARATOR)
  return parts[parts.length - 1]?.trim() ?? pathLabel
}

export function isOfficePathAssigned(
  userOffice: string | undefined,
  officePathLabels: string[],
): boolean {
  if (!userOffice || userOffice === '—' || userOffice === SELECT_EMPTY_VALUE) {
    return false
  }

  const trimmed = userOffice.trim()
  if (officePathLabels.includes(trimmed)) return true

  return officePathLabels.some((label) => getOfficeLeafName(label) === trimmed)
}

export function findUsersAssignedToOfficePaths(
  users: UserListItem[],
  officePathLabels: string[],
): UserListItem[] {
  if (officePathLabels.length === 0) return []
  return users.filter((user) => isOfficePathAssigned(user.office, officePathLabels))
}

export function formatOfficeDeleteBlockedMessage(users: UserListItem[]): string {
  const names = users.map((user) => user.name)
  const unassignHint = ' Unassign them from this office before deleting.'

  if (names.length === 1) {
    return `This office is assigned to ${names[0]}.${unassignHint}`
  }
  if (names.length <= 3) {
    return `This office is assigned to ${names.join(', ')}.${unassignHint}`
  }
  return `This office is assigned to ${users.length} users (${names.slice(0, 2).join(', ')} and ${users.length - 2} more).${unassignHint}`
}
