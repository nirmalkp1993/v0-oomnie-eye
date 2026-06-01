'use client'

import FullscreenExitOutlinedIcon from '@mui/icons-material/FullscreenExitOutlined'
import FullscreenOutlinedIcon from '@mui/icons-material/FullscreenOutlined'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'

export function CameraAssignPanelHeader({
  title,
  subtitle,
  isFullscreen,
  onToggleFullscreen,
}: {
  title: string
  subtitle?: string
  isFullscreen: boolean
  onToggleFullscreen: () => void
}) {
  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        borderBottom: 1,
        borderColor: 'divider',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      <Tooltip title={isFullscreen ? 'Exit full screen' : 'Full screen'} placement="left">
        <IconButton
          size="small"
          onClick={onToggleFullscreen}
          aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
          sx={{ flexShrink: 0, mt: -0.25 }}
        >
          {isFullscreen ? (
            <FullscreenExitOutlinedIcon fontSize="small" />
          ) : (
            <FullscreenOutlinedIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  )
}
