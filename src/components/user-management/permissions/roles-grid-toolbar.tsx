'use client'

import { useMemo, useState } from 'react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import {
  Box,
  Checkbox,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material'
import { BITRIX_ACCESS_UI } from '@/src/constants/bitrix-access-ui'
import type { RoleListItem } from '@/src/types/user-management'

export function RolesHeaderCell({
  gridRoles,
  visibleRoleIds,
  onVisibleRoleIdsChange,
  onExpandAll,
  onCollapseAll,
}: {
  gridRoles: RoleListItem[]
  visibleRoleIds: ReadonlySet<string>
  onVisibleRoleIdsChange: (ids: Set<string>) => void
  onExpandAll: () => void
  onCollapseAll: () => void
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const total = gridRoles.length
  const visibleCount = visibleRoleIds.size

  const toggleRole = (roleId: string) => {
    const next = new Set(visibleRoleIds)
    if (next.has(roleId)) {
      if (next.size > 1) next.delete(roleId)
    } else {
      next.add(roleId)
    }
    onVisibleRoleIdsChange(next)
  }

  const showAllRoles = () => {
    onVisibleRoleIdsChange(new Set(gridRoles.map((r) => r.id)))
    setAnchorEl(null)
  }

  return (
    <Box sx={{ minWidth: BITRIX_ACCESS_UI.actionColumnWidth - 16 }}>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          fontSize: '0.8125rem',
          color: BITRIX_ACCESS_UI.textPrimary,
          mb: 1,
        }}
      >
        Roles
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box
          component="button"
          type="button"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-haspopup="listbox"
          aria-expanded={Boolean(anchorEl)}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1,
            py: 0.375,
            border: `1px solid ${BITRIX_ACCESS_UI.borderColor}`,
            borderRadius: 10,
            bgcolor: '#fff',
            cursor: 'pointer',
            flexShrink: 0,
            '&:hover': { bgcolor: BITRIX_ACCESS_UI.sectionBg },
          }}
        >
          <VisibilityOutlinedIcon sx={{ fontSize: 15, color: BITRIX_ACCESS_UI.textSecondary }} />
          <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.primary', whiteSpace: 'nowrap' }}>
            {visibleCount} out of {total}
          </Typography>
          <KeyboardArrowDownIcon sx={{ fontSize: 16, color: BITRIX_ACCESS_UI.textSecondary }} />
        </Box>
        <IconButton
          size="small"
          aria-label="Collapse all modules"
          onClick={onCollapseAll}
          sx={{ p: 0.375, color: BITRIX_ACCESS_UI.textSecondary }}
        >
          <UnfoldLessIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <IconButton
          size="small"
          aria-label="Expand all modules"
          onClick={onExpandAll}
          sx={{ p: 0.375, color: BITRIX_ACCESS_UI.textSecondary }}
        >
          <UnfoldMoreIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { minWidth: 220, mt: 0.5 } } }}
      >
        {gridRoles.map((role) => {
          const label = role.name
          const checked = visibleRoleIds.has(role.id)
          return (
            <MenuItem
              key={role.id}
              dense
              onClick={() => toggleRole(role.id)}
              disabled={checked && visibleCount <= 1}
            >
              <Checkbox size="small" checked={checked} sx={{ p: 0.5, mr: 1 }} />
              <ListItemText primary={label} primaryTypographyProps={{ fontSize: '0.875rem' }} />
            </MenuItem>
          )
        })}
        <MenuItem dense onClick={showAllRoles} sx={{ color: BITRIX_ACCESS_UI.linkBlue }}>
          Show all roles
        </MenuItem>
      </Menu>
    </Box>
  )
}

export function useVisibleGridRoles(
  gridRoles: RoleListItem[],
  visibleRoleIds: ReadonlySet<string>,
) {
  return useMemo(
    () => gridRoles.filter((r) => visibleRoleIds.has(r.id)),
    [gridRoles, visibleRoleIds],
  )
}
