'use client'

import { Box, Typography } from '@mui/material'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import { EnterprisePageShell } from '@/src/components/enterprise'

export function CameraRecordingPlaceholder() {
  return (
    <EnterprisePageShell
      title="Camera Recording"
      description="Manage camera recordings and schedules"
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          minHeight: 320,
          gap: 2,
        }}
      >
        <VideocamOutlinedIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
        <Typography
          variant="body1"
          sx={{
            color: '#4A5565',
            fontFamily: 'Roboto, sans-serif',
          }}
        >
          Camera Recording is under development
        </Typography>
      </Box>
    </EnterprisePageShell>
  )
}
