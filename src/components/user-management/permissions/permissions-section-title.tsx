'use client'

import { Box, Typography } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import { PlacemarkInfoTooltip } from '@/src/components/earth/placemark-card/placemark-info-tooltip'
import { settingsSectionTitleSx } from './permissions-shared-styles'

export function PermissionsSectionTitle({
  title,
  description,
  sx,
}: {
  title: string
  description: string
  sx?: SxProps<Theme>
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.25,
        mb: 2,
        minWidth: 0,
        ...sx,
      }}
    >
      <Typography variant="subtitle1" sx={{ ...settingsSectionTitleSx, mb: 0 }}>
        {title}
      </Typography>
      <PlacemarkInfoTooltip title={description} placement="top" />
    </Box>
  )
}
