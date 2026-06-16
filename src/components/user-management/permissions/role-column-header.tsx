'use client'

import { useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { Box, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import { BITRIX_ACCESS_UI } from '@/src/constants/bitrix-access-ui'
import { isDeletableGridRole } from '@/src/lib/user-management/bitrix-permissions.utils'
import type { RoleListItem } from '@/src/types/user-management'

const ADMIN_ROLE_ID = 'role-tenant-admin'

export function RoleColumnHeader({
  role,
  onAssignUsers,
  onEditRole,
  onDeleteRole,
}: {
  role: RoleListItem
  onAssignUsers?: (role: RoleListItem) => void
  onEditRole?: (role: RoleListItem) => void
  onDeleteRole?: (role: RoleListItem) => void
}) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const displayName = role.name
  const isAdmin = role.id === ADMIN_ROLE_ID
  const canDelete = isDeletableGridRole(role.id)

  const closeMenu = () => setMenuAnchor(null)

  return (
    <Box
      sx={{
        position: 'relative',
        textAlign: 'center',
        minWidth: BITRIX_ACCESS_UI.roleColumnMinWidth,
        px: 0.5,
        pt: 0.25,
        pb: 0.5,
      }}
    >
      <IconButton
        size="small"
        aria-label={`${displayName} options`}
        onClick={(e) => setMenuAnchor(e.currentTarget)}
        sx={{
          position: 'absolute',
          top: -4,
          right: -4,
          p: 0.25,
          color: BITRIX_ACCESS_UI.textSecondary,
        }}
      >
        <MoreVertIcon sx={{ fontSize: 16 }} />
      </IconButton>
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem
          dense
          onClick={() => {
            onAssignUsers?.(role)
            closeMenu()
          }}
        >
          Assign users
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            onEditRole?.(role)
            closeMenu()
          }}
        >
          Edit role
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            onDeleteRole?.(role)
            closeMenu()
          }}
          disabled={!canDelete}
          sx={{ color: canDelete ? 'error.main' : undefined }}
        >
          Delete role
        </MenuItem>
      </Menu>

      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          fontSize: '0.8125rem',
          color: 'text.primary',
          mb: 0.75,
          lineHeight: 1.3,
          px: 1.5,
        }}
      >
        {displayName}
      </Typography>

      {onAssignUsers ? (
        <Tooltip title={isAdmin ? `Users in ${displayName}` : `Assign users to ${displayName}`}>
          <IconButton
            size="small"
            aria-label={isAdmin ? `Users in ${displayName}` : `Assign users to ${displayName}`}
            onClick={() => onAssignUsers(role)}
            sx={{
              p: 0,
              width: 28,
              height: 28,
              color: BITRIX_ACCESS_UI.primaryBlue,
              border: `1.5px solid ${BITRIX_ACCESS_UI.primaryBlue}`,
              borderRadius: '50%',
              '&:hover': { bgcolor: '#e8f7fc' },
            }}
          >
            {isAdmin ? (
              <GroupOutlinedIcon sx={{ fontSize: 16 }} />
            ) : (
              <AddIcon sx={{ fontSize: 16 }} />
            )}
          </IconButton>
        </Tooltip>
      ) : null}
    </Box>
  )
}
