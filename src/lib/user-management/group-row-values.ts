import type { GroupRow } from '@/src/types/user-management'

export function getGroupRowCellValue(row: GroupRow, columnId: string): string {
  switch (columnId) {
    case 'groupId':
      return row.groupId
    case 'groupName':
      return row.groupName
    case 'description':
      return row.description
    case 'assignedUsersCount':
      return String(row.assignedUsersCount)
    case 'createdDate':
      return row.createdDate
    default:
      return ''
  }
}
