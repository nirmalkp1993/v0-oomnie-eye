import {
  DATA_SCOPE_LABEL_TO_IDS,
  DATA_SCOPE_OPTIONS,
  ROLE_PERMISSION_MODULES,
} from '@/src/constants/role-catalog'
import type { CreateRoleFormValues, DataScopeId, RoleListItem } from '@/src/types/user-management'

export function permissionKey(moduleId: string, action: string): string {
  return `${moduleId}:${action}`
}

export function modulePermissionKeys(moduleId: string, actions: string[]): string[] {
  return actions.map((action) => permissionKey(moduleId, action))
}

export function validateCreateRoleForm(form: CreateRoleFormValues): boolean {
  return !form.name.trim()
}

export function formatDataScopeLabel(scopeIds: DataScopeId[]): string {
  if (scopeIds.length === 0) return '—'
  if (scopeIds.includes('global_all_tenants')) return 'Global (all tenants)'
  if (scopeIds.includes('all_tenant_data')) return 'All tenant data'
  if (scopeIds.includes('business_unit')) return 'Business unit'
  if (scopeIds.includes('country')) return 'Country'
  if (scopeIds.includes('region')) return 'Region'
  const opt = DATA_SCOPE_OPTIONS.find((o) => scopeIds[0] === o.id)
  if (scopeIds.length === 1 && opt) return opt.title
  return scopeIds
    .map((id) => DATA_SCOPE_OPTIONS.find((o) => o.id === id)?.title ?? id)
    .join(', ')
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
}

export function roleToFormValues(role: RoleListItem): CreateRoleFormValues {
  const scopeIds =
    role.dataScopeIds ??
    DATA_SCOPE_LABEL_TO_IDS[role.dataScope] ??
    (['own_records', 'assigned_records'] as DataScopeId[])

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
