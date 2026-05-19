'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { Box, TextField, Typography, type TextFieldProps } from '@mui/material'
import { PlacemarkInfoTooltip } from './placemark-info-tooltip'

export interface PlacemarkTextFieldWithInfoProps extends Omit<TextFieldProps, 'label'> {
  label: string
  tooltip?: string | ReactNode
  showCharCounter?: boolean
  maxLength?: number
}

/** Matches OomniEye PlacemarkTextFieldWithInfo (label + info icon inside TextField label). */
export function PlacemarkTextFieldWithInfo({
  label,
  tooltip,
  value,
  onChange,
  showCharCounter = false,
  maxLength,
  ...textFieldProps
}: PlacemarkTextFieldWithInfoProps) {
  const [isFocused, setIsFocused] = useState(false)
  const charCount = typeof value === 'string' ? value.length : String(value ?? '').length
  const showCounter = showCharCounter && (isFocused || charCount > 0)
  const isNearLimit = maxLength != null && charCount > maxLength * 0.95

  return (
    <Box>
      <TextField
        label={
          tooltip ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {label}
              <PlacemarkInfoTooltip title={tooltip} />
            </Box>
          ) : (
            label
          )
        }
        value={value}
        onChange={onChange}
        onFocus={(e) => {
          setIsFocused(true)
          textFieldProps.onFocus?.(e)
        }}
        onBlur={(e) => {
          setIsFocused(false)
          textFieldProps.onBlur?.(e)
        }}
        fullWidth
        size="small"
        {...textFieldProps}
      />
      {showCounter && maxLength != null ? (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.5,
            textAlign: 'right',
            color: isNearLimit ? 'warning.main' : 'text.secondary',
          }}
        >
          {charCount} / {maxLength} characters
        </Typography>
      ) : null}
    </Box>
  )
}
