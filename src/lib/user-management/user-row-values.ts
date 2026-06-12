import type { UserListItem } from '@/src/types/user-management'

export function getUserRowCellValue(row: UserListItem, columnId: string): string {
  switch (columnId) {
    case 'name':
      return row.name
    case 'email':
      return row.email
    case 'roles':
      return row.roles.join(', ')
    case 'groups':
      return row.groups.length > 0 ? row.groups.join(', ') : '—'
    case 'department':
      return row.department
    case 'office':
      return row.office
    case 'lastLogin':
      return row.lastLogin ?? '—'
    case 'status':
      return row.status
    default:
      return ''
  }
}
