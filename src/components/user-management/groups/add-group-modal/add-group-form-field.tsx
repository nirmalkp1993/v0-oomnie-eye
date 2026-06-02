'use client'

import { Box, Typography } from '@mui/material'
import { fieldLabelSx } from './add-group-modal.styles'

export interface AddGroupFormFieldProps {
  label: string
  required?: boolean
  fullWidth?: boolean
  children: React.ReactNode
}

export function AddGroupFormField({
  label,
  required = false,
  fullWidth = false,
  children,
}: AddGroupFormFieldProps) {
  return (
    <Box sx={fullWidth ? { gridColumn: { xs: '1', sm: '1 / -1' } } : undefined}>
      <Typography component="label" sx={fieldLabelSx}>
        {label}
        {required ? (
          <Box component="span" sx={{ color: 'error.main', ml: 0.25 }}>
            *
          </Box>
        ) : null}
      </Typography>
      {children}
    </Box>
  )
}
