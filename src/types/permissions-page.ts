export type PermissionsTabId = 'matrix' | 'fields' | 'effective'

export type MatrixAction =
  | 'view'
  | 'read'
  | 'create'
  | 'edit'
  | 'delete'
  | 'admin'
  | 'export'
  | 'print'
  | 'restore'
  | 'archive'
  | 'share'
  | 'manage'

export type MatrixColumnKey = 'all' | MatrixAction

export interface PermissionMatrixModule {
  id: string
  name: string
  description: string
  resourceType: 'module'
}

export type MatrixGrants = Record<string, Set<MatrixAction>>

export interface MatrixSummary {
  assigned: number
  denied: number
  inherited: number
  byAction: Partial<Record<MatrixAction, number>>
}
