'use client'

import { useMemo } from 'react'
import FolderIcon from '@mui/icons-material/Folder'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import {
  Avatar,
  Box,
  Breadcrumbs,
  Checkbox,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useUserDirectoryStore } from '@/lib/user-directory-store'
import { useUserGroupStore } from '@/lib/user-group-store'
import { CameraAssignPanelHeader } from '@/components/camera/camera-assign-panel-header'
import { getEnterpriseSettingsCardSx } from '@/src/components/enterprise'
import { getDirectChildGroups } from '@/src/lib/user-management/user-group-tree.utils'
import { getGroupMembers } from '@/src/lib/user-management/group-members.utils'
import {
  myDrawingsBodyRowSx,
  myDrawingsBodySecondaryTypographySx,
  myDrawingsHeaderTypographySx,
  myDrawingsTableBodySx,
  myDrawingsTableCellSx,
  myDrawingsTableHeadSx,
  myDrawingsTableSx,
} from '@/src/components/tables/my-drawings-table-styles'
import type { GroupListItem, UserListItem } from '@/src/types/user-management'

export interface UserGroupFolderBreadcrumb {
  id: string
  name: string
}

function userInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function MemberList({
  members,
  onViewUser,
}: {
  members: UserListItem[]
  onViewUser: (user: UserListItem) => void
}) {
  if (members.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        No members in this folder.
      </Typography>
    )
  }

  return (
    <List dense disablePadding>
      {members.map((member) => (
        <ListItem
          key={member.id}
          onClick={() => onViewUser(member)}
          sx={{ py: 1, px: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
        >
          <ListItemAvatar sx={{ minWidth: 44 }}>
            <Avatar src={member.avatarUrl} alt={member.name} sx={{ width: 32, height: 32, fontSize: 13 }}>
              {userInitials(member.name)}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={member.name}
            secondary={member.email}
            primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
            secondaryTypographyProps={{ variant: 'caption' }}
          />
        </ListItem>
      ))}
    </List>
  )
}

export function UserGroupMembersPanel({
  activeGroup,
  isUnassignedFolder = false,
  unassignedUsers = [],
  breadcrumbItems,
  onBreadcrumbNavigate,
  onOpenSubfolder,
  selectedMemberIds,
  onToggleMemberSelect,
  onViewUser,
  isFullscreen,
  onToggleFullscreen,
}: {
  activeGroup: GroupListItem | null
  isUnassignedFolder?: boolean
  unassignedUsers?: UserListItem[]
  breadcrumbItems: UserGroupFolderBreadcrumb[]
  onBreadcrumbNavigate: (segmentIndex: number) => void
  onOpenSubfolder: (groupId: string) => void
  selectedMemberIds: Set<string>
  onToggleMemberSelect: (userId: string) => void
  onViewUser: (user: UserListItem) => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
}) {
  const groups = useUserGroupStore((state) => state.groups)
  const directoryUsers = useUserDirectoryStore((state) => state.users)

  const childGroups = useMemo(
    () => (activeGroup ? getDirectChildGroups(groups, activeGroup.id) : []),
    [activeGroup, groups],
  )

  const members = useMemo(() => {
    if (isUnassignedFolder) return unassignedUsers
    return activeGroup ? getGroupMembers(activeGroup, directoryUsers) : []
  }, [isUnassignedFolder, unassignedUsers, activeGroup, directoryUsers])

  const isDynamic = !isUnassignedFolder && activeGroup?.type === 'dynamic'

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...getEnterpriseSettingsCardSx(theme),
      })}
    >
      <CameraAssignPanelHeader
        title="Users in folder"
        subtitle={
          isUnassignedFolder
            ? 'Users not linked to any group'
            : activeGroup
              ? `Managing ${activeGroup.name}`
              : 'Select a group on the left'
        }
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
      />

      {breadcrumbItems.length > 0 ? (
        <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Breadcrumbs aria-label="Group folder path">
            {breadcrumbItems.map((item, index) => {
              const isLast = index === breadcrumbItems.length - 1
              return isLast ? (
                <Typography key={item.id} variant="body2" sx={{ fontWeight: 600 }}>
                  {item.name}
                </Typography>
              ) : (
                <Link
                  key={item.id}
                  component="button"
                  type="button"
                  underline="hover"
                  color="inherit"
                  onClick={() => onBreadcrumbNavigate(index)}
                  sx={{ fontSize: 14 }}
                >
                  {item.name}
                </Link>
              )
            })}
          </Breadcrumbs>
        </Box>
      ) : null}

      {!activeGroup && !isUnassignedFolder ? (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          Select a group on the left to view members and subgroups.
        </Typography>
      ) : isUnassignedFolder ? (
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <TableContainer>
            <Table size="small" sx={myDrawingsTableSx}>
              <TableHead sx={myDrawingsTableHeadSx}>
                <TableRow hover={false}>
                  <TableCell sx={myDrawingsTableCellSx}>
                    <Typography variant="body2" sx={myDrawingsHeaderTypographySx}>
                      Members
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={myDrawingsTableBodySx}>
                {members.length === 0 ? (
                  <TableRow hover={false}>
                    <TableCell sx={{ ...myDrawingsTableCellSx, py: 3, textAlign: 'center' }}>
                      <Typography variant="body2" sx={myDrawingsBodySecondaryTypographySx}>
                        All users are assigned to at least one group.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => (
                    <TableRow
                      key={member.id}
                      hover={false}
                      onClick={() => onViewUser(member)}
                      sx={{ ...myDrawingsBodyRowSx({ depth: 0 }), cursor: 'pointer' }}
                    >
                      <TableCell sx={myDrawingsTableCellSx}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>
                            {userInitials(member.name)}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                              {member.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap display="block">
                              {member.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) : isDynamic ? (
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This is a dynamic group. Membership is managed by rules in the group settings.
          </Typography>
          <MemberList members={members} onViewUser={onViewUser} />
        </Box>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          {childGroups.length > 0 ? (
            <TableContainer>
              <Table size="small" sx={myDrawingsTableSx}>
                <TableHead sx={myDrawingsTableHeadSx}>
                  <TableRow hover={false}>
                    <TableCell sx={myDrawingsTableCellSx}>
                      <Typography variant="body2" sx={myDrawingsHeaderTypographySx}>
                        Subgroups
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={myDrawingsTableBodySx}>
                  {childGroups.map((group) => (
                    <TableRow
                      key={group.id}
                      hover={false}
                      onClick={() => onOpenSubfolder(group.id)}
                      sx={{ ...myDrawingsBodyRowSx({ depth: 0 }), cursor: 'pointer' }}
                    >
                      <TableCell sx={myDrawingsTableCellSx}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FolderIcon fontSize="small" color="primary" />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {group.name}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : null}

          <TableContainer>
            <Table size="small" sx={myDrawingsTableSx}>
              <TableHead sx={myDrawingsTableHeadSx}>
                <TableRow hover={false}>
                  <TableCell sx={{ ...myDrawingsTableCellSx, width: 48, px: 1 }} />
                  <TableCell sx={myDrawingsTableCellSx}>
                    <Typography variant="body2" sx={myDrawingsHeaderTypographySx}>
                      Members
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={myDrawingsTableBodySx}>
                {members.length === 0 ? (
                  <TableRow hover={false}>
                    <TableCell colSpan={2} sx={{ ...myDrawingsTableCellSx, py: 3, textAlign: 'center' }}>
                      <Typography variant="body2" sx={myDrawingsBodySecondaryTypographySx}>
                        No members in this folder. Add users from the list on the right.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => {
                    const selected = selectedMemberIds.has(member.id)
                    return (
                      <TableRow
                        key={member.id}
                        hover={false}
                        onClick={() => onViewUser(member)}
                        sx={{
                          ...myDrawingsBodyRowSx({ depth: 0 }),
                          cursor: 'pointer',
                          ...(selected
                            ? {
                                bgcolor: 'action.selected',
                                '&:hover': { bgcolor: 'action.selected' },
                              }
                            : {}),
                        }}
                      >
                        <TableCell
                          sx={{ ...myDrawingsTableCellSx, width: 48, px: 1 }}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Checkbox
                            size="small"
                            checked={selected}
                            onChange={() => onToggleMemberSelect(member.id)}
                            aria-label={`Select ${member.name}`}
                          />
                        </TableCell>
                        <TableCell sx={myDrawingsTableCellSx}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>
                              {userInitials(member.name)}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                                {member.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap display="block">
                                {member.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Paper>
  )
}

export function UserGroupAvailableUsersPanel({
  activeGroup,
  isUnassignedFolder = false,
  availableUsers,
  selectedUserIds,
  onToggleUserSelect,
  onUserDoubleClick,
  isFullscreen,
  onToggleFullscreen,
}: {
  activeGroup: GroupListItem | null
  isUnassignedFolder?: boolean
  availableUsers: UserListItem[]
  selectedUserIds: Set<string>
  onToggleUserSelect: (userId: string) => void
  onUserDoubleClick: (userId: string) => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
}) {
  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...getEnterpriseSettingsCardSx(theme),
      })}
    >
      <CameraAssignPanelHeader
        title="All users"
        subtitle={
          isUnassignedFolder
            ? 'Select a static group on the left to assign users'
            : activeGroup?.type === 'static'
              ? `Add users to ${activeGroup.name} — double-click or use arrows`
              : activeGroup
                ? 'Only static groups support manual member assignment'
                : 'Select a group to assign users'
        }
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
      />
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {!activeGroup && !isUnassignedFolder ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            Select a group on the left to assign users.
          </Typography>
        ) : isUnassignedFolder ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            Pick a static group from the tree, then add users from the list here.
          </Typography>
        ) : activeGroup.type !== 'static' ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            Dynamic groups use membership rules. Edit the group to change rules.
          </Typography>
        ) : availableUsers.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            All users are already in this folder.
          </Typography>
        ) : (
          <List dense disablePadding>
            {availableUsers.map((user) => {
              const selected = selectedUserIds.has(user.id)
              return (
                <ListItem
                  key={user.id}
                  onClick={() => onToggleUserSelect(user.id)}
                  onDoubleClick={() => onUserDoubleClick(user.id)}
                  sx={{
                    py: 1,
                    px: 2,
                    cursor: 'pointer',
                    ...(selected ? { bgcolor: 'action.selected' } : {}),
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 44 }}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: 13 }}>
                      {userInitials(user.name)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.name}
                    secondary={user.email}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <PersonOutlineOutlinedIcon fontSize="small" color="action" />
                </ListItem>
              )
            })}
          </List>
        )}
      </Box>
    </Paper>
  )
}
