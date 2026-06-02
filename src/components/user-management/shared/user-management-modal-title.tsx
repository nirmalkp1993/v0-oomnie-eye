'use client'

import CloseIcon from '@mui/icons-material/Close'
import { Box, IconButton, Typography } from '@mui/material'
import {
  modalCloseButtonSx,
  modalSubtitleTextSx,
  modalTitleRowSx,
  modalTitleTextSx,
} from './user-management-modal.styles'

export interface UserManagementModalTitleProps {
  title: string
  subtitle: string
  closeAriaLabel?: string
  onClose: () => void
  disabled?: boolean
}

export function UserManagementModalTitle({
  title,
  subtitle,
  closeAriaLabel = 'Close dialog',
  onClose,
  disabled = false,
}: UserManagementModalTitleProps) {
  return (
    <Box sx={modalTitleRowSx}>
      <Box sx={{ minWidth: 0, pr: 1 }}>
        <Typography variant="h5" component="div" sx={modalTitleTextSx}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={modalSubtitleTextSx}>
          {subtitle}
        </Typography>
      </Box>
      <IconButton
        aria-label={closeAriaLabel}
        onClick={onClose}
        disabled={disabled}
        size="small"
        sx={modalCloseButtonSx}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  )
}
