/** Bitrix24 Access permissions visual tokens */
export const BITRIX_ACCESS_UI = {
  sidebarWidth: 220,
  roleColumnMinWidth: 136,
  actionColumnWidth: 220,
  headerBg: '#f5f7f8',
  sectionBg: '#fafbfc',
  rowHoverBg: '#f8fafb',
  borderColor: '#e8ecee',
  primaryBlue: '#2fc6f6',
  linkBlue: '#2067b0',
  textSecondary: '#828b95',
  textPrimary: '#333333',
  denyColor: '#a8adb4',
  toolbarHeight: 52,
  moduleIconSize: 24,
  tableHeaderHeight: 88,
  rowHeight: 36,
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
} as const

/** Bitrix-style role column labels (UI only — ids unchanged). */
export const BITRIX_ROLE_DISPLAY_NAMES: Record<string, string> = {
  'role-viewer': 'Employee',
  'role-operations-manager': 'Supervisor',
  'role-finance-country': 'Deputy supervisor',
  'role-auditor': 'Observer',
  'role-tenant-admin': 'Administrator',
  'role-super-admin': 'Administrator',
}

/** Roles shown in the access grid (Bitrix shows 5). */
export const BITRIX_GRID_ROLE_IDS = [
  'role-viewer',
  'role-operations-manager',
  'role-finance-country',
  'role-auditor',
  'role-tenant-admin',
] as const

/** Module header accent colors (Bitrix-style). */
const MODULE_ACCENT: Record<string, string> = {
  customer_master: '#9dcf00',
  vendor_master: '#9b59b6',
  expense_claims: '#2ecc71',
  invoice_processing: '#3498db',
  finance_overview: '#1abc9c',
  sales_overview: '#e74c3c',
  approve_levels: '#f5a623',
  budget_maintenance: '#e67e22',
  global: '#95a5a6',
  pay_list: '#16a085',
  payment_runs: '#2980b9',
  gl_journals: '#8e44ad',
  tax_codes: '#c0392b',
  cost_centers: '#27ae60',
  projects: '#d35400',
  timesheets: '#2c3e50',
  purchase_orders: '#7f8c8d',
  inventory: '#1abc9c',
  work_orders: '#34495e',
  assets: '#f39c12',
  reports_catalog: '#3498db',
  report_designer: '#9b59b6',
  audit_trail: '#95a5a6',
  user_admin: '#2067b0',
  system_settings: '#828b95',
}

export function getModuleAccentColor(moduleId: string): string {
  return MODULE_ACCENT[moduleId] ?? '#95a5a6'
}

/** Shared MUI sx for Bitrix permission table cells */
export const bitrixTableCellSx = {
  borderBottom: `1px solid ${BITRIX_ACCESS_UI.borderColor}`,
  borderRight: `1px solid ${BITRIX_ACCESS_UI.borderColor}`,
  py: 0,
  px: 1,
  height: BITRIX_ACCESS_UI.rowHeight,
} as const

export const bitrixHeaderCellSx = {
  bgcolor: BITRIX_ACCESS_UI.headerBg,
  borderBottom: `1px solid ${BITRIX_ACCESS_UI.borderColor}`,
  borderRight: `1px solid ${BITRIX_ACCESS_UI.borderColor}`,
} as const
