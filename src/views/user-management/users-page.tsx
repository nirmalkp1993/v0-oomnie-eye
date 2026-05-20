'use client'

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined'
import SecurityUpdateGoodOutlinedIcon from '@mui/icons-material/SecurityUpdateGoodOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Typography,
} from '@mui/material'
import { MoreVertical, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react'
import AddIcon from '@mui/icons-material/Add'
import { Badge } from '@/components/ui/badge'
import { ExplorerListTableProvider } from '@/components/tables/explorer-list-table-context'
import { USER_LIST_COLUMNS } from '@/lib/explorer-list-table/user-management-columns'
import { UserManagementExplorerTable } from '@/src/components/user-management/user-management-explorer-table'
import { UserManagementTableToolbar } from '@/src/components/user-management/user-management-table-toolbar'
import { UserFormModal, type UserFormSubmitPayload } from '@/src/components/modals/user-form-modal'
import { ConfirmDialog } from '@/src/components/modals/confirm-dialog'
import { UserManagementPageShell } from '@/src/components/user-management/user-management-page-shell'
import { useAdminSnackbar } from '@/src/hooks/use-admin-snackbar'
import { getUserRowCellValue } from '@/src/lib/user-management/user-row-values'
import { MOCK_USERS } from '@/src/mock-data/users'
import type { UserRow, UserStatus } from '@/src/types/user-management'

export function UsersPage() {
  const { showMessage } = useAdminSnackbar()
  const [rows, setRows] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [menuUser, setMenuUser] = useState<UserRow | null>(null)
  const [userModal, setUserModal] = useState<{
    open: boolean
    mode: 'create' | 'edit'
    user?: UserRow | null
    initialFocus?: 'role' | 'groups'
    startInEditMode?: boolean
  }>({
    open: false,
    mode: 'create',
  })
  const [confirmBulk, setConfirmBulk] = useState(false)
  const [confirmSingle, setConfirmSingle] = useState<UserRow | null>(null)

  useEffect(() => {
    setLoading(true)
    const t = window.setTimeout(() => {
      setRows(MOCK_USERS.map((r) => ({ ...r })))
      setLoading(false)
    }, 900)
    return () => window.clearTimeout(t)
  }, [])

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (!q) return true
      return (
        r.userName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q) ||
        r.group.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.mobileNumber.toLowerCase().includes(q)
      )
    })
  }, [rows, search, statusFilter])

  const selectedCount = selectedIds.length

  const closeMenu = () => {
    setMenuAnchor(null)
    setMenuUser(null)
  }

  const openEdit = useCallback(
    (
      u: UserRow,
      options?: { initialFocus?: 'role' | 'groups'; startInEditMode?: boolean }
    ) => {
      setUserModal({
        open: true,
        mode: 'edit',
        user: u,
        initialFocus: options?.initialFocus,
        startInEditMode: options?.startInEditMode,
      })
      closeMenu()
    },
    []
  )

  const handleRowClick = useCallback(
    (user: UserRow, event: MouseEvent<HTMLTableRowElement>) => {
      const target = event.target as HTMLElement
      if (
        target.closest('[data-um-actions]') ||
        target.closest('button') ||
        target.closest('[role="checkbox"]')
      ) {
        return
      }
      openEdit(user)
    },
    [openEdit]
  )

  const handleSaveUser = useCallback(
    (payload: UserFormSubmitPayload, existingId?: string) => {
      if (existingId) {
        setRows((prev) =>
          prev.map((r) =>
            r.id === existingId
              ? {
                  ...r,
                  userName: payload.userName,
                  email: payload.email,
                  age: payload.age,
                  mobileNumber: payload.mobileNumber,
                  role: payload.role,
                  group: payload.groupLabels.join(', '),
                  location: payload.locationLabel,
                  status: payload.status,
                }
              : r
          )
        )
        showMessage('User updated')
      } else {
        const id = `u${Date.now()}`
        setRows((prev) => [
          ...prev,
          {
            id,
            userName: payload.userName,
            email: payload.email,
            age: payload.age,
            mobileNumber: payload.mobileNumber,
            role: payload.role,
            group: payload.groupLabels.join(', '),
            location: payload.locationLabel,
            status: payload.status,
          },
        ])
        showMessage('User created')
      }
      setUserModal({ open: false, mode: 'create', user: null, startInEditMode: undefined })
    },
    [showMessage]
  )

  const bulkDelete = () => {
    const idSet = new Set(selectedIds)
    setRows((prev) => prev.filter((r) => !idSet.has(r.id)))
    setSelectedIds([])
    setConfirmBulk(false)
    showMessage(`${idSet.size} user(s) removed`, 'info')
  }

  const requestDeleteUser = useCallback((user: UserRow) => {
    setUserModal({ open: false, mode: 'create', user: null, initialFocus: undefined, startInEditMode: undefined })
    setConfirmSingle(user)
  }, [])

  const confirmDeleteUser = useCallback(() => {
    if (!confirmSingle) return
    setRows((prev) => prev.filter((r) => r.id !== confirmSingle.id))
    setSelectedIds((prev) => prev.filter((id) => id !== confirmSingle.id))
    showMessage('User deleted', 'info')
    setConfirmSingle(null)
  }, [confirmSingle, showMessage])

  const renderCell = useCallback((row: UserRow, columnId: string) => {
    switch (columnId) {
      case 'userName':
        return <span className="truncate">{row.userName}</span>
      case 'email':
        return <span className="truncate">{row.email}</span>
      case 'age':
        return row.age
      case 'mobileNumber':
        return row.mobileNumber
      case 'role':
        return row.role
      case 'group':
        return row.group
      case 'location':
        return row.location
      case 'status':
        return (
          <Badge
            variant="secondary"
            className={
              row.status === 'Active'
                ? 'border-live/30 bg-live/20 text-live'
                : row.status === 'Pending'
                  ? 'border-warning/30 bg-warning/20 text-warning'
                  : 'border-border bg-muted/50 text-muted-foreground'
            }
          >
            {row.status}
          </Badge>
        )
      case 'actions':
        return (
          <IconButton
            size="small"
            aria-label="Row actions"
            data-um-actions
            sx={{ color: 'text.secondary' }}
            onClick={(e) => {
              e.stopPropagation()
              setMenuUser(row)
              setMenuAnchor(e.currentTarget)
            }}
          >
            <MoreVertical className="size-4" />
          </IconButton>
        )
      default:
        return null
    }
  }, [])

  return (
    <UserManagementPageShell
      title="Users"
      description="Enterprise directory with RBAC-aware fields and responsive grid tooling."
      actions={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setUserModal({ open: true, mode: 'create', user: null, initialFocus: undefined })}
        >
          Add User
        </Button>
      }
    >
      <ExplorerListTableProvider storageKey="explorer-list-table:users" columns={USER_LIST_COLUMNS}>
        <UserManagementTableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search users…"
          resultCount={filteredRows.length}
          resultLabel="user"
          filtersSlot={
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
              <InputLabel id="users-status-filter-label">Status</InputLabel>
              <Select
                labelId="users-status-filter-label"
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | UserStatus)}
              >
                <MenuItem value="all">All statuses</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
              </Select>
            </FormControl>
          }
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
          {selectedCount > 0 ? (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<Trash2 className="size-4" />}
              onClick={() => setConfirmBulk(true)}
            >
              Delete selected ({selectedCount})
            </Button>
          ) : (
            <Typography variant="caption" color="text.secondary">
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
          primaryColumnId="userName"
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
      </ExplorerListTableProvider>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            if (menuUser) openEdit(menuUser, { startInEditMode: true })
          }}
        >
          <EditOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Edit
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
            if (menuUser) openEdit(menuUser, { initialFocus: 'groups', startInEditMode: true })
          }}
        >
          <GroupAddOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Assign Group
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuUser) openEdit(menuUser, { initialFocus: 'role', startInEditMode: true })
          }}
        >
          <SecurityUpdateGoodOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Assign Role
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuUser) openEdit(menuUser)
          }}
        >
          <VisibilityOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> View Details
        </MenuItem>
      </Menu>

      <UserFormModal
        open={userModal.open}
        mode={userModal.mode}
        initial={userModal.user ?? undefined}
        initialFocus={userModal.initialFocus}
        startInEditMode={userModal.startInEditMode}
        onClose={() =>
          setUserModal({
            open: false,
            mode: 'create',
            user: null,
            initialFocus: undefined,
            startInEditMode: undefined,
          })
        }
        onSubmit={(payload) => {
          if (userModal.mode === 'edit' && userModal.user) handleSaveUser(payload, userModal.user.id)
          else handleSaveUser(payload)
        }}
        onDeleteRequest={
          userModal.mode === 'edit' && userModal.user
            ? () => requestDeleteUser(userModal.user as UserRow)
            : undefined
        }
      />

      <ConfirmDialog
        open={confirmBulk}
        title="Delete selected users?"
        description="This action removes all selected users from the directory. You can restore from audit logs in production systems."
        confirmLabel="Delete"
        destructive
        onClose={() => setConfirmBulk(false)}
        onConfirm={bulkDelete}
      />

      <ConfirmDialog
        open={Boolean(confirmSingle)}
        title="Delete user?"
        description={`Remove ${confirmSingle?.userName ?? ''} from the directory?`}
        confirmLabel="Delete"
        destructive
        onClose={() => setConfirmSingle(null)}
        onConfirm={confirmDeleteUser}
      />
    </UserManagementPageShell>
  )
}
