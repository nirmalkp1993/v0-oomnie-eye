'use client'

import { memo, useCallback, useState } from 'react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
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
    <>
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
          gap: 0.25,
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
            color: isDeny ? BITRIX_ACCESS_UI.textSecondary : BITRIX_ACCESS_UI.linkBlue,
            fontWeight: isDeny ? 400 : 400,
            maxWidth: 130,
            borderBottom: isDeny ? 'none' : `1px dotted ${BITRIX_ACCESS_UI.linkBlue}`,
            lineHeight: 1.4,
          }}
        >
          {display}
        </Typography>
        {!disabled ? (
          <KeyboardArrowDownIcon sx={{ fontSize: 16, color: BITRIX_ACCESS_UI.textSecondary }} />
        ) : null}
      </Box>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        slotProps={{ paper: { sx: { maxHeight: 320, minWidth: 200 } } }}
      >
        {BITRIX_SCOPE_DROPDOWN_OPTIONS.map((opt) => (
          <MenuItem
            key={opt.id}
            selected={opt.id === value}
            onClick={() => handlePick(opt.id)}
            sx={{
              fontSize: '0.875rem',
              color: opt.id === 'deny' ? BITRIX_ACCESS_UI.textSecondary : 'text.primary',
            }}
          >
            {opt.title}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
})
