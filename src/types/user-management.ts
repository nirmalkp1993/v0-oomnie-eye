export type UserStatus = 'Active' | 'Inactive' | 'Pending'

export interface UserRow {
  id: string
  userName: string
  email: string
  age: number
  mobileNumber: string
  role: string
  group: string
  location: string
  status: UserStatus
}

export interface GroupRow {
  id: string
  groupId: string
  groupName: string
  description: string
  assignedUsersCount: number
  createdDate: string
}

export interface RoleRow {
  id: string
  roleName: string
  description: string
  userCount: number
  createdDate: string
}
