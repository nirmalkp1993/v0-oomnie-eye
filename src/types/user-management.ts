/** User management types — aligned with OomniEye-DigitalTwin-Frontend */

import type { UserRoleMatrixGrants } from '@/src/constants/user-role-permission-matrix'

export type UserStatus =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'suspended'
  | 'archived'
  | 'retired'

export interface CreateUserFormValues {
  fullName: string
  avatarUrl: string
  email: string
  phone: string
  department: string
  jobTitle: string
  territory: string
  office: string
  region: string
  businessUnit: string
  status: UserStatus
  roleId: string
  groupIds: string[]
  customAttributes: string
}

export interface UserListItem {
  id: string
  name: string
  avatarUrl?: string
  email: string
  roles: string[]
  groups: string[]
  department: string
  office: string
  status: UserStatus
  lastLogin: string | null
  jobTitle?: string
  phone?: string
  territory?: string
  region?: string
  businessUnit?: string
  customAttributes?: Record<string, string>
}

export interface UserRoleOption {
  id: string
  name: string
  description: string
}

export interface UserGroupOption {
  id: string
  name: string
  description: string
}

export type UserAuditCategory =
  | 'user_lifecycle'
  | 'user_delete'
  | 'admin_data_add'
  | 'general_data_add'
  | 'read_view'

export interface UserAuditEntry {
  id: string
  action: string
  context: string
  date: string
  category: UserAuditCategory
}

export type GroupType = 'static' | 'dynamic'

export type GroupStatus = 'active' | 'inactive'

export type RuleMatchMode = 'ALL' | 'ANY'

export interface DynamicRule {
  id: string
  field: string
  operator: string
  value: string
}

export interface CreateGroupFormValues {
  name: string
  description: string
  status: GroupStatus
  groupType: GroupType
  ruleMatchMode: RuleMatchMode
  rules: DynamicRule[]
  inheritedRoleIds: string[]
  selectedUserIds: string[]
}

export interface GroupSelectableUser {
  id: string
  name: string
  email: string
}

export interface GroupInheritableRole {
  id: string
  name: string
  description: string
}

export interface GroupListItem {
  id: string
  name: string
  description: string
  type: GroupType
  memberCount: number
  inheritedRoles: string[]
  scope: string
  status: GroupStatus
  lastUpdated: string
  parentGroupIds?: string[]
  memberUserIds?: string[]
  ruleMatchMode?: RuleMatchMode
  rules?: DynamicRule[]
}

export type RoleStatus = 'active' | 'inactive'

export type RoleBadgeTag = 'system' | 'high-risk'

export type RoleIconVariant = 'shield-danger' | 'shield-default' | 'hexagon'

export type DataScopeId =
  | 'own_records'
  | 'assigned_records'
  | 'department'
  | 'department_subdepartments'
  | 'office'
  | 'country'
  | 'region'
  | 'territory'
  | 'business_unit'
  | 'public_data'
  | 'all_tenant_data'
  | 'global_all_tenants'
  | 'custom_filter'

import type { UserRoleMatrixGrants } from '@/src/constants/user-role-permission-matrix'

export interface CreateRoleFormValues {
  name: string
  description: string
  status: RoleStatus
  highRisk: boolean
  selectedPermissions: string[]
  permissionMatrix: UserRoleMatrixGrants
  dataScopeIds: DataScopeId[]
}

export interface RoleListItem {
  id: string
  name: string
  description: string
  badges: RoleBadgeTag[]
  iconVariant: RoleIconVariant
  userCount: number
  groupCount: number
  permissionCount: number
  dataScope: string
  status: RoleStatus
  lastUpdated: string
  selectedPermissions?: string[]
  permissionMatrix?: UserRoleMatrixGrants
  dataScopeIds?: DataScopeId[]
  highRisk?: boolean
}
