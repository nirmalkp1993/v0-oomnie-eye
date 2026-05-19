'use client'

import type { ReactNode } from 'react'
import { Box, Typography } from '@mui/material'

/**
 * Page shell aligned with OomniEye SettingsPage: accent title, secondary description,
 * background from theme palette.
 */
export function EnterprisePageShell({
  title,
  description,
  actions,
  children,
}: {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        gap: 3,
        p: 3,
        bgcolor: 'background.default',
        color: 'text.primary',
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { sm: 'flex-start' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" color="warning.main" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {description ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {description}
            </Typography>
          ) : null}
        </Box>
        {actions ? (
          <Box sx={{ display: 'flex', flexShrink: 0, flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
            {actions}
          </Box>
        ) : null}
      </Box>
      {children}
    </Box>
  )
}
