'use client'

import { useMemo, useState, type DragEvent } from 'react'
import FolderIcon from '@mui/icons-material/Folder'
import {
  Box,
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
import { UserGroupAssignUsersExplorer } from '@/src/components/user-management/groups/user-group-assign-users-explorer'
import type { UserGroupFolderBreadcrumb } from '@/src/components/user-management/groups/user-group-folder-breadcrumbs'
import { getDirectChildGroups } from '@/src/lib/user-management/user-group-tree.utils'
import { getGroupMembers } from '@/src/lib/user-management/group-members.utils'
import {
  myDrawingsBodyRowSx,
  myDrawingsHeaderTypographySx,
  myDrawingsTableBodySx,
  myDrawingsTableCellSx,
  myDrawingsTableHeadSx,
  myDrawingsTableSx,
} from '@/src/components/tables/my-drawings-table-styles'
import type { GroupListItem, UserListItem } from '@/src/types/user-management'

export type { UserGroupFolderBreadcrumb } from '@/src/components/user-management/groups/user-group-folder-breadcrumbs'

export function UserGroupMembersPanel({
  activeGroup,
  isUnassignedFolder = false,
  unassignedUsers = [],
  breadcrumbItems,
  onBreadcrumbNavigate,
  onOpenSubfolder,
  selectedMemberIds,
  onMemberSelectionChange,
  onViewUser,
  onDragOver,
  onDragLeave,
  onDrop,
  dropActive = false,
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
  onMemberSelectionChange: (ids: string[]) => void
  onViewUser: (user: UserListItem) => void
  onDragOver?: (e: DragEvent) => void
  onDragLeave?: (e: DragEvent) => void
  onDrop?: (e: DragEvent) => void
  dropActive?: boolean
  isFullscreen: boolean
  onToggleFullscreen: () => void
}) {
  const groups = useUserGroupStore((state) => state.groups)
  const directoryUsers = useUserDirectoryStore((state) => state.users)
  const [panelSearch, setPanelSearch] = useState('')

  const childGroups = useMemo(
    () => (activeGroup ? getDirectChildGroups(groups, activeGroup.id) : []),
    [activeGroup, groups],
  )

  const members = useMemo(() => {
    if (isUnassignedFolder) return unassignedUsers
    return activeGroup ? getGroupMembers(activeGroup, directoryUsers) : []
  }, [isUnassignedFolder, unassignedUsers, activeGroup, directoryUsers])

  const isDynamic = !isUnassignedFolder && activeGroup?.type === 'dynamic'
  const showMemberTable = Boolean(activeGroup) || isUnassignedFolder
  const memberCheckboxSelection = Boolean(activeGroup) && activeGroup?.type === 'static'
  const currentFolderName = breadcrumbItems[breadcrumbItems.length - 1]?.name

  return (
    <Paper
      elevation={0}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      sx={(theme) => ({
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...getEnterpriseSettingsCardSx(theme),
        ...(dropActive
          ? {
              outline: `2px dashed ${theme.palette.primary.main}`,
              outlineOffset: -2,
            }
          : {}),
      })}
    >
      <CameraAssignPanelHeader
        title={currentFolderName ? `Users in ${currentFolderName}` : 'Users in folder'}
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

      {!showMemberTable ? (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          Select a group on the left to view members and subgroups.
        </Typography>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {isDynamic ? (
            <Typography variant="body2" color="text.secondary" sx={{ px: 2, pt: 2, pb: 1 }}>
              This is a dynamic group. Membership is managed by rules in the group settings.
            </Typography>
          ) : null}

          {!isUnassignedFolder && !isDynamic && childGroups.length > 0 ? (
            <TableContainer sx={{ flexShrink: 0, maxHeight: '28%' }}>
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

          <UserGroupAssignUsersExplorer
            storageKey="explorer-list-table:user-group-in-folder"
            users={members}
            searchQuery={panelSearch}
            onSearchChange={setPanelSearch}
            breadcrumbItems={breadcrumbItems}
            onBreadcrumbNavigate={onBreadcrumbNavigate}
            emptyMessage={
              isUnassignedFolder
                ? 'All users are assigned to at least one group.'
                : 'No members in this folder. Add users from the list on the right (double-click, drag, or arrow).'
            }
            checkboxSelection={memberCheckboxSelection}
            selectedIds={[...selectedMemberIds]}
            onSelectedIdsChange={onMemberSelectionChange}
            onRowClick={(user) => onViewUser(user)}
          />
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
  onPoolSelectionChange,
  onUserDoubleClick,
  isUserDraggable,
  onUserDragStart,
  isFullscreen,
  onToggleFullscreen,
}: {
  activeGroup: GroupListItem | null
  isUnassignedFolder?: boolean
  availableUsers: UserListItem[]
  selectedUserIds: Set<string>
  onPoolSelectionChange: (ids: string[]) => void
  onUserDoubleClick: (userId: string) => void
  isUserDraggable?: (user: UserListItem) => boolean
  onUserDragStart?: (user: UserListItem, e: DragEvent) => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
}) {
  const [panelSearch, setPanelSearch] = useState('')

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
              ? `Add users to ${activeGroup.name} — double-click, drag, or use arrows`
              : activeGroup
                ? 'Only static groups support manual member assignment'
                : 'Select a group to assign users'
        }
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
      />

      {!activeGroup && !isUnassignedFolder ? (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          Select a group on the left to assign users.
        </Typography>
      ) : isUnassignedFolder ? (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          Pick a static group from the tree, then add users from the list here.
        </Typography>
      ) : activeGroup?.type !== 'static' ? (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          Dynamic groups use membership rules. Edit the group to change rules.
        </Typography>
      ) : (
        <UserGroupAssignUsersExplorer
          storageKey="explorer-list-table:user-group-all-users"
          users={availableUsers}
          searchQuery={panelSearch}
          onSearchChange={setPanelSearch}
          emptyMessage="All users are already in this folder."
          selectedIds={[...selectedUserIds]}
          onSelectedIdsChange={onPoolSelectionChange}
          rowClickToggleSelect
          onRowDoubleClick={(user) => onUserDoubleClick(user.id)}
          isRowDraggable={isUserDraggable}
          onRowDragStart={onUserDragStart}
        />
      )}
    </Paper>
  )
}
