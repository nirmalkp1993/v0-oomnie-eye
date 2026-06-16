'use client'

import { useMemo, useState, type DragEvent } from 'react'
import { Box, Paper, Typography } from '@mui/material'
import { useUserDirectoryStore } from '@/lib/user-directory-store'
import { CameraAssignPanelHeader } from '@/components/camera/camera-assign-panel-header'
import { getEnterpriseSettingsCardSx } from '@/src/components/enterprise'
import { UserGroupAssignUsersExplorer } from '@/src/components/user-management/groups/user-group-assign-users-explorer'
import type { UserGroupFolderBreadcrumb } from '@/src/components/user-management/groups/user-group-folder-breadcrumbs'
import { getGroupMembers } from '@/src/lib/user-management/group-members.utils'
import type { GroupListItem, UserListItem } from '@/src/types/user-management'

export type { UserGroupFolderBreadcrumb } from '@/src/components/user-management/groups/user-group-folder-breadcrumbs'

export function UserGroupMembersPanel({
  activeGroup,
  isUnassignedFolder = false,
  unassignedUsers = [],
  breadcrumbItems,
  onBreadcrumbNavigate,
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
  const directoryUsers = useUserDirectoryStore((state) => state.users)
  const [panelSearch, setPanelSearch] = useState('')

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
          Select a group on the left to view members.
        </Typography>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {isDynamic ? (
            <Typography variant="body2" color="text.secondary" sx={{ px: 2, pt: 2, pb: 1 }}>
              This is a dynamic group. Membership is managed by rules in the group settings.
            </Typography>
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
  canAssignUsers = false,
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
  canAssignUsers?: boolean
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

  const emptyMessage =
    canAssignUsers && availableUsers.length === 0
      ? 'All users are already in this folder.'
      : 'No users match your search or filters.'

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
              : activeGroup?.type === 'dynamic'
                ? 'Browse users — dynamic groups use membership rules for assignment'
                : 'Select a static group on the left to assign users'
        }
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
      />

      <UserGroupAssignUsersExplorer
        storageKey="explorer-list-table:user-group-all-users"
        users={availableUsers}
        searchQuery={panelSearch}
        onSearchChange={setPanelSearch}
        emptyMessage={emptyMessage}
        selectedIds={canAssignUsers ? [...selectedUserIds] : []}
        onSelectedIdsChange={canAssignUsers ? onPoolSelectionChange : undefined}
        rowClickToggleSelect={canAssignUsers}
        onRowDoubleClick={canAssignUsers ? (user) => onUserDoubleClick(user.id) : undefined}
        isRowDraggable={canAssignUsers ? isUserDraggable : undefined}
        onRowDragStart={canAssignUsers ? onUserDragStart : undefined}
      />
    </Paper>
  )
}
