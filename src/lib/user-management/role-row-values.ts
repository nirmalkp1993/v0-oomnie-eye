import type { RoleRow } from '@/src/types/user-management'

export function getRoleRowCellValue(row: RoleRow, columnId: string): string {
  switch (columnId) {
    case 'roleName':
      return row.roleName
    case 'description':
      return row.description
    case 'userCount':
      return String(row.userCount)
    case 'createdDate':
      return row.createdDate
    default:
      return ''
  }
}
