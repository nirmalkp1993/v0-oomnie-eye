'use client'

import type { ReactNode } from 'react'
import { Box } from '@mui/material'
import { EnterprisePageShell } from '@/src/components/enterprise'

/** User Management pages — same shell and flex layout as camera module */
export function UserManagementPageShell({
  title,
  description = '',
  actions,
  children,
}: {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <EnterprisePageShell title={title} description={description} actions={actions}>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
        {children}
      </Box>
    </EnterprisePageShell>
  )
}
