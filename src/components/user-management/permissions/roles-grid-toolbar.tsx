'use client'

import { useMemo, useState } from 'react'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined'
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
import { BitrixAccessMenuItem } from './bitrix-access-menu'

function getRoleVisibilityMenuItems({
  gridRoles,
  visibleRoleIds,
  onVisibleRoleIdsChange,
  onClose,
}: {
  gridRoles: RoleListItem[]
  visibleRoleIds: ReadonlySet<string>
  onVisibleRoleIdsChange: (ids: Set<string>) => void
  onClose?: () => void
}) {
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
    onClose?.()
  }

  return [
    ...gridRoles.map((role) => {
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
    }),
    <MenuItem key="show-all-roles" dense onClick={showAllRoles} sx={{ color: BITRIX_ACCESS_UI.linkBlue }}>
      Show all roles
    </MenuItem>,
  ]
}

export function RolesHeaderCell({
  gridRoles,
  visibleRoleIds,
  onVisibleRoleIdsChange,
  onExpandAll,
  onCollapseAll,
  onAddRole,
  onCloneRole,
}: {
  gridRoles: RoleListItem[]
  visibleRoleIds: ReadonlySet<string>
  onVisibleRoleIdsChange: (ids: Set<string>) => void
  onExpandAll: () => void
  onCollapseAll: () => void
  onAddRole?: () => void
  onCloneRole?: (role: RoleListItem) => void
}) {
  const [visibilityAnchor, setVisibilityAnchor] = useState<null | HTMLElement>(null)
  const [actionsAnchor, setActionsAnchor] = useState<null | HTMLElement>(null)
  const [menuView, setMenuView] = useState<'main' | 'visibility' | 'clone'>('main')

  const total = gridRoles.length
  const visibleCount = visibleRoleIds.size
  const isActionsMenuOpen = Boolean(actionsAnchor)

  const closeActionsMenu = () => {
    setActionsAnchor(null)
    setMenuView('main')
  }

  const openActionsMenu = (anchor: HTMLElement) => {
    setMenuView('main')
    setActionsAnchor(anchor)
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
          <BitrixAccessMenuItem
            key="show-hide-roles"
            icon={<VisibilityOutlinedIcon sx={{ fontSize: 17, color: BITRIX_ACCESS_UI.textSecondary }} />}
            title="Show/hide roles"
            description="Shows or hides roles in this table."
            onClick={() => setMenuView('visibility')}
          />,
        ]
      : menuView === 'visibility'
        ? getRoleVisibilityMenuItems({
            gridRoles,
            visibleRoleIds,
            onVisibleRoleIdsChange,
          })
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
      className={isActionsMenuOpen ? 'roles-header-box is-menu-open' : 'roles-header-box'}
      sx={{
        position: 'relative',
        minWidth: BITRIX_ACCESS_UI.actionColumnWidth - 16,
        '& .roles-header-menu-btn': {
          opacity: 0,
          transition: 'opacity 0.15s ease',
        },
        '&:hover .roles-header-menu-btn, &.is-menu-open .roles-header-menu-btn': {
          opacity: 1,
        },
      }}
    >
      <IconButton
        className="roles-header-menu-btn"
        size="small"
        aria-label="Roles options"
        aria-haspopup="menu"
        aria-expanded={isActionsMenuOpen}
        onClick={(e) => {
          e.stopPropagation()
          openActionsMenu(e.currentTarget)
        }}
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          p: 0.25,
          zIndex: 1,
          color: BITRIX_ACCESS_UI.textSecondary,
          bgcolor: isActionsMenuOpen ? '#eef2f4' : 'transparent',
          borderRadius: 1,
          '&:hover': { bgcolor: '#eef2f4', color: BITRIX_ACCESS_UI.textPrimary },
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
          fontWeight: 600,
          fontSize: '0.8125rem',
          color: BITRIX_ACCESS_UI.textPrimary,
          mb: 1,
          pr: 2.5,
        }}
      >
        Roles
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box
          component="button"
          type="button"
          onClick={(e) => setVisibilityAnchor(e.currentTarget)}
          aria-haspopup="listbox"
          aria-expanded={Boolean(visibilityAnchor)}
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
        anchorEl={visibilityAnchor}
        open={Boolean(visibilityAnchor)}
        onClose={() => setVisibilityAnchor(null)}
        slotProps={{ paper: { sx: { minWidth: 220, mt: 0.5 } } }}
      >
        {getRoleVisibilityMenuItems({
          gridRoles,
          visibleRoleIds,
          onVisibleRoleIdsChange,
          onClose: () => setVisibilityAnchor(null),
        })}
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
