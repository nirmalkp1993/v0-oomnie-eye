import { SELECT_EMPTY_VALUE } from '@/src/constants/add-user'
import type { UserListItem } from '@/src/types/user-management'

const PATH_SEPARATOR = ' > '

function getDepartmentLeafName(pathLabel: string): string {
  const parts = pathLabel.split(PATH_SEPARATOR)
  return parts[parts.length - 1]?.trim() ?? pathLabel
}

export function isDepartmentPathAssigned(
  userDepartment: string | undefined,
  departmentPathLabels: string[],
): boolean {
  if (!userDepartment || userDepartment === '—' || userDepartment === SELECT_EMPTY_VALUE) {
    return false
  }

  const trimmed = userDepartment.trim()
  if (departmentPathLabels.includes(trimmed)) return true

  return departmentPathLabels.some((label) => getDepartmentLeafName(label) === trimmed)
}

export function findUsersAssignedToDepartmentPaths(
  users: UserListItem[],
  departmentPathLabels: string[],
): UserListItem[] {
  if (departmentPathLabels.length === 0) return []
  return users.filter((user) => isDepartmentPathAssigned(user.department, departmentPathLabels))
}

export function formatDepartmentDeleteBlockedMessage(users: UserListItem[]): string {
  const names = users.map((user) => user.name)
  const unassignHint = ' Unassign them from this department before deleting.'

  if (names.length === 1) {
    return `This department is assigned to ${names[0]}.${unassignHint}`
  }
  if (names.length <= 3) {
    return `This department is assigned to ${names.join(', ')}.${unassignHint}`
  }
  return `This department is assigned to ${users.length} users (${names.slice(0, 2).join(', ')} and ${users.length - 2} more).${unassignHint}`
}
