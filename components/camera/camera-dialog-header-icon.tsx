'use client'

import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import { Box } from '@mui/material'
import { PLACEMARK_HEADER_GRADIENT } from '@/src/components/earth/placemark-card/placemark-card-constants'

export function CameraDialogHeaderIcon({ variant = 'viewing' }: { variant?: 'viewing' | 'edit' }) {
  const background =
    variant === 'edit' ? PLACEMARK_HEADER_GRADIENT.edit : PLACEMARK_HEADER_GRADIENT.viewing

  return (
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: 1,
        background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <VideocamOutlinedIcon sx={{ fontSize: 32, color: 'white' }} />
    </Box>
  )
}
