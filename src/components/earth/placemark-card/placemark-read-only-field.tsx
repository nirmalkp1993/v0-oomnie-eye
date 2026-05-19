'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { ContentCopy as CopyIcon } from '@mui/icons-material'
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'

export interface PlacemarkReadOnlyFieldProps {
  label: string
  value: string | number | string[] | null | undefined
  format?: 'text' | 'coordinate' | 'markdown' | 'list' | 'date' | 'number'
  icon?: ReactNode
  copyable?: boolean
  showPlaceholder?: boolean
}

/** Matches OomniEye ReadOnlyField (PlacemarkViewingModePanels / PlacemarkCard). */
export function PlacemarkReadOnlyField({
  label,
  value,
  format = 'text',
  icon,
  copyable = false,
  showPlaceholder = true,
}: PlacemarkReadOnlyFieldProps) {
  const theme = useTheme()
  const [copied, setCopied] = useState(false)

  const isEmpty =
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)

  const handleCopy = () => {
    const textToCopy = Array.isArray(value) ? value.join(', ') : String(value)
    void navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const renderValue = () => {
    if (isEmpty && showPlaceholder) {
      return (
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.disabled,
            fontStyle: 'italic',
          }}
        >
          Not set
        </Typography>
      )
    }

    switch (format) {
      case 'coordinate':
        return (
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.95rem',
              color: theme.palette.text.primary,
            }}
          >
            {value}
          </Typography>
        )
      case 'markdown':
        return (
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {String(value)}
          </Typography>
        )
      case 'list':
        if (Array.isArray(value)) {
          return (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {value.map((item, index) => (
                <Chip
                  key={index}
                  label={item}
                  size="small"
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                />
              ))}
            </Stack>
          )
        }
        return <Typography variant="body1">{String(value)}</Typography>
      case 'number':
        return (
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.95rem',
            }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Typography>
        )
      default:
        return <Typography variant="body1">{String(value)}</Typography>
    }
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
        {icon ? (
          <Box
            sx={{
              color: theme.palette.text.secondary,
              display: 'flex',
              alignItems: 'center',
              fontSize: '1.25rem',
            }}
          >
            {icon}
          </Box>
        ) : null}
        <Typography
          variant="subtitle2"
          sx={{
            color: theme.palette.text.secondary,
            fontWeight: 600,
            letterSpacing: '0.01em',
          }}
        >
          {label}
        </Typography>
        {copyable && !isEmpty ? (
          <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
            <IconButton
              size="small"
              onClick={handleCopy}
              sx={{
                ml: 'auto',
                color: copied ? theme.palette.success.main : theme.palette.text.secondary,
              }}
            >
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null}
      </Stack>
      <Box sx={{ pl: icon ? 4.5 : 0 }}>{renderValue()}</Box>
    </Box>
  )
}
