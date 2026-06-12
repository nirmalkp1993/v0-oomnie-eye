'use client'

import { Typography } from '@mui/material'
import type { UserStatus } from '@/src/types/user-management'
import { umStatusTextSx } from '@/src/components/user-management/user-management-table-primitives'

const STATUS_KIND: Record<UserStatus, 'active' | 'inactive' | 'pending' | 'error' | 'muted' | 'warning'> = {
  active: 'active',
  inactive: 'muted',
  pending: 'pending',
  suspended: 'error',
  archived: 'muted',
  retired: 'warning',
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return (
    <Typography variant="body2" sx={umStatusTextSx(STATUS_KIND[status])}>
      {status}
    </Typography>
  )
}
