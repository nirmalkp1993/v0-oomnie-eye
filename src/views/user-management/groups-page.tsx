'use client'

import { useCallback, useEffect, useState } from 'react'
import { Box } from '@mui/material'
import { useUserGroupStore } from '@/lib/user-group-store'
import { AddGroupModal } from '@/src/components/user-management/groups/add-group-modal'
import { UserGroupHierarchyView } from '@/src/components/user-management/groups/user-group-hierarchy-view'
import { ConfirmDialog } from '@/src/components/modals/confirm-dialog'
import { UserManagementPageShell } from '@/src/components/user-management/user-management-page-shell'
import { useAdminSnackbar } from '@/src/hooks/use-admin-snackbar'
import { MOCK_USERS } from '@/src/mock-data/users'
import type { GroupListItem } from '@/src/types/user-management'

const directoryUsers = MOCK_USERS.map((user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
}))

export function GroupsPage() {
  const { showMessage } = useAdminSnackbar()
  const upsertGroup = useUserGroupStore((state) => state.upsertGroup)
  const removeGroup = useUserGroupStore((state) => state.removeGroup)
  const groups = useUserGroupStore((state) => state.groups)

  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editGroup, setEditGroup] = useState<GroupListItem | null>(null)
  const [parentGroupId, setParentGroupId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<GroupListItem | null>(null)

  useEffect(() => {
    setLoading(true)
    const timer = window.setTimeout(() => setLoading(false), 400)
    return () => window.clearTimeout(timer)
  }, [])

  const parentGroupName = parentGroupId
    ? groups.find((group) => group.id === parentGroupId)?.name ?? null
    : null

  const handleModalClose = () => {
    setModalOpen(false)
    setEditGroup(null)
    setParentGroupId(null)
  }

  const handleOpenCreateRoot = useCallback(() => {
    setEditGroup(null)
    setParentGroupId(null)
    setModalOpen(true)
  }, [])

  const handleCreateSubgroup = useCallback((parentId: string) => {
    setEditGroup(null)
    setParentGroupId(parentId)
    setModalOpen(true)
  }, [])

  const handleEditGroup = useCallback((group: GroupListItem) => {
    setEditGroup(group)
    setParentGroupId(null)
    setModalOpen(true)
  }, [])

  const handleGroupCreated = useCallback(
    (group: GroupListItem) => {
      upsertGroup(group)
    },
    [upsertGroup],
  )

  const handleGroupUpdated = useCallback(
    (group: GroupListItem) => {
      upsertGroup(group)
      setEditGroup(group)
    },
    [upsertGroup],
  )

  const requestDeleteGroup = useCallback((group: GroupListItem) => {
    setModalOpen(false)
    setConfirmDelete(group)
  }, [])

  const confirmDeleteGroup = useCallback(() => {
    if (!confirmDelete) return
    removeGroup(confirmDelete.id)
    showMessage('Group deleted', 'info')
    setConfirmDelete(null)
    setEditGroup(null)
  }, [confirmDelete, removeGroup, showMessage])

  return (
    <>
      <UserManagementPageShell title="Groups" description="">
        <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', opacity: loading ? 0.6 : 1 }}>
          <UserGroupHierarchyView
            onOpenCreateRoot={handleOpenCreateRoot}
            onCreateSubgroup={handleCreateSubgroup}
            onEditGroup={handleEditGroup}
            onDeleteGroup={requestDeleteGroup}
          />
        </Box>
      </UserManagementPageShell>

      <AddGroupModal
        open={modalOpen}
        editGroup={editGroup}
        parentGroupId={parentGroupId}
        parentGroupName={parentGroupName}
        onClose={handleModalClose}
        onCreated={handleGroupCreated}
        onUpdated={handleGroupUpdated}
        directoryUsers={directoryUsers}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete group?"
        description={`Remove ${confirmDelete?.name ?? ''} and all nested subgroups?`}
        destructive
        confirmLabel="Delete"
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteGroup}
      />
    </>
  )
}
