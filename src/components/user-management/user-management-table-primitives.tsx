'use client'

import type { ReactNode } from 'react'
import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import {
  MY_DRAWINGS_TABLE,
  myDrawingsBodyPrimaryTypographySx,
  myDrawingsBodySecondaryTypographySx,
  myDrawingsPrimaryButtonSx,
  myDrawingsToolbarIconButtonSx,
  myDrawingsToolbarOutlineButtonSx,
} from '@/src/components/tables/my-drawings-table-styles'

/** Re-export for page action buttons */
export { myDrawingsPrimaryButtonSx, myDrawingsToolbarIconButtonSx, myDrawingsToolbarOutlineButtonSx }

export const umFilterSelectSx = {
  minWidth: { xs: '100%', sm: 160 },
  flex: { xs: '1 1 160px', md: '0 1 auto' },
  '& .MuiOutlinedInput-root': {
    height: 36,
    fontFamily: 'Roboto, sans-serif',
    fontSize: '14px',
    bgcolor: '#FFFFFF',
    borderRadius: '10px',
  },
  '& .MuiInputLabel-root': {
    fontFamily: 'Roboto, sans-serif',
    fontSize: '14px',
  },
} as const

export function UmFilterSelect({
  label,
  labelId,
  value,
  onChange,
  children,
}: {
  label: string
  labelId: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
}) {
  return (
    <FormControl size="small" sx={umFilterSelectSx}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select labelId={labelId} label={label} value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </Select>
    </FormControl>
  )
}

export function UmPrimaryText({ children, fontWeight = 600 }: { children: ReactNode; fontWeight?: number }) {
  return (
    <Typography variant="body2" noWrap sx={{ ...myDrawingsBodyPrimaryTypographySx, fontWeight }}>
      {children}
    </Typography>
  )
}

export function UmSecondaryText({ children }: { children: ReactNode }) {
  return (
    <Typography variant="body2" noWrap sx={myDrawingsBodySecondaryTypographySx}>
      {children}
    </Typography>
  )
}

export function umStatusTextSx(status: 'active' | 'inactive' | 'pending' | 'warning' | 'error' | 'muted') {
  const colors: Record<typeof status, string> = {
    active: '#16a34a',
    inactive: '#6b7280',
    pending: '#ed6c02',
    warning: '#ed6c02',
    error: '#dc2626',
    muted: MY_DRAWINGS_TABLE.folderClosed,
  }
  return {
    fontFamily: 'Roboto, sans-serif',
    fontSize: '13px',
    fontWeight: 600,
    color: colors[status],
    textTransform: 'capitalize' as const,
  }
}
