'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import { Box, IconButton, Tooltip } from '@mui/material'
import { useUserDirectoryStore } from '@/lib/user-directory-store'
import { useUserGroupStore } from '@/lib/user-group-store'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import type { GroupListItem, UserListItem } from '@/src/types/user-management'
import {
  UNASSIGNED_USERS_FOLDER_ID,
  UNASSIGNED_USERS_FOLDER_NAME,
  isUnassignedUsersFolder,
} from '@/src/constants/user-groups'
import { getUnassignedUsers } from '@/src/lib/user-management/group-members.utils'
import {
  UserGroupAvailableUsersPanel,
  UserGroupMembersPanel,
  type UserGroupFolderBreadcrumb,
} from './user-group-members-panel'
import { UserGroupTreePanel } from './user-group-tree-panel'

export type UserGroupPanelId = 'groups' | 'in-folder' | 'all'

function userInGroup(group: GroupListItem, userId: string): boolean {
  return (group.memberUserIds ?? []).includes(userId)
}

function TransferArrowControls({
  activeGroupId,
  selectedPoolIds,
  selectedMemberIds,
  onAddSelected,
  onRemoveSelected,
  disabled,
}: {
  activeGroupId: string | null
  selectedPoolIds: Set<string>
  selectedMemberIds: Set<string>
  onAddSelected: () => void
  onRemoveSelected: () => void
  disabled: boolean
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 2,
        p: 0.5,
        border: 1,
        borderColor: 'divider',
        pointerEvents: 'auto',
      }}
    >
      <Tooltip title="Add selected users to folder" placement="left">
        <span>
          <IconButton
            size="small"
            color="primary"
            disabled={disabled || !activeGroupId || selectedPoolIds.size === 0}
            onClick={onAddSelected}
          >
            <KeyboardArrowLeftIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Remove selected from folder" placement="left">
        <span>
          <IconButton
            size="small"
            disabled={disabled || !activeGroupId || selectedMemberIds.size === 0}
            onClick={onRemoveSelected}
          >
            <KeyboardArrowRightIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  )
}

export function UserGroupHierarchyView({
  onOpenCreateRoot,
  onCreateSubgroup,
  onEditGroup,
  onDeleteGroup,
  onViewUser,
}: {
  onOpenCreateRoot: () => void
  onCreateSubgroup: (parentId: string) => void
  onEditGroup: (group: GroupListItem) => void
  onDeleteGroup: (group: GroupListItem) => void
  onViewUser: (user: UserListItem) => void
}) {
  const groups = useUserGroupStore((state) => state.groups)
  const selectedGroupId = useUserGroupStore((state) => state.selectedGroupId)
  const setSelectedGroupId = useUserGroupStore((state) => state.setSelectedGroupId)
  const addUsersToGroup = useUserGroupStore((state) => state.addUsersToGroup)
  const removeUsersFromGroup = useUserGroupStore((state) => state.removeUsersFromGroup)
  const directoryUsers = useUserDirectoryStore((state) => state.users)

  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set())
  const [selectedPoolIds, setSelectedPoolIds] = useState<Set<string>>(new Set())
  const [inFolderStack, setInFolderStack] = useState<string[]>([])
  const [fullscreenPanel, setFullscreenPanel] = useState<UserGroupPanelId | null>(null)
  const [panelLayout, setPanelLayout] = useState<number[]>([28, 36, 36])

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId) ?? null,
    [groups, selectedGroupId],
  )

  useEffect(() => {
    if (
      selectedGroupId &&
      (groups.some((group) => group.id === selectedGroupId) ||
        isUnassignedUsersFolder(selectedGroupId))
    ) {
      return
    }
    const roots = groups.filter((group) => (group.parentGroupIds ?? []).length === 0)
    setSelectedGroupId(roots[0]?.id ?? null)
  }, [groups, selectedGroupId, setSelectedGroupId])

  const isUnassignedFolder = isUnassignedUsersFolder(selectedGroupId)

  useEffect(() => {
    if (!isUnassignedFolder) return
    setInFolderStack([])
  }, [isUnassignedFolder])

  useEffect(() => {
    setInFolderStack([])
  }, [selectedGroupId])

  const activeFolderId = useMemo(() => {
    if (isUnassignedFolder) return null
    if (!selectedGroupId) return null
    if (inFolderStack.length === 0) return selectedGroupId
    return inFolderStack[inFolderStack.length - 1] ?? selectedGroupId
  }, [isUnassignedFolder, selectedGroupId, inFolderStack])

  const activeGroup = useMemo(
    () => groups.find((group) => group.id === activeFolderId) ?? null,
    [groups, activeFolderId],
  )

  const unassignedUsers = useMemo(
    () => getUnassignedUsers(groups, directoryUsers),
    [groups, directoryUsers],
  )

  const breadcrumbItems = useMemo((): UserGroupFolderBreadcrumb[] => {
    if (isUnassignedFolder) {
      return [{ id: UNASSIGNED_USERS_FOLDER_ID, name: UNASSIGNED_USERS_FOLDER_NAME }]
    }
    if (!selectedGroupId || !selectedGroup) return []
    const items: UserGroupFolderBreadcrumb[] = [
      { id: selectedGroupId, name: selectedGroup.name },
    ]
    for (const groupId of inFolderStack) {
      const group = groups.find((item) => item.id === groupId)
      items.push({ id: groupId, name: group?.name ?? groupId })
    }
    return items
  }, [isUnassignedFolder, selectedGroupId, selectedGroup, inFolderStack, groups])

  useEffect(() => {
    setSelectedMemberIds(new Set())
    setSelectedPoolIds(new Set())
  }, [activeFolderId])

  const availableUsers = useMemo(() => {
    if (!activeGroup || activeGroup.type !== 'static') return []
    return directoryUsers.filter((user) => !userInGroup(activeGroup, user.id))
  }, [activeGroup, directoryUsers])

  const assignmentDisabled = isUnassignedFolder || !activeGroup || activeGroup.type !== 'static'

  const addToGroup = useCallback(
    (userIds: string[]) => {
      if (!activeFolderId || assignmentDisabled || userIds.length === 0) return
      addUsersToGroup(activeFolderId, userIds)
      setSelectedPoolIds(new Set())
    },
    [activeFolderId, assignmentDisabled, addUsersToGroup],
  )

  const removeFromGroup = useCallback(
    (userIds: string[]) => {
      if (!activeFolderId || assignmentDisabled || userIds.length === 0) return
      removeUsersFromGroup(activeFolderId, userIds)
      setSelectedMemberIds((prev) => {
        const next = new Set(prev)
        userIds.forEach((id) => next.delete(id))
        return next
      })
    },
    [activeFolderId, assignmentDisabled, removeUsersFromGroup],
  )

  const toggleMemberSelect = (userId: string) => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
    setSelectedPoolIds(new Set())
  }

  const togglePoolSelect = (userId: string) => {
    setSelectedPoolIds((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
    setSelectedMemberIds(new Set())
  }

  const groupsPanel = (
    <UserGroupTreePanel
      isFullscreen={fullscreenPanel === 'groups'}
      onToggleFullscreen={() =>
        setFullscreenPanel((prev) => (prev === 'groups' ? null : 'groups'))
      }
      onOpenCreateRoot={onOpenCreateRoot}
      onCreateSubgroup={onCreateSubgroup}
      onEditGroup={onEditGroup}
      onDeleteGroup={onDeleteGroup}
    />
  )

  const inFolderPanel = (
    <UserGroupMembersPanel
      activeGroup={activeGroup}
      isUnassignedFolder={isUnassignedFolder}
      unassignedUsers={unassignedUsers}
      breadcrumbItems={breadcrumbItems}
      onBreadcrumbNavigate={(index) => {
        if (index <= 0) setInFolderStack([])
        else setInFolderStack((prev) => prev.slice(0, index))
      }}
      onOpenSubfolder={(groupId) => setInFolderStack((prev) => [...prev, groupId])}
      selectedMemberIds={selectedMemberIds}
      onToggleMemberSelect={toggleMemberSelect}
      onViewUser={onViewUser}
      isFullscreen={fullscreenPanel === 'in-folder'}
      onToggleFullscreen={() =>
        setFullscreenPanel((prev) => (prev === 'in-folder' ? null : 'in-folder'))
      }
    />
  )

  const allUsersPanel = (
    <UserGroupAvailableUsersPanel
      activeGroup={activeGroup}
      isUnassignedFolder={isUnassignedFolder}
      availableUsers={availableUsers}
      selectedUserIds={selectedPoolIds}
      onToggleUserSelect={togglePoolSelect}
      onUserDoubleClick={(userId) => addToGroup([userId])}
      isFullscreen={fullscreenPanel === 'all'}
      onToggleFullscreen={() =>
        setFullscreenPanel((prev) => (prev === 'all' ? null : 'all'))
      }
    />
  )

  const panelShellSx = {
    height: '100%',
    minHeight: 0,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  }

  if (fullscreenPanel) {
    const content =
      fullscreenPanel === 'groups'
        ? groupsPanel
        : fullscreenPanel === 'in-folder'
          ? inFolderPanel
          : allUsersPanel

    return (
      <Box sx={{ position: 'relative', flex: 1, minHeight: 0, minWidth: 0, display: 'flex' }}>
        <Box sx={{ ...panelShellSx, flex: 1 }}>{content}</Box>
      </Box>
    )
  }

  const transferArrowLeft = panelLayout.length >= 2 ? panelLayout[0]! + panelLayout[1]! : 64

  return (
    <Box sx={{ position: 'relative', flex: 1, minHeight: 0, minWidth: 0, display: 'flex' }}>
      <ResizablePanelGroup
        direction="horizontal"
        autoSaveId="user-group-hierarchy-layout"
        className="flex-1 min-h-0 min-w-0"
        onLayout={(sizes) => {
          if (sizes.length >= 3) setPanelLayout(sizes)
        }}
      >
        <ResizablePanel id="groups" defaultSize={28} minSize={16}>
          <Box sx={panelShellSx}>{groupsPanel}</Box>
        </ResizablePanel>

        <ResizableHandle withHandle className="!w-1.5" />

        <ResizablePanel id="in-folder" defaultSize={36} minSize={16}>
          <Box sx={panelShellSx}>{inFolderPanel}</Box>
        </ResizablePanel>

        <ResizableHandle withHandle className="!w-1.5" />

        <ResizablePanel id="all-users" defaultSize={36} minSize={16}>
          <Box sx={panelShellSx}>{allUsersPanel}</Box>
        </ResizablePanel>
      </ResizablePanelGroup>

      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: `${transferArrowLeft}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
          pointerEvents: 'none',
        }}
      >
        <TransferArrowControls
          activeGroupId={activeFolderId}
          selectedPoolIds={selectedPoolIds}
          selectedMemberIds={selectedMemberIds}
          onAddSelected={() => addToGroup([...selectedPoolIds])}
          onRemoveSelected={() => removeFromGroup([...selectedMemberIds])}
          disabled={assignmentDisabled}
        />
      </Box>
    </Box>
  )
}
