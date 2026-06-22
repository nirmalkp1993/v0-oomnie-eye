import { hierarchyFieldsFromUser } from '@/src/lib/hierarchy-path.utils'
import type { UserListItem } from '@/src/types/user-management'

const PATH_SEPARATOR = ' > '

function getTerritoryLeafName(pathLabel: string): string {
  const parts = pathLabel.split(PATH_SEPARATOR)
  return parts[parts.length - 1]?.trim() ?? pathLabel
}

export function isTerritoryPathAssigned(
  userTerritory: string | string[] | undefined,
  territoryPathLabels: string[],
): boolean {
  const assignments = hierarchyFieldsFromUser(userTerritory)
  if (assignments.length === 0) return false

  return assignments.some((userTerritoryValue) => {
    const trimmed = userTerritoryValue.trim()
    if (territoryPathLabels.includes(trimmed)) return true
    return territoryPathLabels.some((label) => getTerritoryLeafName(label) === trimmed)
  })
}

export function findUsersAssignedToTerritoryPaths(
  users: UserListItem[],
  territoryPathLabels: string[],
): UserListItem[] {
  if (territoryPathLabels.length === 0) return []
  return users.filter((user) => isTerritoryPathAssigned(user.territory, territoryPathLabels))
}

export function formatTerritoryDeleteBlockedMessage(users: UserListItem[]): string {
  const names = users.map((user) => user.name)
  const unassignHint = ' Unassign them from this territory before deleting.'

  if (names.length === 1) {
    return `This territory is assigned to ${names[0]}.${unassignHint}`
  }
  if (names.length <= 3) {
    return `This territory is assigned to ${names.join(', ')}.${unassignHint}`
  }
  return `This territory is assigned to ${users.length} users (${names.slice(0, 2).join(', ')} and ${users.length - 2} more).${unassignHint}`
}
