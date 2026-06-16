'use client'

import { useState } from 'react'
import { Link, Menu, MenuItem, Typography } from '@mui/material'
import {
  ROLE_MATRIX_SCOPE_OPTIONS,
  getRoleMatrixScopeLabel,
  type RoleMatrixScope,
  type UserRoleMatrixAction,
} from '@/src/constants/user-role-permission-matrix'

export function RolePermissionMatrixCell({
  scope,
  applicable,
  actionLabel,
  moduleName,
  readOnly = false,
  onChange,
}: {
  scope: RoleMatrixScope
  applicable: boolean
  actionLabel: string
  moduleName: string
  readOnly?: boolean
  onChange?: (next: RoleMatrixScope) => void
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  if (!applicable) {
    return (
      <Typography variant="body2" color="text.disabled" aria-hidden>
        —
      </Typography>
    )
  }

  const label = getRoleMatrixScopeLabel(scope)
  const ariaLabel = `${actionLabel} for ${moduleName}: ${label}`

  if (readOnly) {
    if (scope === 'deny') {
      return (
        <Typography variant="body2" color="text.secondary" aria-label={ariaLabel}>
          Deny access
        </Typography>
      )
    }
    return (
      <Typography
        variant="body2"
        sx={{ color: 'primary.main', textDecoration: 'underline', textUnderlineOffset: 3 }}
        aria-label={ariaLabel}
      >
        {label}
      </Typography>
    )
  }

  return (
    <>
      <Link
        component="button"
        type="button"
        variant="body2"
        underline={scope === 'deny' ? 'none' : 'always'}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        sx={{
          color: scope === 'deny' ? 'text.secondary' : 'primary.main',
          fontWeight: 400,
          textUnderlineOffset: 3,
          verticalAlign: 'baseline',
        }}
      >
        {scope === 'deny' ? 'Deny access' : label}
      </Link>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { minWidth: 180 } } }}
      >
        {ROLE_MATRIX_SCOPE_OPTIONS.map((option) => (
          <MenuItem
            key={option.id}
            selected={option.id === scope}
            onClick={() => {
              onChange?.(option.id)
              setAnchorEl(null)
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
