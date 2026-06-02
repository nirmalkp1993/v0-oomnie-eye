'use client'

import { Typography } from '@mui/material'
import type { RoleStatus } from '@/src/types/user-management'
import { umStatusTextSx } from '@/src/components/user-management/user-management-table-primitives'

export function RoleStatusBadge({ status }: { status: RoleStatus }) {
  return (
    <Typography variant="body2" sx={umStatusTextSx(status === 'active' ? 'active' : 'muted')}>
      {status}
    </Typography>
  )
}
