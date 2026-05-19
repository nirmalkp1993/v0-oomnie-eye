'use client'

import type { ReactNode } from 'react'
import { IconButton, Tooltip } from '@mui/material'
import { InfoOutlined } from '@mui/icons-material'

export function PlacemarkInfoTooltip({
  title,
  placement = 'top',
}: {
  title: string | ReactNode
  placement?: 'top' | 'right' | 'bottom' | 'left'
}) {
  return (
    <Tooltip title={title} placement={placement} arrow enterDelay={200}>
      <IconButton
        size="small"
        aria-label="More information"
        sx={{
          p: 0.5,
          ml: 0.5,
          color: 'text.secondary',
          '&:hover': {
            color: 'text.primary',
            bgcolor: 'action.hover',
          },
        }}
      >
        <InfoOutlined sx={{ fontSize: 18 }} />
      </IconButton>
    </Tooltip>
  )
}
