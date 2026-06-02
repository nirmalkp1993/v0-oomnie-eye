import type { GroupListItem } from '@/src/types/user-management'

export function getGroupRowCellValue(row: GroupListItem, columnId: string): string {
  switch (columnId) {
    case 'name':
      return row.name
    case 'description':
      return row.description
    case 'type':
      return row.type === 'static' ? 'Static' : 'Dynamic'
    case 'memberCount':
      return String(row.memberCount)
    case 'inheritedRoles':
      return row.inheritedRoles.join(', ')
    case 'scope':
      return row.scope
    case 'status':
      return row.status
    case 'lastUpdated':
      return row.lastUpdated
    default:
      return ''
  }
}
