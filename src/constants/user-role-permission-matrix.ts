export type UserRoleMatrixAction = 'read' | 'add' | 'edit' | 'delete' | 'export'

export type RoleMatrixScope = 'deny' | 'all' | 'users_items' | 'own' | 'dept' | 'dept_plus'

export interface UserRoleMatrixModule {
  id: string
  name: string
  description: string
}

export const USER_ROLE_MATRIX_COLUMNS: { key: UserRoleMatrixAction; label: string }[] = [
  { key: 'read', label: 'Read' },
  { key: 'add', label: 'Add' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
  { key: 'export', label: 'Export' },
]

export const USER_ROLE_MATRIX_MODULES: UserRoleMatrixModule[] = [
  { id: 'cameras', name: 'Cameras', description: 'Manage cameras' },
  { id: 'departments', name: 'Departments', description: 'Manage departments' },
  { id: 'groups', name: 'Groups', description: 'Manage groups' },
  { id: 'job_titles', name: 'Job titles', description: 'Manage job titles' },
  { id: 'locations', name: 'Locations', description: 'Manage locations' },
  { id: 'media', name: 'Media', description: 'Manage media' },
  { id: 'pins', name: 'Pins', description: 'Manage pins' },
]

export const USER_ROLE_MATRIX_APPLICABLE: Record<string, UserRoleMatrixAction[]> = {
  cameras: ['read', 'add', 'edit', 'delete', 'export'],
  departments: ['read', 'add', 'edit', 'delete'],
  groups: ['read', 'add', 'edit', 'delete'],
  job_titles: ['read', 'add', 'edit', 'delete'],
  locations: ['read', 'add', 'edit', 'delete'],
  media: ['read', 'add', 'edit', 'delete'],
  pins: ['read', 'add', 'edit', 'delete', 'export'],
}

export const ROLE_MATRIX_SCOPE_OPTIONS: { id: RoleMatrixScope; label: string }[] = [
  { id: 'deny', label: 'Deny access' },
  { id: 'all', label: 'All' },
  { id: 'users_items', label: "User's items" },
  { id: 'own', label: 'Own records' },
  { id: 'dept', label: 'Department' },
  { id: 'dept_plus', label: 'Dept + 1 more' },
]

/** Module → action → access scope */
export type UserRoleMatrixGrants = Record<string, Partial<Record<UserRoleMatrixAction, RoleMatrixScope>>>

const ALL_CRUD: UserRoleMatrixAction[] = ['read', 'add', 'edit', 'delete']

function grantsForModules(
  builder: (moduleId: string) => Partial<Record<UserRoleMatrixAction, RoleMatrixScope>>,
): UserRoleMatrixGrants {
  return Object.fromEntries(
    USER_ROLE_MATRIX_MODULES.map((module) => [module.id, builder(module.id)]),
  )
}

function allScopes(actions: UserRoleMatrixAction[]): Partial<Record<UserRoleMatrixAction, RoleMatrixScope>> {
  return Object.fromEntries(actions.map((action) => [action, 'all' as const]))
}

const OPERATIONS_MANAGER_MATRIX: UserRoleMatrixGrants = {
  cameras: { read: 'all', add: 'all', edit: 'users_items', delete: 'deny', export: 'all' },
  departments: { read: 'all', add: 'all', edit: 'all', delete: 'all' },
  groups: { read: 'all', add: 'all', edit: 'all', delete: 'deny' },
  job_titles: { read: 'all', add: 'deny', edit: 'deny', delete: 'deny' },
  locations: { read: 'dept_plus', add: 'deny', edit: 'deny', delete: 'deny' },
  media: { read: 'all', add: 'deny', edit: 'deny', delete: 'deny' },
  pins: { read: 'all', add: 'deny', edit: 'deny', delete: 'deny' },
}

const ROLE_MATRIX_GRANTS: Record<string, UserRoleMatrixGrants> = {
  super_admin: grantsForModules((id) =>
    allScopes(USER_ROLE_MATRIX_APPLICABLE[id] ?? ALL_CRUD),
  ),
  tenant_admin: grantsForModules((id) =>
    allScopes(USER_ROLE_MATRIX_APPLICABLE[id] ?? ALL_CRUD),
  ),
  operations_manager: OPERATIONS_MANAGER_MATRIX,
  viewer: grantsForModules((id) => ({ read: 'all' })),
}

const MOCK_ROLE_MATRIX_GRANTS: Record<string, UserRoleMatrixGrants> = {
  'role-super-admin': ROLE_MATRIX_GRANTS.super_admin,
  'role-tenant-admin': ROLE_MATRIX_GRANTS.tenant_admin,
  'role-operations-manager': OPERATIONS_MANAGER_MATRIX,
  'role-viewer': ROLE_MATRIX_GRANTS.viewer,
  'role-finance-country': {
    ...OPERATIONS_MANAGER_MATRIX,
    locations: { read: 'dept', add: 'deny', edit: 'deny', delete: 'deny' },
  },
  'role-auditor': grantsForModules(() => ({ read: 'all' })),
}

export function isUserRoleMatrixActionApplicable(
  moduleId: string,
  action: UserRoleMatrixAction,
): boolean {
  return USER_ROLE_MATRIX_APPLICABLE[moduleId]?.includes(action) ?? false
}

export function getRoleMatrixScopeLabel(scope: RoleMatrixScope): string {
  return ROLE_MATRIX_SCOPE_OPTIONS.find((option) => option.id === scope)?.label ?? scope
}

export function getCellScope(
  grants: UserRoleMatrixGrants,
  moduleId: string,
  action: UserRoleMatrixAction,
): RoleMatrixScope {
  return grants[moduleId]?.[action] ?? 'deny'
}

export function createEmptyRoleMatrixGrants(): UserRoleMatrixGrants {
  return grantsForModules(() => ({}))
}

export function cloneRoleMatrixGrants(source: UserRoleMatrixGrants): UserRoleMatrixGrants {
  const next: UserRoleMatrixGrants = {}
  for (const [moduleId, actions] of Object.entries(source)) {
    next[moduleId] = { ...actions }
  }
  return next
}

export function countGrantedMatrixCells(grants: UserRoleMatrixGrants): number {
  let count = 0
  for (const module of USER_ROLE_MATRIX_MODULES) {
    for (const column of USER_ROLE_MATRIX_COLUMNS) {
      if (!isUserRoleMatrixActionApplicable(module.id, column.key)) continue
      if (getCellScope(grants, module.id, column.key) !== 'deny') count += 1
    }
  }
  return count
}

export function getUserRoleMatrixGrants(catalogRoleId: string): UserRoleMatrixGrants {
  const grants = ROLE_MATRIX_GRANTS[catalogRoleId] ?? MOCK_ROLE_MATRIX_GRANTS[catalogRoleId]
  if (grants) return cloneRoleMatrixGrants(grants)
  return createEmptyRoleMatrixGrants()
}

export function getMatrixGrantsForRoleId(roleId: string): UserRoleMatrixGrants {
  return getUserRoleMatrixGrants(roleId)
}
