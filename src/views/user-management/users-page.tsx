'use client'

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import SecurityUpdateGoodOutlinedIcon from '@mui/icons-material/SecurityUpdateGoodOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import {
  Button as MuiButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import {
  DataGrid,
  GridToolbarContainer,
  type GridColDef,
  type GridRowId,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import { Plus, Search, Trash2, UserRound } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  const [rows, setRows] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all')
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([])
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [menuUser, setMenuUser] = useState<UserRow | null>(null)
  const [userModal, setUserModal] = useState<{ open: boolean; mode: 'create' | 'edit'; user?: UserRow | null }>({
    open: false,
    mode: 'create',
  })
  const [detailsUser, setDetailsUser] = useState<UserRow | null>(null)
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

  const openEdit = useCallback((u: UserRow) => {
    setUserModal({ open: true, mode: 'edit', user: u })
    closeMenu()
  }, [])

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
      setUserModal({ open: false, mode: 'create' })
    },
    [showMessage]
  )

  const columns: GridColDef<UserRow>[] = useMemo(
    () => [
      { field: 'userName', headerName: 'User Name', flex: 1, minWidth: 160 },
      { field: 'email', headerName: 'Email', flex: 1.2, minWidth: 200 },
      { field: 'age', headerName: 'Age', width: 80, type: 'number' },
      { field: 'mobileNumber', headerName: 'Mobile Number', flex: 1, minWidth: 140 },
      { field: 'role', headerName: 'Role', flex: 0.9, minWidth: 130 },
      { field: 'group', headerName: 'Group', flex: 1, minWidth: 140 },
      { field: 'location', headerName: 'Location', flex: 1, minWidth: 140 },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: (params) => {
          const color = params.value === 'Active' ? 'success' : params.value === 'Pending' ? 'warning' : 'default'
          return (
            <Chip
              size="small"
              label={params.value}
              color={color === 'default' ? 'default' : color}
              variant={color === 'default' ? 'outlined' : 'filled'}
            />
          )
        },
      },
      {
        field: 'actions',
        headerName: 'Actions',
        sortable: false,
        filterable: false,
        width: 96,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <MuiButton
            size="small"
            color="inherit"
            onClick={(e) => {
              setMenuUser(params.row)
              setMenuAnchor(e.currentTarget)
            }}
          >
            <MoreVertIcon fontSize="small" />
          </MuiButton>
        ),
      },
    ],
    []
  )

  const bulkDelete = () => {
    const ids = selectionModel as GridRowId[]
    setRows((prev) => prev.filter((r) => !ids.includes(r.id)))
    setSelectionModel([])
    setConfirmBulk(false)
    showMessage(`${ids.length} user(s) removed`, 'info')
  }

  return (
    <UserManagementPageShell
      title="Users"
      description="Enterprise directory with RBAC-aware fields and responsive grid tooling."
      actions={
        <Button onClick={() => setUserModal({ open: true, mode: 'create', user: null })} className="gap-2">
          <Plus className="size-4" />
          Add User
        </Button>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users…"
            className="border-border bg-input pl-9 text-foreground placeholder:text-muted-foreground focus-visible:border-primary"
          />
        </div>
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
      </div>

      <EnterpriseDataGridSurface className="min-h-[520px]">
        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          getRowId={(r) => r.id}
          checkboxSelection
          disableRowSelectionOnClick
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={(m) => setSelectionModel([...m])}
          pageSizeOptions={[5, 10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          slots={{
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
          sx={{ border: 'none', minHeight: 440 }}
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
            if (menuUser) setConfirmSingle(menuUser)
            closeMenu()
          }}
        >
          <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuUser) openEdit(menuUser)
            showMessage('Assign groups via the Groups field in the user form', 'info')
          }}
        >
          <GroupAddOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Assign Group
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuUser) openEdit(menuUser)
            showMessage('Assign role via the Role dropdown in the user form', 'info')
          }}
        >
          <SecurityUpdateGoodOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Assign Role
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuUser) setDetailsUser(menuUser)
            closeMenu()
          }}
        >
          <VisibilityOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> View Details
        </MenuItem>
      </Menu>

      <UserFormModal
        open={userModal.open}
        mode={userModal.mode}
        initial={userModal.user ?? undefined}
        onClose={() => setUserModal({ open: false, mode: 'create' })}
        onSubmit={(payload) => {
          if (userModal.mode === 'edit' && userModal.user) handleSaveUser(payload, userModal.user.id)
          else handleSaveUser(payload)
        }}
      />

      <Dialog open={Boolean(detailsUser)} onClose={() => setDetailsUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle>User details</DialogTitle>
        <DialogContent dividers>
          {detailsUser ? (
            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>Name:</strong> {detailsUser.userName}
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {detailsUser.email}
              </Typography>
              <Typography variant="body2">
                <strong>Age:</strong> {detailsUser.age}
              </Typography>
              <Typography variant="body2">
                <strong>Mobile:</strong> {detailsUser.mobileNumber}
              </Typography>
              <Typography variant="body2">
                <strong>Role:</strong> {detailsUser.role}
              </Typography>
              <Typography variant="body2">
                <strong>Group:</strong> {detailsUser.group}
              </Typography>
              <Typography variant="body2">
                <strong>Location:</strong> {detailsUser.location}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> {detailsUser.status}
              </Typography>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setDetailsUser(null)} variant="outlined" color="inherit">
            Close
          </MuiButton>
        </DialogActions>
      </Dialog>

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
        onConfirm={() => {
          if (confirmSingle) {
            setRows((p) => p.filter((r) => r.id !== confirmSingle.id))
            showMessage('User deleted', 'info')
          }
          setConfirmSingle(null)
        }}
      />
    </UserManagementPageShell>
  )
}
