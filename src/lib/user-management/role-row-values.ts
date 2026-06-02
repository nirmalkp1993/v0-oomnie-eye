import type { RoleListItem } from '@/src/types/user-management'

export function getRoleRowCellValue(row: RoleListItem, columnId: string): string {
  switch (columnId) {
    case 'name':
      return row.name
    case 'description':
      return row.description
    case 'userCount':
      return String(row.userCount)
    case 'groupCount':
      return String(row.groupCount)
    case 'permissionCount':
      return String(row.permissionCount)
    case 'dataScope':
      return row.dataScope
    case 'status':
      return row.status
    case 'lastUpdated':
      return row.lastUpdated
    default:
      return ''
  }
}
