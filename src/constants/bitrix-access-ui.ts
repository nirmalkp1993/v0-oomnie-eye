import {
  MY_DRAWINGS_TABLE,
  MY_DRAWINGS_TOOLBAR,
} from '@/src/components/tables/my-drawings-table-styles'

/** Access permissions visual tokens — aligned with My Drawings / enterprise theme */
export const BITRIX_ACCESS_UI = {
  sidebarWidth: 220,
  roleColumnMinWidth: 136,
  actionColumnWidth: 220,
  headerBg: MY_DRAWINGS_TABLE.headerBg,
  sectionBg: MY_DRAWINGS_TOOLBAR.shellBg,
  rowHoverBg: MY_DRAWINGS_TABLE.hoverBg,
  borderColor: MY_DRAWINGS_TABLE.border,
  primaryBlue: MY_DRAWINGS_TABLE.accent,
  linkBlue: MY_DRAWINGS_TABLE.accent,
  textSecondary: MY_DRAWINGS_TOOLBAR.textMuted,
  textPrimary: MY_DRAWINGS_TOOLBAR.textDark,
  denyColor: '#a8adb4',
  accentHoverBg: MY_DRAWINGS_TABLE.selectedBg,
  toolbarHeight: 36,
  moduleIconSize: 24,
  tableHeaderHeight: 88,
  rowHeight: MY_DRAWINGS_TABLE.rowHeight,
  fontFamily: 'Roboto, sans-serif',
} as const

/** Roles shown in the access grid. */
export const BITRIX_GRID_ROLE_IDS = [
  'role-viewer',
  'role-operations-manager',
  'role-finance-country',
  'role-auditor',
  'role-tenant-admin',
] as const

const MODULE_ACCENT: Record<string, string> = {
  earth: '#2ecc71',
  dashboard: '#3498db',
  reports: '#9b59b6',
  alerts: '#e74c3c',
  camera: '#2067b0',
  camera_devices: '#2067b0',
  camera_groups: '#2980b9',
  camera_recording: '#1abc9c',
  user_management: '#828b95',
  um_users: '#2067b0',
  um_groups: '#16a085',
  um_roles: '#8e44ad',
  um_permissions: '#f39c12',
  settings: '#95a5a6',
}

export function getModuleAccentColor(moduleId: string): string {
  return MODULE_ACCENT[moduleId] ?? '#95a5a6'
}

/** Shared MUI sx for permission table cells */
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
