'use client'

import type { ReactNode } from 'react'
import { Paper, Table, TableContainer } from '@mui/material'
import { getEnterpriseSettingsCardSx } from '@/src/components/enterprise'
import { myDrawingsTableSx } from './permissions-drawings-table-styles'

export function PermissionsDrawingsTableShell({
  children,
  maxHeight = 560,
  minHeight,
  'aria-label': ariaLabel,
}: {
  children: ReactNode
  maxHeight?: number
  minHeight?: number
  'aria-label'?: string
}) {
  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        overflow: 'hidden',
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        ...getEnterpriseSettingsCardSx(theme),
      })}
    >
      <TableContainer sx={{ maxHeight, minHeight, overflow: 'auto' }}>
        <Table stickyHeader size="small" sx={myDrawingsTableSx} aria-label={ariaLabel}>
          {children}
        </Table>
      </TableContainer>
    </Paper>
  )
}
