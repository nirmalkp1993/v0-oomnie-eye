'use client'

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { Box, Button, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined'
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react'
import { ExplorerListTableProvider } from '@/components/tables/explorer-list-table-context'
import { GROUP_LIST_COLUMNS } from '@/lib/explorer-list-table/user-management-columns'
import { AddGroupModal } from '@/src/components/user-management/groups/add-group-modal'
import { ConfirmDialog } from '@/src/components/modals/confirm-dialog'
import { UserManagementExplorerTable } from '@/src/components/user-management/user-management-explorer-table'
import { UserManagementPageShell } from '@/src/components/user-management/user-management-page-shell'
import { UserManagementTableToolbar } from '@/src/components/user-management/user-management-table-toolbar'
import {
  UmPrimaryText,
  UmSecondaryText,
  myDrawingsPrimaryButtonSx,
  myDrawingsToolbarIconButtonSx,
  umStatusTextSx,
} from '@/src/components/user-management/user-management-table-primitives'
import { useAdminSnackbar } from '@/src/hooks/use-admin-snackbar'
import { getGroupRowCellValue } from '@/src/lib/user-management/group-row-values'
import { MOCK_GROUPS } from '@/src/mock-data/groups'
import { MOCK_USERS } from '@/src/mock-data/users'
import type { GroupListItem } from '@/src/types/user-management'

const directoryUsers = MOCK_USERS.map((u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
}))

export function GroupsPage() {
  const { showMessage } = useAdminSnackbar()
  const [rows, setRows] = useState<GroupListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [menuRow, setMenuRow] = useState<GroupListItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editGroup, setEditGroup] = useState<GroupListItem | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<GroupListItem | null>(null)

  useEffect(() => {
    setLoading(true)
    const t = window.setTimeout(() => {
      setRows(MOCK_GROUPS.map((g) => ({ ...g })))
      setLoading(false)
    }, 600)
    return () => window.clearTimeout(t)
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.scope.toLowerCase().includes(q)
    )
  }, [rows, search])

  const closeMenu = () => {
    setMenuAnchor(null)
    setMenuRow(null)
  }

  const handleOpenCreate = () => {
    setEditGroup(null)
    setModalOpen(true)
  }

  const handleGroupSelect = useCallback((group: GroupListItem) => {
    setEditGroup(group)
    setModalOpen(true)
  }, [])

  const handleModalClose = () => {
    setModalOpen(false)
  }

  const handleGroupCreated = useCallback((group: GroupListItem) => {
    setRows((prev) => [group, ...prev])
  }, [])

  const handleGroupUpdated = useCallback((group: GroupListItem) => {
    setRows((prev) => prev.map((r) => (r.id === group.id ? group : r)))
    setEditGroup(group)
  }, [])

  const handleRowClick = useCallback(
    (row: GroupListItem, event: MouseEvent<HTMLTableRowElement>) => {
      const target = event.target as HTMLElement
      if (target.closest('[data-um-actions]') || target.closest('button')) {
        return
      }
      handleGroupSelect(row)
    },
    [handleGroupSelect]
  )

  const requestDeleteGroup = useCallback((row: GroupListItem) => {
    setModalOpen(false)
    setConfirmDelete(row)
  }, [])

  const confirmDeleteGroup = useCallback(() => {
    if (!confirmDelete) return
    setRows((prev) => prev.filter((r) => r.id !== confirmDelete.id))
    showMessage('Group deleted', 'info')
    setConfirmDelete(null)
    setEditGroup(null)
  }, [confirmDelete, showMessage])

  const renderCell = useCallback((row: GroupListItem, columnId: string) => {
    switch (columnId) {
      case 'name':
        return <UmPrimaryText>{row.name}</UmPrimaryText>
      case 'description':
        return <UmSecondaryText>{row.description}</UmSecondaryText>
      case 'type':
        return (
          <Typography variant="body2" sx={umStatusTextSx('muted')}>
            {row.type === 'static' ? 'Static' : 'Dynamic'}
          </Typography>
        )
      case 'memberCount':
        return <UmSecondaryText>{row.memberCount}</UmSecondaryText>
      case 'inheritedRoles':
        return <UmSecondaryText>{row.inheritedRoles.join(', ') || '—'}</UmSecondaryText>
      case 'scope':
        return <UmSecondaryText>{row.scope}</UmSecondaryText>
      case 'status':
        return (
          <Typography variant="body2" sx={umStatusTextSx(row.status === 'active' ? 'active' : 'muted')}>
            {row.status}
          </Typography>
        )
      case 'lastUpdated':
        return <UmSecondaryText>{row.lastUpdated}</UmSecondaryText>
      case 'actions':
        return (
          <IconButton
            size="small"
            aria-label="Row actions"
            data-um-actions
            sx={myDrawingsToolbarIconButtonSx}
            onClick={(e) => {
              e.stopPropagation()
              setMenuRow(row)
              setMenuAnchor(e.currentTarget)
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        )
      default:
        return null
    }
  }, [])

  return (
    <>
      <UserManagementPageShell title="Groups" description="">
        <ExplorerListTableProvider storageKey="explorer-list-table:groups" columns={GROUP_LIST_COLUMNS}>
          <UserManagementTableToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search groups…"
            resultCount={filtered.length}
            resultLabel="group"
            trailingActions={
              <Button
                variant="contained"
                disableElevation
                size="small"
                startIcon={<CreateNewFolderOutlinedIcon />}
                onClick={handleOpenCreate}
                sx={myDrawingsPrimaryButtonSx}
              >
                New group
              </Button>
            }
          />

          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <UserManagementExplorerTable
              rows={filtered}
              loading={loading}
              getRowId={(r) => r.id}
              getCellValue={getGroupRowCellValue}
              renderCell={renderCell}
              onRowClick={handleRowClick}
              primaryColumnId="name"
              minHeight={480}
              emptyMessage={
                search.trim()
                  ? 'No groups match your search or filters.'
                  : 'No groups yet. Add a group to get started.'
              }
            />
          </Box>
        </ExplorerListTableProvider>
      </UserManagementPageShell>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            if (menuRow) handleGroupSelect(menuRow)
            closeMenu()
          }}
        >
          <EditOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuRow) requestDeleteGroup(menuRow)
            closeMenu()
          }}
        >
          <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      <AddGroupModal
        open={modalOpen}
        editGroup={editGroup}
        onClose={handleModalClose}
        onCreated={handleGroupCreated}
        onUpdated={handleGroupUpdated}
        directoryUsers={directoryUsers}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete group?"
        description={`Remove ${confirmDelete?.name ?? ''}?`}
        destructive
        confirmLabel="Delete"
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteGroup}
      />
    </>
  )
}
