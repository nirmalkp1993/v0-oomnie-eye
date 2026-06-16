'use client'

import { useEffect, useRef, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import Groups2OutlinedIcon from '@mui/icons-material/Groups2Outlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { Box, IconButton, Menu, TextField, Tooltip, Typography } from '@mui/material'
import { BITRIX_ACCESS_UI } from '@/src/constants/bitrix-access-ui'
import { isDeletableGridRole, isSystemRole } from '@/src/lib/user-management/bitrix-permissions.utils'
import { getRoleMemberDisplaySummary } from '@/src/lib/user-management/role-members-picker.utils'
import type { RoleMemberPickerItem, RoleMemberSelection } from '@/src/types/permissions-page'
import type { RoleListItem } from '@/src/types/user-management'
import {
  BitrixAccessMenuDivider,
  BitrixAccessMenuHeader,
  BitrixAccessMenuItem,
  bitrixAccessMenuPaperSx,
} from './bitrix-access-menu'


const ADMIN_ROLE_ID = 'role-tenant-admin'
const MEMBER_AVATAR_SIZE = 26

function MemberAvatar({ item, index }: { item: RoleMemberPickerItem; index: number }) {
  const isUser = item.type === 'user'
  return (
    <Tooltip title={item.label} placement="top" arrow>
      <Box
        sx={{
          width: MEMBER_AVATAR_SIZE,
          height: MEMBER_AVATAR_SIZE,
          borderRadius: '50%',
          border: '2px solid #fff',
          bgcolor: isUser ? '#6b7c93' : '#4a90c8',
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          ml: index === 0 ? 0 : '-8px',
          position: 'relative',
          zIndex: 10 - index,
          flexShrink: 0,
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
        }}
      >
        {isUser ? (
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, lineHeight: 1 }}>
            {item.label.slice(0, 1).toUpperCase()}
          </Typography>
        ) : (
          <Groups2OutlinedIcon sx={{ fontSize: 13 }} />
        )}
      </Box>
    </Tooltip>
  )
}

function RoleMembersStrip({
  role,
  memberSelection,
  isAdmin,
  onAssignUsers,
}: {
  role: RoleListItem
  memberSelection?: RoleMemberSelection
  isAdmin: boolean
  onAssignUsers: (role: RoleListItem) => void
}) {
  const selection = memberSelection ?? { userIds: [], groupIds: [], departmentIds: [] }
  const { visible, overflow, total } = getRoleMemberDisplaySummary(selection, 3)
  const hasMembers = total > 0
  const assignLabel = isAdmin ? `Users in ${role.name}` : `Assign users to ${role.name}`

  return (
    <Box
      className="role-members-strip"
      onClick={() => onAssignUsers(role)}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.5,
        minHeight: 30,
        px: 0.25,
        py: 0.25,
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
        '&:hover': { bgcolor: 'rgba(47, 198, 246, 0.06)' },
        '&:hover .role-assign-plus': {
          opacity: 1,
          transform: 'scale(1)',
        },
      }}
    >
      {hasMembers ? (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', pl: 0.25 }}>
          {visible.map((item, index) => (
            <MemberAvatar key={`${item.type}-${item.id}`} item={item} index={index} />
          ))}
          {overflow > 0 ? (
            <Box
              sx={{
                width: MEMBER_AVATAR_SIZE,
                height: MEMBER_AVATAR_SIZE,
                borderRadius: '50%',
                border: '2px solid #fff',
                bgcolor: '#eef2f4',
                color: BITRIX_ACCESS_UI.textSecondary,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                ml: '-8px',
                fontSize: '0.62rem',
                fontWeight: 700,
                flexShrink: 0,
                boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
              }}
            >
              +{overflow}
            </Box>
          ) : null}
        </Box>
      ) : null}

      <Tooltip title={assignLabel}>
        <IconButton
          className="role-assign-plus"
          size="small"
          aria-label={assignLabel}
          onClick={(event) => {
            event.stopPropagation()
            onAssignUsers(role)
          }}
          sx={{
            p: 0,
            width: 26,
            height: 26,
            ml: hasMembers ? 0.25 : 0,
            color: BITRIX_ACCESS_UI.primaryBlue,
            bgcolor: '#f3f5f7',
            border: `1px solid ${BITRIX_ACCESS_UI.borderColor}`,
            borderRadius: '50%',
            opacity: hasMembers ? 0 : 1,
            transform: hasMembers ? 'scale(0.92)' : 'scale(1)',
            transition: 'opacity 0.18s ease, transform 0.18s ease, background-color 0.15s ease',
            '&:hover': {
              bgcolor: '#e8f7fc',
              borderColor: BITRIX_ACCESS_UI.primaryBlue,
            },
          }}
        >
          {isAdmin ? (
            <GroupOutlinedIcon sx={{ fontSize: 15 }} />
          ) : (
            <AddIcon sx={{ fontSize: 15 }} />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  )
}

export function RoleColumnHeader({
  role,
  memberSelection,
  isRenaming = false,
  onRenameCommit,
  onRenameCancel,
  onAssignUsers,
  onSelectAllPermissions,
  onUnselectAllPermissions,
  onRenameRole,
  onCloneRole,
  onDeleteRole,
}: {
  role: RoleListItem
  memberSelection?: RoleMemberSelection
  isRenaming?: boolean
  onRenameCommit?: (name: string) => void
  onRenameCancel?: () => void
  onAssignUsers?: (role: RoleListItem) => void
  onSelectAllPermissions?: (role: RoleListItem) => void
  onUnselectAllPermissions?: (role: RoleListItem) => void
  onRenameRole?: (role: RoleListItem) => void
  onCloneRole?: (role: RoleListItem) => void
  onDeleteRole?: (role: RoleListItem) => void
}) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [draftName, setDraftName] = useState(role.name)
  const inputRef = useRef<HTMLInputElement>(null)
  const ignoreBlurRef = useRef(false)
  const committedRef = useRef(false)
  const displayName = role.name
  const isAdmin = role.id === ADMIN_ROLE_ID
  const isLocked = isSystemRole(role.id)
  const canDelete = isDeletableGridRole(role.id)

  useEffect(() => {
    if (!isRenaming) {
      committedRef.current = false
      return
    }

    setDraftName(role.name)
    ignoreBlurRef.current = true
    const focusTimer = window.setTimeout(() => {
      const input = inputRef.current
      if (input) {
        input.focus()
        input.select()
      }
      ignoreBlurRef.current = false
    }, 0)

    return () => window.clearTimeout(focusTimer)
  }, [isRenaming, role.id, role.name])

  const closeMenu = () => setMenuAnchor(null)

  const handleAction = (action?: (role: RoleListItem) => void) => {
    if (!action) return
    action(role)
    closeMenu()
  }

  const handleStartRename = () => {
    closeMenu()
    window.setTimeout(() => onRenameRole?.(role), 0)
  }

  const commitRename = () => {
    const value = inputRef.current?.value ?? draftName
    onRenameCommit?.(value)
  }

  const handleRenameBlur = () => {
    if (ignoreBlurRef.current) return
    if (committedRef.current) {
      committedRef.current = false
      return
    }
    window.setTimeout(() => {
      if (document.activeElement === inputRef.current) return
      commitRename()
    }, 0)
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      committedRef.current = true
      commitRename()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onRenameCancel?.()
    }
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
        disableRestoreFocus
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
          onClick={handleStartRename}
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

      {isRenaming ? (
        <TextField
          inputRef={inputRef}
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onBlur={handleRenameBlur}
          onKeyDown={handleRenameKeyDown}
          size="small"
          fullWidth
          slotProps={{
            input: {
              'aria-label': `Rename ${displayName}`,
              sx: {
                fontSize: '0.8125rem',
                fontWeight: 600,
                textAlign: 'center',
                py: 0.5,
                px: 1,
              },
            },
          }}
          sx={{
            mb: 0.75,
            '& .MuiOutlinedInput-root': {
              borderRadius: 1,
              '& fieldset': { borderColor: BITRIX_ACCESS_UI.primaryBlue },
            },
          }}
        />
      ) : (
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
      )}

      {onAssignUsers ? (
        <RoleMembersStrip
          role={role}
          memberSelection={memberSelection}
          isAdmin={isAdmin}
          onAssignUsers={onAssignUsers}
        />
      ) : null}
    </Box>
  )
}
