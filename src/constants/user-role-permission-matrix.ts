export type UserRoleMatrixAction = 'view' | 'add' | 'update' | 'delete' | 'import' | 'export'

export interface UserRoleMatrixModule {
  id: string
  name: string
  description: string
}

export const USER_ROLE_MATRIX_COLUMNS: { key: UserRoleMatrixAction; label: string }[] = [
  { key: 'view', label: 'View' },
  { key: 'add', label: 'Add' },
  { key: 'update', label: 'Update' },
  { key: 'delete', label: 'Delete' },
  { key: 'import', label: 'Import' },
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
  cameras: ['view', 'add', 'update', 'delete'],
  departments: ['view', 'add', 'update', 'delete'],
  groups: ['view', 'add', 'update', 'delete'],
  job_titles: ['view', 'add', 'update', 'delete'],
  locations: ['view', 'add', 'update', 'delete'],
  media: ['view', 'add', 'update', 'delete'],
  pins: ['view', 'add', 'update', 'delete', 'import', 'export'],
}

export type UserRoleMatrixGrants = Record<string, Set<UserRoleMatrixAction>>

const CRUD: UserRoleMatrixAction[] = ['view', 'add', 'update', 'delete']
const PINS_ALL: UserRoleMatrixAction[] = ['view', 'add', 'update', 'delete', 'import', 'export']

function grantsForModules(
  builder: (moduleId: string) => UserRoleMatrixAction[],
): UserRoleMatrixGrants {
  return Object.fromEntries(
    USER_ROLE_MATRIX_MODULES.map((module) => [module.id, new Set(builder(module.id))]),
  )
}

const ROLE_MATRIX_GRANTS: Record<string, UserRoleMatrixGrants> = {
  super_admin: grantsForModules((id) => (id === 'pins' ? PINS_ALL : CRUD)),
  tenant_admin: grantsForModules((id) => (id === 'pins' ? PINS_ALL : CRUD)),
  operations_manager: {
    cameras: new Set(['view', 'update']),
    departments: new Set(['view', 'update']),
    groups: new Set(['view']),
    job_titles: new Set(['view']),
    locations: new Set(['view']),
    media: new Set(['view', 'update']),
    pins: new Set(['view', 'update']),
  },
  viewer: grantsForModules(() => ['view']),
}

export function getUserRoleMatrixGrants(catalogRoleId: string): UserRoleMatrixGrants {
  const grants = ROLE_MATRIX_GRANTS[catalogRoleId]
  if (grants) return grants
  return grantsForModules(() => [])
}

export function isUserRoleMatrixActionApplicable(moduleId: string, action: UserRoleMatrixAction): boolean {
  return USER_ROLE_MATRIX_APPLICABLE[moduleId]?.includes(action) ?? false
}
