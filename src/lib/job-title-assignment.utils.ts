import { SELECT_EMPTY_VALUE } from '@/src/constants/add-user'
import type { UserListItem } from '@/src/types/user-management'

const PATH_SEPARATOR = ' > '

function getJobTitleLeafName(pathLabel: string): string {
  const parts = pathLabel.split(PATH_SEPARATOR)
  return parts[parts.length - 1]?.trim() ?? pathLabel
}

export function isJobTitlePathAssigned(
  userJobTitle: string | undefined,
  jobTitlePathLabels: string[],
): boolean {
  if (!userJobTitle || userJobTitle === '—' || userJobTitle === SELECT_EMPTY_VALUE) {
    return false
  }

  const trimmed = userJobTitle.trim()
  if (jobTitlePathLabels.includes(trimmed)) return true

  return jobTitlePathLabels.some((label) => getJobTitleLeafName(label) === trimmed)
}

export function findUsersAssignedToJobTitlePaths(
  users: UserListItem[],
  jobTitlePathLabels: string[],
): UserListItem[] {
  if (jobTitlePathLabels.length === 0) return []
  return users.filter((user) => isJobTitlePathAssigned(user.jobTitle, jobTitlePathLabels))
}

export function formatJobTitleDeleteBlockedMessage(users: UserListItem[]): string {
  const names = users.map((user) => user.name)
  const unassignHint = ' Unassign them from this job title before deleting.'

  if (names.length === 1) {
    return `This job title is assigned to ${names[0]}.${unassignHint}`
  }
  if (names.length <= 3) {
    return `This job title is assigned to ${names.join(', ')}.${unassignHint}`
  }
  return `This job title is assigned to ${users.length} users (${names.slice(0, 2).join(', ')} and ${users.length - 2} more).${unassignHint}`
}
