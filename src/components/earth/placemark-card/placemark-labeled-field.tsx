'use client'

import type { ReactNode } from 'react'
import {
  FormHelperText,
  MenuItem,
  TextField,
  type SelectChangeEvent,
  type TextFieldProps,
} from '@mui/material'
import { Box } from '@mui/material'
import { PlacemarkInfoTooltip } from './placemark-info-tooltip'

/** @deprecated Prefer PlacemarkTextFieldWithInfo for parity with PlacemarkCard */
export function PlacemarkLabeledField({
  label,
  tooltip,
  ...textFieldProps
}: TextFieldProps & { label: string; tooltip?: string }) {
  return (
    <TextField
      fullWidth
      size="small"
      label={
        tooltip ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {label}
            <PlacemarkInfoTooltip title={tooltip} placement="top" />
          </Box>
        ) : (
          label
        )
      }
      {...textFieldProps}
    />
  )
}

/** Select with same floating label + info tooltip pattern as PlacemarkFieldSection */
export function PlacemarkLabeledSelect({
  label,
  tooltip,
  value,
  onChange,
  children,
}: {
  label: string
  tooltip?: string
  value: string
  onChange: (event: SelectChangeEvent) => void
  children: ReactNode
}) {
  return (
    <TextField
      select
      fullWidth
      size="small"
      label={
        tooltip ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {label}
            <PlacemarkInfoTooltip title={tooltip} placement="top" />
          </Box>
        ) : (
          label
        )
      }
      value={value}
      onChange={onChange}
    >
      {children}
    </TextField>
  )
}

export function PlacemarkFieldHelper({ children }: { children: ReactNode }) {
  return <FormHelperText sx={{ mx: 0 }}>{children}</FormHelperText>
}
