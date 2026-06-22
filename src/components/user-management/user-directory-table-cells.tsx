'use client'

import type { ReactNode } from 'react'
import {
  UmPrimaryText,
  UmSecondaryText,
} from '@/src/components/user-management/user-management-table-primitives'
import { UserStatusBadge } from '@/src/components/user-management/user-status-badge'
import { formatHierarchyFieldDisplay } from '@/src/lib/hierarchy-path.utils'
import type { UserListItem } from '@/src/types/user-management'

export function renderUserDirectoryCell(row: UserListItem, columnId: string): ReactNode {
  switch (columnId) {
    case 'name':
      return <UmPrimaryText>{row.name}</UmPrimaryText>
    case 'email':
      return <UmSecondaryText>{row.email}</UmSecondaryText>
    case 'roles':
      return <UmSecondaryText>{row.roles.join(', ') || '—'}</UmSecondaryText>
    case 'groups':
      return <UmSecondaryText>{row.groups.join(', ') || '—'}</UmSecondaryText>
    case 'department':
      return <UmSecondaryText>{formatHierarchyFieldDisplay(row.department)}</UmSecondaryText>
    case 'office':
      return <UmSecondaryText>{row.office}</UmSecondaryText>
    case 'lastLogin':
      return <UmSecondaryText>{row.lastLogin ?? '—'}</UmSecondaryText>
    case 'status':
      return <UserStatusBadge status={row.status} />
    default:
      return null
  }
}
