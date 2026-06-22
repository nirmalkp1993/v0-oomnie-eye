'use client'

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined'
import SecurityUpdateGoodOutlinedIcon from '@mui/icons-material/SecurityUpdateGoodOutlined'
import SwitchAccountOutlinedIcon from '@mui/icons-material/SwitchAccountOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { Box, Button, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react'
import { ExplorerListTableProvider } from '@/components/tables/explorer-list-table-context'
import { USER_LIST_COLUMNS } from '@/lib/explorer-list-table/user-management-columns'
import { UserManagementExplorerTable } from '@/src/components/user-management/user-management-explorer-table'
import { UserManagementTableToolbar } from '@/src/components/user-management/user-management-table-toolbar'
import { UserFormModal, type UserFormTabId } from '@/src/components/modals/user-form-modal'
import { ConfirmDialog } from '@/src/components/modals/confirm-dialog'
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
import {
  RETIRED_USER_STATUS,
  canDeleteUser,
  isUserRetired,
} from '@/src/lib/user-management/user-lifecycle.utils'
import { formatHierarchyFieldDisplay } from '@/src/lib/hierarchy-path.utils'
import { getUserRowCellValue } from '@/src/lib/user-management/user-row-values'
import { openUserImpersonationTab } from '@/src/lib/user-management/user-impersonation.utils'
import {
  logUserRemoved,
  logUserRetired,
  logUserUpdated,
} from '@/src/lib/user-management/user-audit-log.utils'
import { useUserDirectoryStore } from '@/lib/user-directory-store'
import { useUserAuditStore } from '@/lib/user-audit-store'
import { MOCK_USERS } from '@/src/mock-data/users'
import type { UserListItem, UserStatus } from '@/src/types/user-management'

const STATUS_FILTER_OPTIONS: { value: 'all' | UserStatus; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'archived', label: 'Archived' },
  { value: 'retired', label: 'Retired' },
]

export function UsersPage() {
  const { showMessage } = useAdminSnackbar()
  const [rows, setRows] = useState<UserListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null)
  const [menuUser, setMenuUser] = useState<UserListItem | null>(null)
  const [userModal, setUserModal] = useState<{
    open: boolean
    mode: 'create' | 'edit' | 'view'
    user?: UserListItem | null
    initialTab?: UserFormTabId
  }>({
    open: false,
    mode: 'create',
  })
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)
  const [confirmBulkRetire, setConfirmBulkRetire] = useState(false)
  const [confirmSingleDelete, setConfirmSingleDelete] = useState<UserListItem | null>(null)
  const [confirmSingleRetire, setConfirmSingleRetire] = useState<UserListItem | null>(null)
  const setDirectoryUsers = useUserDirectoryStore((state) => state.setUsers)
  const hydrateAuditFromUsers = useUserAuditStore((state) => state.hydrateFromUsers)
  const ensureUserAuditLogs = useUserAuditStore((state) => state.ensureUserLogs)

  useEffect(() => {
    if (!loading && rows.length > 0) {
      hydrateAuditFromUsers(rows)
    }
  }, [hydrateAuditFromUsers, loading, rows])

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
        ...(r.jobTitle ?? []),
        ...r.department,
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

  const selectedUsers = useMemo(
    () => rows.filter((row) => selectedIds.includes(row.id)),
    [rows, selectedIds],
  )

  const selectedRetirableCount = useMemo(
    () => selectedUsers.filter((user) => !isUserRetired(user)).length,
    [selectedUsers],
  )

  const allSelectedRetired =
    selectedUsers.length > 0 && selectedUsers.every((user) => isUserRetired(user))

  const closeMenu = () => {
    setMenuAnchor(null)
    setMenuPosition(null)
    setMenuUser(null)
  }

  const openRowMenu = useCallback(
    (
      user: UserListItem,
      options: { anchorEl?: HTMLElement | null; position?: { top: number; left: number } },
    ) => {
      setMenuUser(user)
      setMenuAnchor(options.anchorEl ?? null)
      setMenuPosition(options.position ?? null)
    },
    [],
  )

  const openDetail = useCallback((user: UserListItem) => {
    setUserModal({ open: true, mode: 'view', user })
    closeMenu()
  }, [])

  const openEdit = useCallback((user: UserListItem, initialTab: UserFormTabId = 'profile') => {
    setUserModal({ open: true, mode: 'edit', user, initialTab })
    closeMenu()
  }, [])

  const openAssignRole = useCallback((user: UserListItem) => {
    openEdit(user, 'roles')
  }, [openEdit])

  const openAssignGroups = useCallback((user: UserListItem) => {
    openEdit(user, 'groups')
  }, [openEdit])

  const handleImpersonate = useCallback(
    (user: UserListItem) => {
      if (isUserRetired(user)) {
        showMessage('Cannot impersonate a retired user', 'warning')
        closeMenu()
        return
      }
      openUserImpersonationTab(user)
      closeMenu()
    },
    [showMessage],
  )

  const isRowActionTarget = (target: HTMLElement) =>
    Boolean(
      target.closest('[data-um-actions]') ||
        target.closest('button') ||
        target.closest('[role="checkbox"]'),
    )

  const handleRowClick = useCallback(
    (user: UserListItem, event: MouseEvent<HTMLTableRowElement>) => {
      if (isRowActionTarget(event.target as HTMLElement)) return
      openDetail(user)
    },
    [openDetail],
  )

  const handleRowContextMenu = useCallback(
    (user: UserListItem, event: MouseEvent<HTMLTableRowElement>) => {
      if (isRowActionTarget(event.target as HTMLElement)) return
      event.preventDefault()
      openRowMenu(user, { position: { top: event.clientY, left: event.clientX } })
    },
    [openRowMenu],
  )

  const handleSaveUser = useCallback(
    (user: UserListItem) => {
      const existingId = userModal.user?.id
      if (existingId) {
        const saved = { ...user, id: existingId }
        setRows((prev) => prev.map((r) => (r.id === existingId ? saved : r)))
        logUserUpdated(existingId, saved.name)
        showMessage('User updated')
      } else {
        setRows((prev) => [user, ...prev])
        ensureUserAuditLogs(user)
        showMessage('User created')
      }
      setUserModal({ open: false, mode: 'create', user: null })
    },
    [ensureUserAuditLogs, userModal.user?.id, showMessage]
  )

  const retireUser = useCallback((userId: string, userName: string) => {
    logUserRetired(userId, userName)
    setRows((prev) =>
      prev.map((row) => (row.id === userId ? { ...row, status: RETIRED_USER_STATUS } : row)),
    )
    setUserModal((prev) =>
      prev.user?.id === userId
        ? { ...prev, user: { ...prev.user, status: RETIRED_USER_STATUS } }
        : prev,
    )
  }, [])

  const bulkRetire = () => {
    const usersToRetire = selectedUsers.filter((user) => !isUserRetired(user))
    const idSet = new Set(usersToRetire.map((user) => user.id))
    usersToRetire.forEach((user) => logUserRetired(user.id, user.name))
    setRows((prev) =>
      prev.map((row) => (idSet.has(row.id) ? { ...row, status: RETIRED_USER_STATUS } : row)),
    )
    setConfirmBulkRetire(false)
    showMessage(`${idSet.size} user(s) retired`, 'info')
  }

  const bulkDelete = () => {
    const usersToRemove = selectedUsers.filter((user) => isUserRetired(user))
    const idSet = new Set(usersToRemove.map((user) => user.id))
    usersToRemove.forEach((user) => logUserRemoved(user.id, user.name))
    setRows((prev) => prev.filter((r) => !idSet.has(r.id)))
    setSelectedIds((prev) => prev.filter((id) => !idSet.has(id)))
    setConfirmBulkDelete(false)
    showMessage(`${idSet.size} user(s) removed`, 'info')
  }

  const requestRetireUser = useCallback((user: UserListItem) => {
    if (isUserRetired(user)) return
    setUserModal({ open: false, mode: 'create', user: null })
    setConfirmSingleRetire(user)
  }, [])

  const requestDeleteUser = useCallback(
    (user: UserListItem) => {
      if (!canDeleteUser(user)) {
        showMessage('Retire the user before deleting.', 'warning')
        return
      }
      setUserModal({ open: false, mode: 'create', user: null })
      setConfirmSingleDelete(user)
    },
    [showMessage],
  )

  const confirmRetireUser = useCallback(() => {
    if (!confirmSingleRetire) return
    retireUser(confirmSingleRetire.id, confirmSingleRetire.name)
    showMessage(`${confirmSingleRetire.name} retired`, 'info')
    setConfirmSingleRetire(null)
  }, [confirmSingleRetire, retireUser, showMessage])

  const confirmDeleteUser = useCallback(() => {
    if (!confirmSingleDelete) return
    if (!canDeleteUser(confirmSingleDelete)) {
      showMessage('Retire the user before deleting.', 'warning')
      setConfirmSingleDelete(null)
      return
    }
    logUserRemoved(confirmSingleDelete.id, confirmSingleDelete.name)
    setRows((prev) => prev.filter((r) => r.id !== confirmSingleDelete.id))
    setSelectedIds((prev) => prev.filter((id) => id !== confirmSingleDelete.id))
    showMessage('User deleted', 'info')
    setConfirmSingleDelete(null)
  }, [confirmSingleDelete, showMessage])

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
        return <UmSecondaryText>{formatHierarchyFieldDisplay(row.department)}</UmSecondaryText>
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
              openRowMenu(row, { anchorEl: e.currentTarget })
            }}
            onContextMenu={(e) => {
              e.preventDefault()
              e.stopPropagation()
              openRowMenu(row, { anchorEl: e.currentTarget })
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        )
      default:
        return null
    }
  }, [openRowMenu])

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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 0.5, flexWrap: 'wrap' }}>
            {selectedCount > 0 ? (
              <>
                {selectedRetirableCount > 0 ? (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PersonOffOutlinedIcon fontSize="small" />}
                    onClick={() => setConfirmBulkRetire(true)}
                    sx={{
                      ...myDrawingsToolbarOutlineButtonSx,
                      color: 'warning.main',
                      borderColor: 'warning.light',
                    }}
                  >
                    Retire selected ({selectedRetirableCount})
                  </Button>
                ) : null}
                {allSelectedRetired ? (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DeleteOutlineIcon fontSize="small" />}
                    onClick={() => setConfirmBulkDelete(true)}
                    sx={{
                      ...myDrawingsToolbarOutlineButtonSx,
                      color: 'error.main',
                      borderColor: 'error.light',
                    }}
                  >
                    Delete selected ({selectedCount})
                  </Button>
                ) : null}
              </>
            ) : (
              <Typography variant="body2" sx={myDrawingsBodySecondaryTypographySx}>
                Select rows for bulk retire or delete
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
          onRowContextMenu={handleRowContextMenu}
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

      <Menu
        anchorEl={menuAnchor}
        anchorReference={menuPosition ? 'anchorPosition' : 'anchorEl'}
        anchorPosition={menuPosition ?? undefined}
        open={Boolean(menuUser && (menuAnchor || menuPosition))}
        onClose={closeMenu}
      >
        <MenuItem onClick={() => menuUser && openDetail(menuUser)}>
          <VisibilityOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> View details
        </MenuItem>
        <MenuItem onClick={() => menuUser && openEdit(menuUser)}>
          <EditOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Edit profile
        </MenuItem>
        {menuUser && isUserRetired(menuUser) ? (
          <MenuItem
            onClick={() => {
              requestDeleteUser(menuUser)
              closeMenu()
            }}
          >
            <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} /> Delete
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              if (menuUser) requestRetireUser(menuUser)
              closeMenu()
            }}
          >
            <PersonOffOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Retire
          </MenuItem>
        )}
        <MenuItem onClick={() => menuUser && openAssignGroups(menuUser)}>
          <GroupAddOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Assign groups
        </MenuItem>
        <MenuItem onClick={() => menuUser && openAssignRole(menuUser)}>
          <SecurityUpdateGoodOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Assign role
        </MenuItem>
        <MenuItem
          onClick={() => menuUser && handleImpersonate(menuUser)}
          disabled={Boolean(menuUser && isUserRetired(menuUser))}
        >
          <SwitchAccountOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Impersonation
        </MenuItem>
      </Menu>

      <UserFormModal
        open={userModal.open}
        mode={userModal.mode}
        initial={userModal.user ?? undefined}
        initialTab={userModal.initialTab}
        onClose={() => setUserModal({ open: false, mode: 'create', user: null })}
        onSubmit={handleSaveUser}
        onEditProfile={(u) => openEdit(u)}
        onRetireRequest={
          userModal.mode === 'edit' && userModal.user && !isUserRetired(userModal.user)
            ? () => requestRetireUser(userModal.user as UserListItem)
            : undefined
        }
        onDeleteRequest={
          userModal.mode === 'edit' && userModal.user && isUserRetired(userModal.user)
            ? () => requestDeleteUser(userModal.user as UserListItem)
            : undefined
        }
      />

      <ConfirmDialog
        open={confirmBulkRetire}
        title="Retire selected users?"
        description="Retired users lose access but remain in the directory until deleted."
        confirmLabel="Retire"
        onClose={() => setConfirmBulkRetire(false)}
        onConfirm={bulkRetire}
      />

      <ConfirmDialog
        open={confirmBulkDelete}
        title="Delete selected users?"
        description="This permanently removes all selected retired users from the directory."
        confirmLabel="Delete"
        destructive
        onClose={() => setConfirmBulkDelete(false)}
        onConfirm={bulkDelete}
      />

      <ConfirmDialog
        open={Boolean(confirmSingleRetire)}
        title="Retire user?"
        description={`Retire ${confirmSingleRetire?.name ?? ''}? They will lose access but remain in the directory until deleted.`}
        confirmLabel="Retire"
        onClose={() => setConfirmSingleRetire(null)}
        onConfirm={confirmRetireUser}
      />

      <ConfirmDialog
        open={Boolean(confirmSingleDelete)}
        title="Delete user?"
        description={`Permanently remove ${confirmSingleDelete?.name ?? ''} from the directory?`}
        confirmLabel="Delete"
        destructive
        onClose={() => setConfirmSingleDelete(null)}
        onConfirm={confirmDeleteUser}
      />
  </>
  )
}
