export const USER_MANAGEMENT_ROUTES = {
  users: '/user-management/users',
  groups: '/user-management/groups',
  roles: '/user-management/roles',
  roleAssignment: '/user-management/role-assignment',
} as const

export type UserManagementHref =
  (typeof USER_MANAGEMENT_ROUTES)[keyof typeof USER_MANAGEMENT_ROUTES]
