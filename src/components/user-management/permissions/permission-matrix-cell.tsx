'use client'

import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { IconButton } from '@mui/material'

export function PermissionMatrixCell({
  granted,
  onToggle,
  label,
  disabled = false,
}: {
  granted: boolean
  onToggle: () => void
  label: string
  disabled?: boolean
}) {
  return (
    <IconButton
      size="small"
      onClick={onToggle}
      disabled={disabled}
      aria-label={label}
      aria-pressed={granted}
      sx={{
        p: 0.25,
        color: granted ? 'primary.main' : 'action.disabled',
        '&:hover': { bgcolor: 'transparent', color: granted ? 'primary.dark' : 'text.disabled' },
      }}
    >
      {granted ? (
        <CheckCircleIcon sx={{ fontSize: 22 }} />
      ) : (
        <RadioButtonUncheckedIcon sx={{ fontSize: 22, opacity: 0.35 }} />
      )}
    </IconButton>
  )
}
