import {
  DATA_SCOPE_LABEL_TO_IDS,
  ROLE_PERMISSION_MODULES,
  SELECTABLE_DATA_SCOPE_IDS,
} from '@/src/constants/role-catalog'
import { MOCK_ROLES } from '@/src/mock-data/roles'
import type { CreateRoleFormValues, DataScopeId, RoleListItem } from '@/src/types/user-management'

const USER_ROLE_CATALOG_TO_MOCK_ID: Record<string, string> = {
  super_admin: 'role-super-admin',
  tenant_admin: 'role-tenant-admin',
  operations_manager: 'role-operations-manager',
  viewer: 'role-viewer',
}

export function permissionKey(moduleId: string, action: string): string {
  return `${moduleId}:${action}`
}

export function modulePermissionKeys(moduleId: string, actions: string[]): string[] {
  return actions.map((action) => permissionKey(moduleId, action))
}

export function validateCreateRoleForm(form: CreateRoleFormValues): boolean {
  return !form.name.trim()
}

const DATA_SCOPE_DISPLAY_LABELS: Record<string, string> = {
  own_records: 'Own records',
  assigned_records: 'Assigned records',
  department: 'Department',
  country: 'Country',
  territory: 'Territory',
  region: 'Region',
  business_unit: 'Business unit',
  all_tenant_data: 'All tenant data',
  global_all_tenants: 'Global (all tenants)',
  custom_filter: 'Custom filter',
}

export function formatDataScopeLabel(scopeIds: DataScopeId[]): string {
  if (scopeIds.length === 0) return '—'
  if (
    scopeIds.length === 2 &&
    scopeIds.includes('own_records') &&
    scopeIds.includes('assigned_records')
  ) {
    return 'Own records'
  }
  return scopeIds
    .map((id) => DATA_SCOPE_DISPLAY_LABELS[id] ?? id.replace(/_/g, ' '))
    .join(', ')
}

function filterSelectableScopeIds(scopeIds: DataScopeId[]): DataScopeId[] {
  const filtered = scopeIds.filter((id) => SELECTABLE_DATA_SCOPE_IDS.has(id))
  return filtered.length > 0 ? filtered : ['own_records', 'assigned_records']
}

function allPermissionKeys(): string[] {
  return ROLE_PERMISSION_MODULES.flatMap((m) => modulePermissionKeys(m.id, m.actions))
}

const ROLE_EDIT_PERMISSION_PRESETS: Record<string, string[]> = {
  'role-super-admin': allPermissionKeys(),
  'role-tenant-admin': ROLE_PERMISSION_MODULES.flatMap((m) =>
    m.id !== 'admin_menu' ? modulePermissionKeys(m.id, m.actions) : []
  ),
  'role-viewer': [
    ...modulePermissionKeys('dashboards', ['Read']),
    ...modulePermissionKeys('reports', ['Read']),
    ...modulePermissionKeys('operations', ['Read']),
    ...modulePermissionKeys('users', ['Read']),
    ...modulePermissionKeys('groups', ['Read']),
    ...modulePermissionKeys('roles', ['Read']),
    ...modulePermissionKeys('audit', ['Read']),
    ...modulePermissionKeys('sidebar', ['View']),
    ...modulePermissionKeys('topbar', ['View']),
  ],
  'role-operations-manager': [
    ...modulePermissionKeys('operations', ['Read', 'Update']),
    ...modulePermissionKeys('ops_overview', ['View']),
    ...modulePermissionKeys('ops_throughput', ['View']),
    ...modulePermissionKeys('users', ['Read']),
    ...modulePermissionKeys('groups', ['Read']),
    ...modulePermissionKeys('reports', ['Read']),
    ...modulePermissionKeys('dashboards', ['Read']),
    ...modulePermissionKeys('sidebar', ['View']),
    ...modulePermissionKeys('topbar', ['View']),
  ],
}

export function getPermissionsForCatalogRoleId(catalogRoleId: string): string[] {
  const mockRoleId = USER_ROLE_CATALOG_TO_MOCK_ID[catalogRoleId]
  if (!mockRoleId) return []
  const role = MOCK_ROLES.find((item) => item.id === mockRoleId)
  return role?.selectedPermissions ?? ROLE_EDIT_PERMISSION_PRESETS[mockRoleId] ?? []
}

export function roleToFormValues(role: RoleListItem): CreateRoleFormValues {
  const rawScopeIds =
    role.dataScopeIds ??
    DATA_SCOPE_LABEL_TO_IDS[role.dataScope] ??
    (['own_records', 'assigned_records'] as DataScopeId[])
  const scopeIds = filterSelectableScopeIds(rawScopeIds)

  const permissions = role.selectedPermissions ?? ROLE_EDIT_PERMISSION_PRESETS[role.id] ?? []

  return {
    name: role.name,
    description: role.description,
    status: role.status,
    highRisk: role.highRisk ?? role.badges.includes('high-risk'),
    selectedPermissions: [...permissions],
    dataScopeIds: [...scopeIds],
  }
}

export function buildRoleListItemFromForm(
  form: CreateRoleFormValues,
  existing?: RoleListItem
): RoleListItem {
  const badges: RoleListItem['badges'] = []
  if (existing?.badges.includes('system')) badges.push('system')
  if (form.highRisk) badges.push('high-risk')

  const iconVariant: RoleListItem['iconVariant'] =
    badges.includes('system') && form.highRisk
      ? 'shield-danger'
      : badges.includes('system')
        ? 'shield-danger'
        : form.highRisk
          ? 'shield-default'
          : 'hexagon'

  return {
    id: existing?.id ?? `role-${Date.now()}`,
    name: form.name.trim(),
    description: form.description.trim() || '—',
    badges,
    iconVariant,
    userCount: existing?.userCount ?? 0,
    groupCount: existing?.groupCount ?? 0,
    permissionCount: form.selectedPermissions.length,
    dataScope: formatDataScopeLabel(form.dataScopeIds),
    status: form.status,
    lastUpdated: new Date().toISOString().slice(0, 10),
    selectedPermissions: [...form.selectedPermissions],
    dataScopeIds: [...form.dataScopeIds],
    highRisk: form.highRisk,
  }
}
