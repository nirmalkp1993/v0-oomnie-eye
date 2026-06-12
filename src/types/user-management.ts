/** User management types — aligned with OomniEye-DigitalTwin-Frontend */

export type UserStatus =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'suspended'
  | 'archived'

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

export interface UserAuditEntry {
  id: string
  action: string
  context: string
  date: string
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
  | 'country'
  | 'region'
  | 'territory'
  | 'business_unit'
  | 'all_tenant_data'
  | 'global_all_tenants'
  | 'custom_filter'

export interface CreateRoleFormValues {
  name: string
  description: string
  status: RoleStatus
  highRisk: boolean
  selectedPermissions: string[]
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
  dataScopeIds?: DataScopeId[]
  highRisk?: boolean
}
