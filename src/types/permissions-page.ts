import type { DataScopeId } from '@/src/types/user-management'

export type PermissionsTabId = 'access' | 'fields' | 'effective'

export type MatrixAction =
  | 'view'
  | 'read'
  | 'create'
  | 'edit'
  | 'delete'
  | 'admin'
  | 'export'
  | 'import'
  | 'print'
  | 'restore'
  | 'archive'
  | 'share'
  | 'manage'

export type MatrixColumnKey = 'all' | MatrixAction

export type BitrixModuleCategory = 'platform'

export type BitrixStandardAction = 'read' | 'add' | 'edit' | 'delete' | 'export' | 'import'

export type BitrixResourceType = 'platform'

export interface PermissionMatrixModule {
  id: string
  name: string
  description: string
  resourceType: BitrixResourceType
  category: BitrixModuleCategory
  displayName?: string
  parentId?: string
  isGroupHeader?: boolean
  depth?: number
  appTab?: string
  booleanPermissions?: { id: string; label: string }[]
}

export type MatrixGrants = Record<string, Set<MatrixAction>>

export interface MatrixSummary {
  assigned: number
  denied: number
  inherited: number
  byAction: Partial<Record<MatrixAction, number>>
}

export type ScopeGrantValue = DataScopeId | 'deny'

/** Single scope, multiple scopes, or deny. */
export type ScopeGrantSelection = ScopeGrantValue | ScopeGrantValue[]

export type RoleMemberEntityType = 'user' | 'group' | 'department'

export interface RoleMemberSelection {
  userIds: string[]
  groupIds: string[]
  departmentIds: string[]
}

export interface RoleMemberPickerItem {
  id: string
  type: RoleMemberEntityType
  label: string
  subtitle?: string
  depth?: number
}

export type BitrixBooleanGrants = Record<
  string,
  Record<string, Record<string, boolean>>
>

export type BitrixAccessGrants = Record<
  string,
  Record<string, Record<string, ScopeGrantValue | ScopeGrantValue[]>>
>

export interface BitrixCategoryGroup {
  id: BitrixModuleCategory
  label: string
  modules: PermissionMatrixModule[]
}

/** Serializable shape for future API persistence. */
export interface BitrixPermissionsPersistPayload {
  version: 1
  scopeGrants: BitrixAccessGrants
  booleanGrants: BitrixBooleanGrants
  updatedAt: string
}
