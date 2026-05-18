'use client'

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined'
import SecurityUpdateGoodOutlinedIcon from '@mui/icons-material/SecurityUpdateGoodOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { Menu, MenuItem } from '@mui/material'
import {
  DataGrid,
  GridToolbarContainer,
  useGridApiRef,
  type GridColDef,
  type GridRowId,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import { MoreVertical, Plus, Trash2, UserRound } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  UM_GRID_CELL_MUTED,
  UM_GRID_CELL_PRIMARY,
  userManagementDataGridDefaults,
  userManagementDataGridSx,
} from '@/src/components/user-management/user-management-data-grid-defaults'
import { UserManagementTableToolbar } from '@/src/components/user-management/user-management-table-toolbar'
import { gridColDefsToFilterColumns } from '@/src/lib/user-management/grid-filter-columns'
import { UserFormModal, type UserFormSubmitPayload } from '@/src/components/modals/user-form-modal'
import { ConfirmDialog } from '@/src/components/modals/confirm-dialog'
import { EnterpriseDataGridSurface } from '@/src/components/tables/enterprise-data-grid-surface'
import { UserManagementPageShell } from '@/src/components/user-management/user-management-page-shell'
import { useAdminSnackbar } from '@/src/hooks/use-admin-snackbar'
import { MOCK_USERS } from '@/src/mock-data/users'
import type { UserRow, UserStatus } from '@/src/types/user-management'

function NoRowsOverlay({ emptySearch }: { emptySearch: boolean }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-4 py-12 text-center">
      <UserRound className="size-12 text-muted-foreground/50" aria-hidden />
      <p className="text-sm font-semibold text-foreground">
        {emptySearch ? 'No users match your filters' : 'No users yet'}
      </p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Adjust search or filters, or add a new user to populate this directory.
      </p>
    </div>
  )
}

export function UsersPage() {
  const { showMessage } = useAdminSnackbar()
  const apiRef = useGridApiRef()
  const [rows, setRows] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all')
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([])
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [menuUser, setMenuUser] = useState<UserRow | null>(null)
  const [userModal, setUserModal] = useState<{
    open: boolean
    mode: 'create' | 'edit'
    user?: UserRow | null
    initialFocus?: 'role' | 'groups'
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

  const selectedCount = selectionModel.length

  const closeMenu = () => {
    setMenuAnchor(null)
    setMenuUser(null)
  }

  const openEdit = useCallback(
    (u: UserRow, initialFocus?: 'role' | 'groups') => {
      setUserModal({ open: true, mode: 'edit', user: u, initialFocus })
      closeMenu()
    },
    []
  )

  const handleRowClick = useCallback(
    (user: UserRow, event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (
        target.closest('[data-field="actions"]') ||
        target.closest('.MuiDataGrid-cellCheckbox') ||
        target.closest('.MuiCheckbox-root') ||
        target.closest('button')
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
      setUserModal({ open: false, mode: 'create', user: null })
    },
    [showMessage]
  )

  const columns: GridColDef<UserRow>[] = useMemo(
    () => [
      {
        field: 'userName',
        headerName: 'User Name',
        flex: 1,
        minWidth: 160,
        cellClassName: UM_GRID_CELL_PRIMARY,
      },
      { field: 'email', headerName: 'Email', flex: 1.2, minWidth: 200, cellClassName: UM_GRID_CELL_MUTED },
      { field: 'age', headerName: 'Age', width: 80, type: 'number', cellClassName: UM_GRID_CELL_MUTED },
      {
        field: 'mobileNumber',
        headerName: 'Mobile Number',
        flex: 1,
        minWidth: 140,
        cellClassName: UM_GRID_CELL_MUTED,
      },
      { field: 'role', headerName: 'Role', flex: 0.9, minWidth: 130, cellClassName: UM_GRID_CELL_MUTED },
      { field: 'group', headerName: 'Group', flex: 1, minWidth: 140, cellClassName: UM_GRID_CELL_MUTED },
      { field: 'location', headerName: 'Location', flex: 1, minWidth: 140, cellClassName: UM_GRID_CELL_MUTED },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: (params) => {
          const status = params.value as UserStatus
          return (
            <Badge
              variant="secondary"
              className={
                status === 'Active'
                  ? 'border-live/30 bg-live/20 text-live'
                  : status === 'Pending'
                    ? 'border-warning/30 bg-warning/20 text-warning'
                    : 'border-border bg-muted/50 text-muted-foreground'
              }
            >
              {status}
            </Badge>
          )
        },
      },
      {
        field: 'actions',
        headerName: 'Actions',
        sortable: false,
        filterable: false,
        hideable: false,
        disableColumnMenu: true,
        width: 96,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-primary"
            onClick={(e) => {
              e.stopPropagation()
              setMenuUser(params.row)
              setMenuAnchor(e.currentTarget)
            }}
          >
            <MoreVertical className="size-4" />
          </Button>
        ),
      },
    ],
    []
  )

  const filterableColumns = useMemo(() => gridColDefsToFilterColumns(columns), [columns])

  const bulkDelete = () => {
    const ids = selectionModel as GridRowId[]
    setRows((prev) => prev.filter((r) => !ids.includes(r.id)))
    setSelectionModel([])
    setConfirmBulk(false)
    showMessage(`${ids.length} user(s) removed`, 'info')
  }

  const requestDeleteUser = useCallback((user: UserRow) => {
    setUserModal({ open: false, mode: 'create', user: null, initialFocus: undefined })
    setConfirmSingle(user)
  }, [])

  const confirmDeleteUser = useCallback(() => {
    if (!confirmSingle) return
    setRows((prev) => prev.filter((r) => r.id !== confirmSingle.id))
    setSelectionModel((prev) => prev.filter((id) => id !== confirmSingle.id))
    showMessage('User deleted', 'info')
    setConfirmSingle(null)
  }, [confirmSingle, showMessage])

  return (
    <UserManagementPageShell
      title="Users"
      description="Enterprise directory with RBAC-aware fields and responsive grid tooling."
      actions={
        <Button
          onClick={() => setUserModal({ open: true, mode: 'create', user: null, initialFocus: undefined })}
          className="gap-2"
        >
          <Plus className="size-4" />
          Add User
        </Button>
      }
    >
      <UserManagementTableToolbar
        apiRef={apiRef}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search users…"
        filterStorageKey="user-management:users"
        filterableColumns={filterableColumns}
        filtersSlot={
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as 'all' | UserStatus)}
          >
            <SelectTrigger size="sm" className="w-full min-w-[180px] border-border sm:w-[200px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <EnterpriseDataGridSurface className="min-h-[520px]">
        <DataGrid
          apiRef={apiRef}
          rows={filteredRows}
          columns={columns}
          loading={loading}
          getRowId={(r) => r.id}
          {...userManagementDataGridDefaults}
          checkboxSelection
          disableRowSelectionOnClick
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={(m) => setSelectionModel([...m])}
          onRowClick={(params, event) => handleRowClick(params.row, event)}
          pageSizeOptions={[5, 10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          slots={{
            ...userManagementDataGridDefaults.slots,
            toolbar: () => (
              <GridToolbarContainer sx={{ px: 2, py: 1.5, gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                {selectedCount > 0 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-destructive/40 text-destructive hover:bg-destructive/10"
                    onClick={() => setConfirmBulk(true)}
                  >
                    <Trash2 className="size-4" />
                    Delete selected ({selectedCount})
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">Select rows for bulk delete</span>
                )}
              </GridToolbarContainer>
            ),
            noRowsOverlay: () => <NoRowsOverlay emptySearch={Boolean(search) || statusFilter !== 'all'} />,
          }}
          sx={{
            ...userManagementDataGridSx,
            minHeight: 440,
            '& .MuiDataGrid-row': { cursor: 'pointer' },
            '& .MuiDataGrid-cellCheckbox, & [data-field="actions"]': { cursor: 'default' },
          }}
        />
      </EnterpriseDataGridSurface>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            if (menuUser) openEdit(menuUser)
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
            if (menuUser) openEdit(menuUser, 'groups')
          }}
        >
          <GroupAddOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Assign Group
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuUser) openEdit(menuUser, 'role')
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
        onClose={() => setUserModal({ open: false, mode: 'create', user: null, initialFocus: undefined })}
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
