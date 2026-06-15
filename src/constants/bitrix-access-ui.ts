/** Bitrix24 Access permissions visual tokens */
export const BITRIX_ACCESS_UI = {
  sidebarWidth: 200,
  roleColumnMinWidth: 130,
  actionColumnWidth: 200,
  headerBg: '#f5f7f8',
  sectionBg: '#fafbfc',
  borderColor: '#e8ecee',
  primaryBlue: '#2fc6f6',
  linkBlue: '#2067b0',
  textSecondary: '#828b95',
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
  customer_master: '#f5a623',
  vendor_master: '#9b59b6',
  expense_claims: '#2ecc71',
  invoice_processing: '#3498db',
  finance_overview: '#1abc9c',
  sales_overview: '#e74c3c',
}

export function getModuleAccentColor(moduleId: string): string {
  return MODULE_ACCENT[moduleId] ?? '#95a5a6'
}
