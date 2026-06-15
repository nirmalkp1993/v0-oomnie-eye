export const UNASSIGNED_USERS_FOLDER_ID = '__unassigned-users__'

export const UNASSIGNED_USERS_FOLDER_NAME = 'Unassigned users'

export function isUnassignedUsersFolder(groupId: string | null | undefined): boolean {
  return groupId === UNASSIGNED_USERS_FOLDER_ID
}

export const USER_GROUP_DRAG_MIME = 'text/user-id'
