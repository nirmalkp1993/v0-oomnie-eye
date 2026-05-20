import type { UserRow } from '@/src/types/user-management'

export function getUserRowCellValue(row: UserRow, columnId: string): string {
  switch (columnId) {
    case 'userName':
      return row.userName
    case 'email':
      return row.email
    case 'age':
      return String(row.age)
    case 'mobileNumber':
      return row.mobileNumber
    case 'role':
      return row.role
    case 'group':
      return row.group
    case 'location':
      return row.location
    case 'status':
      return row.status
    default:
      return ''
  }
}
