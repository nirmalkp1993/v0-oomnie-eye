import type { MatrixAction, MatrixColumnKey, PermissionMatrixModule } from '@/src/types/permissions-page'
import { FIELD_FORM_OPTIONS } from '@/src/constants/field-permissions'
import { PERMISSION_MODULES } from '@/src/constants/permissions-matrix'

export const BITRIX_STANDARD_ACTIONS = [
  'read',
  'add',
  'edit',
  'delete',
  'export',
  'import',
] as const

export const BITRIX_ACTION_LABELS: Record<string, string> = {
  read: 'Read',
  add: 'Add',
  edit: 'Edit',
  delete: 'Delete',
  export: 'Export',
  import: 'Import',
  custom_view_form: 'Allow custom view form',
}

export const BITRIX_CATEGORY_LABELS: Record<string, string> = {
  crm: 'CRM / Data',
  forms: 'CRM forms',
  widgets: 'Website widgets',
  automations: 'Automated solutions',
  platform: 'OomniEye platform',
}

export const CUSTOM_VIEW_FORM_PERMISSION = {
  id: 'custom_view_form',
  label: 'Allow custom view form',
} as const

const WIDGET_MODULE_IDS = new Set(['finance_overview', 'sales_overview'])

const CRM_DATA_MODULES: Omit<PermissionMatrixModule, 'category'>[] = [
  { id: 'approve_levels', name: 'Approve levels', description: 'Manage approve levels', resourceType: 'module', displayName: 'Approvals' },
  { id: 'budget_maintenance', name: 'Budget maintenance', description: 'Maintain budget definitions', resourceType: 'module', displayName: 'Budget' },
  { id: 'global', name: 'Global', description: 'Global configuration and lookups', resourceType: 'module' },
  { id: 'pay_list', name: 'Pay list', description: 'View and manage pay lists', resourceType: 'module' },
  { id: 'finance_overview', name: 'Finance overview dashboard', description: 'Finance KPIs and overview widgets', resourceType: 'widget', displayName: 'Finance overview' },
  { id: 'sales_overview', name: 'Sales overview dashboard', description: 'Sales KPIs and overview widgets', resourceType: 'widget', displayName: 'Sales overview' },
  { id: 'invoice_processing', name: 'Invoice processing', description: 'Create and process invoices', resourceType: 'module', displayName: 'Invoice' },
  { id: 'payment_runs', name: 'Payment runs', description: 'Schedule and execute payment runs', resourceType: 'module' },
  { id: 'vendor_master', name: 'Vendor master', description: 'Vendor records and banking details', resourceType: 'module', displayName: 'Vendor' },
  { id: 'customer_master', name: 'Customer master', description: 'Customer accounts and credit limits', resourceType: 'module', displayName: 'Company' },
  { id: 'gl_journals', name: 'GL journals', description: 'General ledger journal entries', resourceType: 'module' },
  { id: 'tax_codes', name: 'Tax codes', description: 'Tax code maintenance', resourceType: 'module' },
  { id: 'cost_centers', name: 'Cost centers', description: 'Cost center hierarchy', resourceType: 'module' },
  { id: 'projects', name: 'Projects', description: 'Project setup and WBS', resourceType: 'module' },
  { id: 'timesheets', name: 'Timesheets', description: 'Employee timesheet entry', resourceType: 'module' },
  { id: 'expense_claims', name: 'Expense claims', description: 'Submit and approve expenses', resourceType: 'module', displayName: 'Expense' },
  { id: 'purchase_orders', name: 'Purchase orders', description: 'PO creation and approval', resourceType: 'module' },
  { id: 'inventory', name: 'Inventory', description: 'Stock levels and movements', resourceType: 'module' },
  { id: 'work_orders', name: 'Work orders', description: 'Operations work order management', resourceType: 'module' },
  { id: 'assets', name: 'Assets', description: 'Fixed asset register', resourceType: 'module' },
  { id: 'reports_catalog', name: 'Reports catalog', description: 'Browse and run standard reports', resourceType: 'module' },
  { id: 'report_designer', name: 'Report designer', description: 'Design custom reports', resourceType: 'module' },
  { id: 'audit_trail', name: 'Audit trail', description: 'View system audit events', resourceType: 'module' },
  { id: 'user_admin', name: 'User administration', description: 'Users, groups, and roles', resourceType: 'module' },
  { id: 'system_settings', name: 'System settings', description: 'Tenant and integration settings', resourceType: 'module', displayName: 'CRM settings' },
]

function moduleCategory(m: Omit<PermissionMatrixModule, 'category'>): PermissionMatrixModule['category'] {
  if (m.resourceType === 'widget' || WIDGET_MODULE_IDS.has(m.id)) return 'widgets'
  return 'crm'
}

const CRM_MODULES: PermissionMatrixModule[] = CRM_DATA_MODULES.filter(
  (m) => !WIDGET_MODULE_IDS.has(m.id),
).map((m) => ({
  ...m,
  category: 'crm' as const,
  booleanPermissions: [CUSTOM_VIEW_FORM_PERMISSION],
}))

const WIDGET_MODULES: PermissionMatrixModule[] = CRM_DATA_MODULES.filter((m) =>
  WIDGET_MODULE_IDS.has(m.id),
).map((m) => ({
  ...m,
  category: 'widgets' as const,
}))

const FORM_MODULES: PermissionMatrixModule[] = FIELD_FORM_OPTIONS.map((f) => ({
  id: f.id,
  name: f.label,
  description: `Form permissions for ${f.label}`,
  resourceType: 'form' as const,
  category: 'forms' as const,
  displayName: f.label.replace(/^FORM - /, '').replace(/^REPORT - /, ''),
}))

const AUTOMATION_MODULES: PermissionMatrixModule[] = [
  {
    id: 'workflow_automation',
    name: 'Workflow automation',
    description: 'Automated workflows and triggers',
    resourceType: 'automation',
    category: 'automations',
    displayName: 'Workflow automation',
  },
]

function platformSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '_')
}

const PLATFORM_MODULES: PermissionMatrixModule[] = PERMISSION_MODULES.map((name) => ({
  id: platformSlug(name),
  name,
  description: `${name} platform module`,
  resourceType: 'platform' as const,
  category: 'platform' as const,
  displayName: name,
}))

/** Unified Bitrix access catalog — all categories. */
export const BITRIX_ACCESS_MODULES: PermissionMatrixModule[] = [
  ...CRM_MODULES,
  ...FORM_MODULES,
  ...WIDGET_MODULES,
  ...AUTOMATION_MODULES,
  ...PLATFORM_MODULES,
]

/** Legacy matrix rows (CRM data modules only). */
export const PERMISSION_MATRIX_MODULES: PermissionMatrixModule[] = CRM_DATA_MODULES.map((m) => ({
  ...m,
  category: moduleCategory(m),
}))

export const MATRIX_ACTIONS: MatrixAction[] = [
  'view',
  'read',
  'create',
  'edit',
  'delete',
  'admin',
  'export',
  'import',
  'print',
  'restore',
  'archive',
  'share',
  'manage',
]

export const MATRIX_COLUMNS: { key: MatrixColumnKey; labelKey: string }[] = [
  { key: 'all', labelKey: 'all' },
  { key: 'view', labelKey: 'view' },
  { key: 'read', labelKey: 'read' },
  { key: 'create', labelKey: 'create' },
  { key: 'edit', labelKey: 'edit' },
  { key: 'delete', labelKey: 'delete' },
  { key: 'admin', labelKey: 'admin' },
  { key: 'export', labelKey: 'export' },
  { key: 'import', labelKey: 'import' },
  { key: 'print', labelKey: 'print' },
  { key: 'restore', labelKey: 'restore' },
  { key: 'archive', labelKey: 'archive' },
  { key: 'share', labelKey: 'share' },
  { key: 'manage', labelKey: 'manage' },
]

export const ROLE_FILTER_OPTIONS = [
  { id: 'admin', label: 'Admin' },
  { id: 'tenant_admin', label: 'Tenant Admin' },
  { id: 'operations_manager', label: 'Operations Manager' },
  { id: 'viewer', label: 'Viewer' },
] as const

export const RESOURCE_TYPE_OPTIONS = [
  { id: 'all', labelKey: 'allResources' },
  { id: 'module', labelKey: 'module' },
  { id: 'form', labelKey: 'form' },
  { id: 'widget', labelKey: 'widget' },
  { id: 'automation', labelKey: 'automation' },
  { id: 'platform', labelKey: 'platform' },
] as const

export const MODULE_FILTER_OPTIONS = [
  { id: 'all', labelKey: 'allModules' },
  { id: 'finance', labelKey: 'finance' },
  { id: 'operations', labelKey: 'operations' },
  { id: 'sales', labelKey: 'sales' },
] as const

const ADMIN_GRANT_ENTRIES: [string, MatrixAction[]][] = [
  ['approve_levels', ['share', 'manage']],
  ['budget_maintenance', ['read', 'edit', 'manage']],
  ['global', ['view', 'read', 'admin']],
  ['pay_list', ['read', 'export', 'print']],
  ['finance_overview', ['view', 'read']],
  ['sales_overview', ['view']],
  ['invoice_processing', ['create', 'edit', 'delete']],
  ['payment_runs', ['read', 'manage']],
  ['vendor_master', ['read', 'create', 'edit']],
  ['customer_master', ['read', 'edit']],
  ['gl_journals', ['read', 'create', 'export']],
  ['tax_codes', ['read', 'manage']],
  ['cost_centers', ['view', 'read']],
  ['projects', ['read', 'create', 'edit', 'archive']],
  ['timesheets', ['read', 'create']],
  ['expense_claims', ['read', 'manage']],
  ['purchase_orders', ['read', 'create', 'edit']],
  ['inventory', ['read', 'edit']],
  ['work_orders', ['read', 'edit', 'manage']],
  ['assets', ['read', 'restore']],
  ['reports_catalog', ['read', 'export', 'print']],
  ['report_designer', ['read', 'create']],
  ['audit_trail', ['read', 'export']],
  ['user_admin', ['read', 'create', 'edit', 'delete', 'admin']],
  ['system_settings', ['read', 'admin', 'manage']],
]

/** Default grants for Admin role (legacy checkbox matrix). */
export function createAdminMatrixGrants(): Record<string, Set<MatrixAction>> {
  const grants: Record<string, Set<MatrixAction>> = {}
  PERMISSION_MATRIX_MODULES.forEach((m) => {
    grants[m.id] = new Set()
  })
  ADMIN_GRANT_ENTRIES.forEach(([id, actions]) => {
    grants[id] = new Set(actions)
  })
  return grants
}

export function createEmptyMatrixGrants(): Record<string, Set<MatrixAction>> {
  const grants: Record<string, Set<MatrixAction>> = {}
  PERMISSION_MATRIX_MODULES.forEach((m) => {
    grants[m.id] = new Set()
  })
  return grants
}

export function cloneGrants(
  source: Record<string, Set<MatrixAction>>,
): Record<string, Set<MatrixAction>> {
  const next: Record<string, Set<MatrixAction>> = {}
  for (const [moduleId, actions] of Object.entries(source)) {
    next[moduleId] = new Set(actions)
  }
  return next
}

export function getModulesByCategory(category: PermissionMatrixModule['category']): PermissionMatrixModule[] {
  return BITRIX_ACCESS_MODULES.filter((m) => m.category === category)
}

export function getModuleDisplayName(module: PermissionMatrixModule): string {
  return module.displayName ?? module.name
}
