'use client'

import { memo, useCallback, useState } from 'react'
import { Box, Menu, MenuItem, Typography } from '@mui/material'
import { BITRIX_SCOPE_DROPDOWN_OPTIONS } from '@/src/constants/role-catalog'
import { BITRIX_ACCESS_UI } from '@/src/constants/bitrix-access-ui'
import { formatScopeGrantLabel } from '@/src/lib/user-management/bitrix-permissions.utils'
import type { ScopeGrantValue } from '@/src/types/permissions-page'

/** Lightweight scope cell — menu mounts only when opened (no per-cell Select). */
export const PermissionScopeCell = memo(function PermissionScopeCell({
  value,
  onChange,
  disabled = false,
  label,
}: {
  value: ScopeGrantValue
  onChange: (value: ScopeGrantValue) => void
  disabled?: boolean
  label: string
}) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null)
  const open = Boolean(anchor)
  const display = formatScopeGrantLabel(value)
  const isDeny = value === 'deny'

  const handlePick = useCallback(
    (next: ScopeGrantValue) => {
      setAnchor(null)
      if (next !== value) onChange(next)
    },
    [onChange, value],
  )

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <Box
        component="button"
        type="button"
        disabled={disabled}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={(e) => {
          if (!disabled) setAnchor(e.currentTarget)
        }}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          bgcolor: 'transparent',
          p: 0,
          m: 0,
          cursor: disabled ? 'default' : 'pointer',
          maxWidth: '100%',
        }}
      >
        <Typography
          variant="body2"
          noWrap
          sx={{
            fontSize: '0.8125rem',
            color: isDeny ? BITRIX_ACCESS_UI.denyColor : BITRIX_ACCESS_UI.linkBlue,
            fontWeight: 400,
            maxWidth: 120,
            borderBottom: isDeny || disabled ? 'none' : `1px dotted ${BITRIX_ACCESS_UI.linkBlue}`,
            lineHeight: 1.5,
            textDecoration: 'none',
            '&:hover': disabled
              ? {}
              : {
                  color: '#1055a0',
                  borderBottomColor: '#1055a0',
                },
          }}
        >
          {isDeny ? 'No' : display}
        </Typography>
      </Box>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        slotProps={{
          paper: {
            sx: {
              maxHeight: 320,
              minWidth: 220,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            },
          },
        }}
      >
        {BITRIX_SCOPE_DROPDOWN_OPTIONS.map((opt) => (
          <MenuItem
            key={opt.id}
            selected={opt.id === value}
            onClick={() => handlePick(opt.id)}
            sx={{
              fontSize: '0.8125rem',
              py: 0.75,
              color: opt.id === 'deny' ? BITRIX_ACCESS_UI.denyColor : BITRIX_ACCESS_UI.textPrimary,
              '&.Mui-selected': {
                bgcolor: '#e8f7fc',
                color: BITRIX_ACCESS_UI.linkBlue,
              },
            }}
          >
            {opt.id === 'deny' ? 'No' : opt.title}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
})
