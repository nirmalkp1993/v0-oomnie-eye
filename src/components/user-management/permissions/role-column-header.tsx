'use client'

import { useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { Box, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import {
  BITRIX_ACCESS_UI,
  BITRIX_ROLE_DISPLAY_NAMES,
} from '@/src/constants/bitrix-access-ui'
import type { RoleListItem } from '@/src/types/user-management'

const ADMIN_ROLE_ID = 'role-tenant-admin'

export function RoleColumnHeader({
  role,
  onAssignUsers,
}: {
  role: RoleListItem
  onAssignUsers?: (role: RoleListItem) => void
}) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const displayName = BITRIX_ROLE_DISPLAY_NAMES[role.id] ?? role.name
  const isAdmin = role.id === ADMIN_ROLE_ID

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
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          dense
          onClick={() => {
            onAssignUsers?.(role)
            setMenuAnchor(null)
          }}
        >
          Assign users
        </MenuItem>
        <MenuItem dense onClick={() => setMenuAnchor(null)}>
          Rename role
        </MenuItem>
        <MenuItem dense onClick={() => setMenuAnchor(null)} disabled={isAdmin}>
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
