import type { UserListItem, UserStatus } from '@/src/types/user-management'

export const RETIRED_USER_STATUS: UserStatus = 'retired'

export function isUserRetired(user: Pick<UserListItem, 'status'>): boolean {
  return user.status === RETIRED_USER_STATUS
}

export function canDeleteUser(user: Pick<UserListItem, 'status'>): boolean {
  return isUserRetired(user)
}
