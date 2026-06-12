'use client'

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'
import SecurityUpdateGoodOutlinedIcon from '@mui/icons-material/SecurityUpdateGoodOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { Box, Button, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react'
import { ExplorerListTableProvider } from '@/components/tables/explorer-list-table-context'
import { USER_LIST_COLUMNS } from '@/lib/explorer-list-table/user-management-columns'
import { UserManagementExplorerTable } from '@/src/components/user-management/user-management-explorer-table'
import { UserManagementTableToolbar } from '@/src/components/user-management/user-management-table-toolbar'
import { UserFormModal } from '@/src/components/modals/user-form-modal'
import { ConfirmDialog } from '@/src/components/modals/confirm-dialog'
import { UserDetailModal } from '@/src/components/user-management/user-detail-modal'
import { UserManagementPageShell } from '@/src/components/user-management/user-management-page-shell'
import { UserStatusBadge } from '@/src/components/user-management/user-status-badge'
import {
  UmFilterSelect,
  UmPrimaryText,
  UmSecondaryText,
  myDrawingsPrimaryButtonSx,
  myDrawingsToolbarIconButtonSx,
  myDrawingsToolbarOutlineButtonSx,
} from '@/src/components/user-management/user-management-table-primitives'
import { myDrawingsBodySecondaryTypographySx } from '@/src/components/tables/my-drawings-table-styles'
import { useAdminSnackbar } from '@/src/hooks/use-admin-snackbar'
import { getUserRowCellValue } from '@/src/lib/user-management/user-row-values'
import { useUserDirectoryStore } from '@/lib/user-directory-store'
import { MOCK_USERS } from '@/src/mock-data/users'
import type { UserListItem, UserStatus } from '@/src/types/user-management'

const STATUS_FILTER_OPTIONS: { value: 'all' | UserStatus; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'archived', label: 'Archived' },
]

export function UsersPage() {
  const { showMessage } = useAdminSnackbar()
  const [rows, setRows] = useState<UserListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [menuUser, setMenuUser] = useState<UserListItem | null>(null)
  const [detailUser, setDetailUser] = useState<UserListItem | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [userModal, setUserModal] = useState<{
    open: boolean
    mode: 'create' | 'edit'
    user?: UserListItem | null
  }>({
    open: false,
    mode: 'create',
  })
  const [confirmBulk, setConfirmBulk] = useState(false)
  const [confirmSingle, setConfirmSingle] = useState<UserListItem | null>(null)
  const setDirectoryUsers = useUserDirectoryStore((state) => state.setUsers)

  useEffect(() => {
    setLoading(true)
    const t = window.setTimeout(() => {
      setRows(MOCK_USERS.map((r) => ({ ...r })))
      setLoading(false)
    }, 600)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    setDirectoryUsers(rows)
  }, [rows, setDirectoryUsers])

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (!q) return true
      const hay = [
        r.name,
        r.email,
        r.phone,
        r.jobTitle,
        r.department,
        r.office,
        r.roles.join(' '),
        r.groups.join(' '),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [rows, search, statusFilter])

  const selectedCount = selectedIds.length

  const closeMenu = () => {
    setMenuAnchor(null)
    setMenuUser(null)
  }

  const openDetail = useCallback((user: UserListItem) => {
    setDetailUser(user)
    setDetailOpen(true)
    closeMenu()
  }, [])

  const openEdit = useCallback((user: UserListItem) => {
    setDetailOpen(false)
    setUserModal({ open: true, mode: 'edit', user })
    closeMenu()
  }, [])

  const handleRowClick = useCallback(
    (user: UserListItem, event: MouseEvent<HTMLTableRowElement>) => {
      const target = event.target as HTMLElement
      if (
        target.closest('[data-um-actions]') ||
        target.closest('button') ||
        target.closest('[role="checkbox"]')
      ) {
        return
      }
      openDetail(user)
    },
    [openDetail]
  )

  const handleUserChange = useCallback((updated: UserListItem) => {
    setRows((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    setDetailUser((prev) => (prev?.id === updated.id ? updated : prev))
  }, [])

  const handleSaveUser = useCallback(
    (user: UserListItem) => {
      const existingId = userModal.user?.id
      if (existingId) {
        setRows((prev) => prev.map((r) => (r.id === existingId ? { ...user, id: existingId } : r)))
        setDetailUser((prev) => (prev?.id === existingId ? { ...user, id: existingId } : prev))
        showMessage('User updated')
      } else {
        setRows((prev) => [user, ...prev])
        showMessage('User created')
      }
      setUserModal({ open: false, mode: 'create', user: null })
    },
    [userModal.user?.id, showMessage]
  )

  const bulkDelete = () => {
    const idSet = new Set(selectedIds)
    setRows((prev) => prev.filter((r) => !idSet.has(r.id)))
    setSelectedIds([])
    setConfirmBulk(false)
    showMessage(`${idSet.size} user(s) removed`, 'info')
  }

  const requestDeleteUser = useCallback((user: UserListItem) => {
    setUserModal({ open: false, mode: 'create', user: null })
    setDetailOpen(false)
    setConfirmSingle(user)
  }, [])

  const confirmDeleteUser = useCallback(() => {
    if (!confirmSingle) return
    setRows((prev) => prev.filter((r) => r.id !== confirmSingle.id))
    setSelectedIds((prev) => prev.filter((id) => id !== confirmSingle.id))
    if (detailUser?.id === confirmSingle.id) {
      setDetailOpen(false)
      setDetailUser(null)
    }
    showMessage('User deleted', 'info')
    setConfirmSingle(null)
  }, [confirmSingle, detailUser?.id, showMessage])

  const renderCell = useCallback((row: UserListItem, columnId: string) => {
    switch (columnId) {
      case 'name':
        return <UmPrimaryText>{row.name}</UmPrimaryText>
      case 'email':
        return <UmSecondaryText>{row.email}</UmSecondaryText>
      case 'roles':
        return <UmSecondaryText>{row.roles.join(', ') || '—'}</UmSecondaryText>
      case 'groups':
        return <UmSecondaryText>{row.groups.join(', ') || '—'}</UmSecondaryText>
      case 'department':
        return <UmSecondaryText>{row.department}</UmSecondaryText>
      case 'office':
        return <UmSecondaryText>{row.office}</UmSecondaryText>
      case 'lastLogin':
        return <UmSecondaryText>{row.lastLogin ?? '—'}</UmSecondaryText>
      case 'status':
        return <UserStatusBadge status={row.status} />
      case 'actions':
        return (
          <IconButton
            size="small"
            aria-label="Row actions"
            data-um-actions
            sx={myDrawingsToolbarIconButtonSx}
            onClick={(e) => {
              e.stopPropagation()
              setMenuUser(row)
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
    <UserManagementPageShell title="Users" description="">
      <ExplorerListTableProvider storageKey="explorer-list-table:users" columns={USER_LIST_COLUMNS}>
        <UserManagementTableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search users…"
          resultCount={filteredRows.length}
          resultLabel="user"
          filtersSlot={
            <UmFilterSelect
              label="Status"
              labelId="users-status-filter-label"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as 'all' | UserStatus)}
            >
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </UmFilterSelect>
          }
          trailingActions={
            <Button
              variant="contained"
              disableElevation
              size="small"
              startIcon={<PersonAddOutlinedIcon />}
              onClick={() => setUserModal({ open: true, mode: 'create', user: null })}
              sx={myDrawingsPrimaryButtonSx}
            >
              Add User
            </Button>
          }
        />

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 0.5 }}>
            {selectedCount > 0 ? (
              <Button
                variant="outlined"
                size="small"
                startIcon={<DeleteOutlineIcon fontSize="small" />}
                onClick={() => setConfirmBulk(true)}
                sx={{ ...myDrawingsToolbarOutlineButtonSx, color: 'error.main', borderColor: 'error.light' }}
              >
                Delete selected ({selectedCount})
              </Button>
            ) : (
              <Typography variant="body2" sx={myDrawingsBodySecondaryTypographySx}>
                Select rows for bulk delete
              </Typography>
            )}
          </Box>

          <UserManagementExplorerTable
          rows={filteredRows}
          loading={loading}
          getRowId={(r) => r.id}
          getCellValue={getUserRowCellValue}
          renderCell={renderCell}
          onRowClick={handleRowClick}
          primaryColumnId="name"
          checkboxSelection
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
          minHeight={520}
          emptyMessage={
            search.trim() || statusFilter !== 'all'
              ? 'No users match your search or filters.'
              : 'No users yet. Add a user to populate this directory.'
          }
        />
        </Box>
      </ExplorerListTableProvider>
    </UserManagementPageShell>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={() => menuUser && openDetail(menuUser)}>
          <VisibilityOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> View details
        </MenuItem>
        <MenuItem onClick={() => menuUser && openEdit(menuUser)}>
          <EditOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Edit profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuUser) requestDeleteUser(menuUser)
            closeMenu()
          }}
        >
          <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuUser) openDetail(menuUser)
          }}
        >
          <GroupAddOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Assign groups
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuUser) openDetail(menuUser)
          }}
        >
          <SecurityUpdateGoodOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Assign role
        </MenuItem>
      </Menu>

      <UserDetailModal
        user={detailUser}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false)
          setDetailUser(null)
        }}
        onUserChange={handleUserChange}
        onEditProfile={(u) => openEdit(u)}
      />

      <UserFormModal
        open={userModal.open}
        mode={userModal.mode}
        initial={userModal.user ?? undefined}
        onClose={() => setUserModal({ open: false, mode: 'create', user: null })}
        onSubmit={handleSaveUser}
        onDeleteRequest={
          userModal.mode === 'edit' && userModal.user
            ? () => requestDeleteUser(userModal.user as UserListItem)
            : undefined
        }
      />

      <ConfirmDialog
        open={confirmBulk}
        title="Delete selected users?"
        description="This action removes all selected users from the directory."
        confirmLabel="Delete"
        destructive
        onClose={() => setConfirmBulk(false)}
        onConfirm={bulkDelete}
      />

      <ConfirmDialog
        open={Boolean(confirmSingle)}
        title="Delete user?"
        description={`Remove ${confirmSingle?.name ?? ''} from the directory?`}
        confirmLabel="Delete"
        destructive
        onClose={() => setConfirmSingle(null)}
        onConfirm={confirmDeleteUser}
      />
  </>
  )
}
