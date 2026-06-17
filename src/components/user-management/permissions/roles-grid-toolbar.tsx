'use client'

import { useMemo, useState } from 'react'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined'
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
import {
  myDrawingsHeaderTypographySx,
  myDrawingsToolbarOutlineButtonSx,
} from '@/src/components/user-management/permissions/permissions-shared-styles'
import type { RoleListItem } from '@/src/types/user-management'
import { BitrixAccessMenuItem } from './bitrix-access-menu'

export function RoleColumnVisibilityPicker({
  gridRoles,
  visibleRoleIds,
  onVisibleRoleIdsChange,
}: {
  gridRoles: RoleListItem[]
  visibleRoleIds: ReadonlySet<string>
  onVisibleRoleIdsChange: (ids: Set<string>) => void
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
    <>
      <Box
        component="button"
        type="button"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-haspopup="listbox"
        aria-expanded={Boolean(anchorEl)}
        aria-label="Show or hide role columns"
        sx={{
          ...myDrawingsToolbarOutlineButtonSx,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1.25,
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <VisibilityOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.primary', whiteSpace: 'nowrap' }}>
          {visibleCount} out of {total}
        </Typography>
        <KeyboardArrowDownIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { minWidth: 220, mt: 0.5 } } }}
      >
        {gridRoles.map((role) => {
          const checked = visibleRoleIds.has(role.id)
          return (
            <MenuItem
              key={role.id}
              dense
              onClick={() => toggleRole(role.id)}
              disabled={checked && visibleCount <= 1}
            >
              <Checkbox size="small" checked={checked} sx={{ p: 0.5, mr: 1 }} />
              <ListItemText primary={role.name} primaryTypographyProps={{ fontSize: '0.875rem' }} />
            </MenuItem>
          )
        })}
        <MenuItem dense onClick={showAllRoles} sx={{ color: BITRIX_ACCESS_UI.linkBlue }}>
          Show all roles
        </MenuItem>
      </Menu>
    </>
  )
}

export function RolesHeaderCell({
  gridRoles,
  onAddRole,
  onCloneRole,
}: {
  gridRoles: RoleListItem[]
  onAddRole?: () => void
  onCloneRole?: (role: RoleListItem) => void
}) {
  const [actionsAnchor, setActionsAnchor] = useState<null | HTMLElement>(null)
  const [menuView, setMenuView] = useState<'main' | 'clone'>('main')
  const isActionsMenuOpen = Boolean(actionsAnchor)

  const closeActionsMenu = () => {
    setActionsAnchor(null)
    setMenuView('main')
  }

  const actionsMenuItems =
    menuView === 'main'
      ? [
          <BitrixAccessMenuItem
            key="add-new-role"
            icon={<PostAddOutlinedIcon sx={{ fontSize: 17, color: '#2ecc71' }} />}
            title="Add new role"
            description="Creates a new role."
            onClick={() => {
              onAddRole?.()
              closeActionsMenu()
            }}
          />,
          <BitrixAccessMenuItem
            key="clone-role"
            icon={<ContentCopyOutlinedIcon sx={{ fontSize: 17, color: BITRIX_ACCESS_UI.primaryBlue }} />}
            title="Clone role"
            description="Creates a new role that is an exact copy of an existing role."
            onClick={() => setMenuView('clone')}
          />,
        ]
      : gridRoles.map((role) => (
          <MenuItem
            key={role.id}
            dense
            onClick={() => {
              onCloneRole?.(role)
              closeActionsMenu()
            }}
          >
            <ListItemText primary={role.name} primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </MenuItem>
        ))

  return (
    <Box
      sx={{
        position: 'relative',
        minWidth: BITRIX_ACCESS_UI.actionColumnWidth - 16,
      }}
    >
      <IconButton
        size="small"
        aria-label="Roles options"
        aria-haspopup="menu"
        aria-expanded={isActionsMenuOpen}
        onClick={(e) => {
          e.stopPropagation()
          setMenuView('main')
          setActionsAnchor(e.currentTarget)
        }}
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          p: 0.25,
          zIndex: 1,
          color: BITRIX_ACCESS_UI.textSecondary,
          bgcolor: isActionsMenuOpen ? BITRIX_ACCESS_UI.accentHoverBg : 'transparent',
          borderRadius: 1,
          '&:hover': {
            bgcolor: BITRIX_ACCESS_UI.accentHoverBg,
            color: BITRIX_ACCESS_UI.textPrimary,
          },
        }}
      >
        <MoreVertIcon sx={{ fontSize: 16 }} />
      </IconButton>
      <Menu
        anchorEl={actionsAnchor}
        open={isActionsMenuOpen}
        onClose={closeActionsMenu}
        disableRestoreFocus
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.75,
              borderRadius: 2.5,
              border: `1px solid ${BITRIX_ACCESS_UI.borderColor}`,
              boxShadow:
                '0 8px 28px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(15, 23, 42, 0.06)',
              overflow: 'hidden',
              py: 0.75,
              ...(menuView === 'main'
                ? { minWidth: 320, maxWidth: 380 }
                : { minWidth: 220 }),
            },
          },
        }}
      >
        {actionsMenuItems}
      </Menu>

      <Typography
        variant="body2"
        sx={{
          ...myDrawingsHeaderTypographySx,
          pr: 2.5,
        }}
      >
        Roles
      </Typography>
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
