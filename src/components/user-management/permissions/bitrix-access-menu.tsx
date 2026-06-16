'use client'

import type { ReactNode } from 'react'
import CheckIcon from '@mui/icons-material/Check'
import {
  Box,
  Button,
  Checkbox,
  Divider,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Typography,
  type SxProps,
  type Theme,
} from '@mui/material'
import { BITRIX_ACCESS_UI } from '@/src/constants/bitrix-access-ui'

export const bitrixAccessMenuPaperSx: SxProps<Theme> = {
  mt: 0.75,
  borderRadius: 2.5,
  border: `1px solid ${BITRIX_ACCESS_UI.borderColor}`,
  boxShadow: '0 8px 28px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(15, 23, 42, 0.06)',
  overflow: 'hidden',
  py: 0.75,
  minWidth: 300,
  maxWidth: 360,
}

export function BitrixAccessMenuHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <Box sx={{ px: 2, pt: 0.75, pb: 1 }}>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          fontWeight: 700,
          fontSize: '0.6875rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: BITRIX_ACCESS_UI.textSecondary,
          lineHeight: 1.2,
        }}
      >
        {title}
      </Typography>
      {subtitle ? (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.35,
            fontSize: '0.75rem',
            color: BITRIX_ACCESS_UI.textSecondary,
            lineHeight: 1.35,
          }}
        >
          {subtitle}
        </Typography>
      ) : null}
    </Box>
  )
}

export function BitrixAccessMenuItem({
  icon,
  title,
  description,
  selected = false,
  onClick,
  disabled = false,
  destructive = false,
  multiSelect = false,
}: {
  icon: ReactNode
  title: string
  description?: string
  selected?: boolean
  onClick: () => void
  disabled?: boolean
  destructive?: boolean
  multiSelect?: boolean
}) {
  return (
    <MenuItem
      dense
      disabled={disabled}
      selected={selected && !multiSelect}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      sx={{
        position: 'relative',
        py: 1.15,
        px: 1.5,
        mx: 0.75,
        my: 0.15,
        borderRadius: 1.5,
        alignItems: 'flex-start',
        gap: 1.25,
        transition: 'background-color 0.15s ease',
        '&.Mui-selected': {
          bgcolor: '#e8f7fc',
          '&:hover': { bgcolor: '#dff3fb' },
        },
        '&:hover': {
          bgcolor: destructive && !disabled ? 'error.50' : BITRIX_ACCESS_UI.rowHoverBg,
        },
      }}
    >
      {multiSelect ? (
        <Checkbox
          size="small"
          checked={selected}
          disabled={disabled}
          tabIndex={-1}
          sx={{
            p: 0,
            mt: 0.35,
            mr: 0.25,
            color: destructive ? 'error.main' : BITRIX_ACCESS_UI.textSecondary,
            '&.Mui-checked': { color: BITRIX_ACCESS_UI.primaryBlue },
          }}
        />
      ) : null}
      <ListItemIcon sx={{ minWidth: 34, mt: 0.1 }}>
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 1.25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: destructive && !disabled ? 'error.50' : '#f3f6f8',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </ListItemIcon>
      <ListItemText
        primary={title}
        secondary={description}
        sx={{ my: 0 }}
        primaryTypographyProps={{
          fontWeight: 600,
          fontSize: '0.8125rem',
          color: destructive && !disabled ? 'error.main' : BITRIX_ACCESS_UI.textPrimary,
          lineHeight: 1.35,
          pr: selected && !multiSelect ? 2 : 0,
        }}
        secondaryTypographyProps={{
          fontSize: '0.75rem',
          color: BITRIX_ACCESS_UI.textSecondary,
          lineHeight: 1.4,
          mt: 0.25,
          whiteSpace: 'normal',
        }}
      />
      {selected && !multiSelect ? (
        <CheckIcon
          sx={{
            fontSize: 18,
            color: BITRIX_ACCESS_UI.primaryBlue,
            position: 'absolute',
            right: 14,
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        />
      ) : null}
    </MenuItem>
  )
}

export function BitrixAccessMenuFooter({ onDone }: { onDone: () => void }) {
  return (
    <Box
      sx={{
        px: 1.5,
        pt: 0.75,
        pb: 0.5,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <Button
        size="small"
        variant="contained"
        onClick={onDone}
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.8125rem',
          borderRadius: 1.5,
          px: 2,
          boxShadow: 'none',
          bgcolor: BITRIX_ACCESS_UI.primaryBlue,
          '&:hover': { bgcolor: '#25b8e6', boxShadow: 'none' },
        }}
      >
        Done
      </Button>
    </Box>
  )
}

export function BitrixAccessMenuDivider() {
  return <Divider sx={{ my: 0.75, borderColor: BITRIX_ACCESS_UI.borderColor }} />
}
