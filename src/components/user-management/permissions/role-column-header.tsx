'use client'

import { useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { Box, IconButton, Menu, Tooltip, Typography } from '@mui/material'
import { BITRIX_ACCESS_UI } from '@/src/constants/bitrix-access-ui'
import { isDeletableGridRole, isSystemRole } from '@/src/lib/user-management/bitrix-permissions.utils'
import type { RoleListItem } from '@/src/types/user-management'
import {
  BitrixAccessMenuDivider,
  BitrixAccessMenuHeader,
  BitrixAccessMenuItem,
  bitrixAccessMenuPaperSx,
} from './bitrix-access-menu'

const ADMIN_ROLE_ID = 'role-tenant-admin'

export function RoleColumnHeader({
  role,
  onAssignUsers,
  onSelectAllPermissions,
  onUnselectAllPermissions,
  onRenameRole,
  onCloneRole,
  onDeleteRole,
}: {
  role: RoleListItem
  onAssignUsers?: (role: RoleListItem) => void
  onSelectAllPermissions?: (role: RoleListItem) => void
  onUnselectAllPermissions?: (role: RoleListItem) => void
  onRenameRole?: (role: RoleListItem) => void
  onCloneRole?: (role: RoleListItem) => void
  onDeleteRole?: (role: RoleListItem) => void
}) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const displayName = role.name
  const isAdmin = role.id === ADMIN_ROLE_ID
  const isLocked = isSystemRole(role.id)
  const canDelete = isDeletableGridRole(role.id)

  const closeMenu = () => setMenuAnchor(null)

  const handleAction = (action?: (role: RoleListItem) => void) => {
    if (!action) return
    action(role)
    closeMenu()
  }

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
          bgcolor: menuAnchor ? '#eef2f4' : 'transparent',
          borderRadius: 1,
          '&:hover': { bgcolor: '#eef2f4', color: BITRIX_ACCESS_UI.textPrimary },
        }}
      >
        <MoreVertIcon sx={{ fontSize: 16 }} />
      </IconButton>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: { sx: [bitrixAccessMenuPaperSx, { minWidth: 320, maxWidth: 380 }] },
        }}
      >
        <BitrixAccessMenuHeader title={displayName} subtitle="Manage role permissions and settings." />
        <BitrixAccessMenuDivider />
        <BitrixAccessMenuItem
          icon={<CheckCircleOutlineIcon sx={{ fontSize: 17, color: '#2ecc71' }} />}
          title="Select all permissions"
          description="Enables all permissions at once."
          disabled={isLocked}
          onClick={() => handleAction(onSelectAllPermissions)}
        />
        <BitrixAccessMenuItem
          icon={<LockOutlinedIcon sx={{ fontSize: 17, color: '#e74c3c' }} />}
          title="Unselect all permissions"
          description="Disables all permissions at once."
          disabled={isLocked}
          onClick={() => handleAction(onUnselectAllPermissions)}
        />
        <BitrixAccessMenuDivider />
        <BitrixAccessMenuItem
          icon={<EditOutlinedIcon sx={{ fontSize: 17, color: BITRIX_ACCESS_UI.primaryBlue }} />}
          title="Rename"
          description="Changes the role's name."
          disabled={isLocked}
          onClick={() => handleAction(onRenameRole)}
        />
        <BitrixAccessMenuItem
          icon={<ContentCopyOutlinedIcon sx={{ fontSize: 17, color: BITRIX_ACCESS_UI.primaryBlue }} />}
          title="Clone"
          description="Creates a new role that is an exact copy of this role."
          onClick={() => handleAction(onCloneRole)}
        />
        <BitrixAccessMenuDivider />
        <BitrixAccessMenuItem
          icon={<DeleteOutlineIcon sx={{ fontSize: 17, color: '#95a5a6' }} />}
          title="Delete"
          description="Deletes the role and all assigned access permissions."
          disabled={!canDelete}
          destructive
          onClick={() => handleAction(onDeleteRole)}
        />
      </Menu>

      <Tooltip title={displayName} placement="top" arrow enterDelay={400}>
        <Typography
          variant="body2"
          noWrap
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            color: 'text.primary',
            mb: 0.75,
            lineHeight: 1.3,
            px: 1.5,
            pr: 2.25,
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
          }}
        >
          {displayName}
        </Typography>
      </Tooltip>

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
