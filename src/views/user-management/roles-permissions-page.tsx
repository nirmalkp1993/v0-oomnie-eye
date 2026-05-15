'use client'

import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import RuleFolderOutlinedIcon from '@mui/icons-material/RuleFolderOutlined'
import {
  Button as MuiButton,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { Plus, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RoleFormModal } from '@/src/components/modals/role-form-modal'
import { ConfirmDialog } from '@/src/components/modals/confirm-dialog'
import { EnterpriseDataGridSurface } from '@/src/components/tables/enterprise-data-grid-surface'
import { UserManagementPageShell } from '@/src/components/user-management/user-management-page-shell'
import {
  PERMISSION_COLUMNS,
  PERMISSION_MODULES,
  clonePermissionMatrix,
  createEmptyPermissionMatrix,
  type PermissionMatrix,
} from '@/src/constants/permissions-matrix'
import { useAdminSnackbar } from '@/src/hooks/use-admin-snackbar'
import { MOCK_ROLE_PERMISSIONS, MOCK_ROLES } from '@/src/mock-data/roles'
import type { RoleRow } from '@/src/types/user-management'
import type { RoleFormValues } from '@/src/utils/validation'

function PermissionsReadonly({ matrix }: { matrix: PermissionMatrix }) {
  const theme = useTheme()
  return (
    <TableContainer sx={{ maxHeight: 360 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Module</TableCell>
            {PERMISSION_COLUMNS.map((c) => (
              <TableCell key={c} align="center" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.06) }}>
                {c}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {PERMISSION_MODULES.map((mod) => (
            <TableRow key={mod}>
              <TableCell sx={{ fontWeight: 600 }}>{mod}</TableCell>
              {PERMISSION_COLUMNS.map((col) => (
                <TableCell key={col} align="center">
                  <Tooltip title={`${mod} — ${col}`}>
                    <Checkbox size="small" checked={matrix[mod][col]} disabled />
                  </Tooltip>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export function RolesPermissionsPage() {
  const { showMessage } = useAdminSnackbar()
  const [rows, setRows] = useState<RoleRow[]>([])
  const [matrices, setMatrices] = useState<Record<string, PermissionMatrix>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [menuRow, setMenuRow] = useState<RoleRow | null>(null)
  const [modal, setModal] = useState<{ open: boolean; mode: 'create' | 'edit'; row?: RoleRow | null }>({
    open: false,
    mode: 'create',
  })
  const [viewMatrixRole, setViewMatrixRole] = useState<RoleRow | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<RoleRow | null>(null)

  useEffect(() => {
    setLoading(true)
    const t = window.setTimeout(() => {
      setRows(MOCK_ROLES.map((r) => ({ ...r })))
      const m: Record<string, PermissionMatrix> = {}
      for (const r of MOCK_ROLES) {
        m[r.id] = MOCK_ROLE_PERMISSIONS[r.id]
          ? clonePermissionMatrix(MOCK_ROLE_PERMISSIONS[r.id])
          : createEmptyPermissionMatrix()
      }
      setMatrices(m)
      setLoading(false)
    }, 650)
    return () => window.clearTimeout(t)
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) => r.roleName.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    )
  }, [rows, search])

  const closeMenu = () => {
    setMenuAnchor(null)
    setMenuRow(null)
  }

  const saveRole = useCallback(
    (values: RoleFormValues, matrix: PermissionMatrix, existingId?: string) => {
      if (existingId) {
        setRows((prev) =>
          prev.map((r) => (r.id === existingId ? { ...r, roleName: values.roleName, description: values.description ?? '' } : r))
        )
        setMatrices((prev) => ({ ...prev, [existingId]: clonePermissionMatrix(matrix) }))
        showMessage('Role & permissions saved')
      } else {
        const id = `r${Date.now()}`
        setRows((prev) => [
          ...prev,
          {
            id,
            roleName: values.roleName,
            description: values.description ?? '',
            userCount: 0,
            createdDate: new Date().toISOString().slice(0, 10),
          },
        ])
        setMatrices((prev) => ({ ...prev, [id]: clonePermissionMatrix(matrix) }))
        showMessage('Role created')
      }
      setModal({ open: false, mode: 'create' })
    },
    [showMessage]
  )

  const columns: GridColDef<RoleRow>[] = useMemo(
    () => [
      { field: 'roleName', headerName: 'Role Name', flex: 1, minWidth: 160 },
      { field: 'description', headerName: 'Description', flex: 1.5, minWidth: 220 },
      { field: 'userCount', headerName: 'User Count', type: 'number', width: 120 },
      { field: 'createdDate', headerName: 'Created Date', width: 130 },
      {
        field: 'actions',
        headerName: 'Actions',
        sortable: false,
        width: 88,
        renderCell: (p) => (
          <MuiButton
            size="small"
            color="inherit"
            onClick={(e) => {
              setMenuRow(p.row)
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

  return (
    <UserManagementPageShell
      title="Roles & Permissions"
      description="RBAC catalog with an enterprise-grade permission matrix per role."
      actions={
        <Button onClick={() => setModal({ open: true, mode: 'create', row: null })} className="gap-2">
          <Plus className="size-4" />
          Add Role
        </Button>
      }
    >
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search roles…"
          className="border-border bg-input pl-9 text-foreground placeholder:text-muted-foreground focus-visible:border-primary"
        />
      </div>

      <EnterpriseDataGridSurface className="min-h-[480px]">
        <DataGrid
          rows={filtered}
          columns={columns}
          loading={loading}
          getRowId={(r) => r.id}
          pageSizeOptions={[5, 10]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          sx={{ border: 'none', minHeight: 400 }}
        />
      </EnterpriseDataGridSurface>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            if (menuRow) setModal({ open: true, mode: 'edit', row: menuRow })
            closeMenu()
          }}
        >
          <EditOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuRow) setConfirmDelete(menuRow)
            closeMenu()
          }}
        >
          <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuRow) {
              const id = `r${Date.now()}`
              const clone: RoleRow = {
                ...menuRow,
                id,
                roleName: `${menuRow.roleName} (copy)`,
                userCount: 0,
                createdDate: new Date().toISOString().slice(0, 10),
              }
              setRows((p) => [...p, clone])
              setMatrices((m) => ({
                ...m,
                [id]: matrices[menuRow.id] ? clonePermissionMatrix(matrices[menuRow.id]) : createEmptyPermissionMatrix(),
              }))
              showMessage('Role cloned')
            }
            closeMenu()
          }}
        >
          <ContentCopyOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Clone Role
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuRow) setViewMatrixRole(menuRow)
            closeMenu()
          }}
        >
          <RuleFolderOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> View Permissions
        </MenuItem>
      </Menu>

      <RoleFormModal
        open={modal.open}
        mode={modal.mode}
        roleId={modal.row?.id ?? null}
        initial={modal.row ? { roleName: modal.row.roleName, description: modal.row.description } : undefined}
        initialMatrix={modal.row && matrices[modal.row.id] ? matrices[modal.row.id] : null}
        onClose={() => setModal({ open: false, mode: 'create' })}
        onSubmit={(vals, matrix) => saveRole(vals, matrix, modal.row?.id)}
      />

      <Dialog open={Boolean(viewMatrixRole)} onClose={() => setViewMatrixRole(null)} maxWidth="lg" fullWidth>
        <DialogTitle>Permissions — {viewMatrixRole?.roleName}</DialogTitle>
        <DialogContent dividers>
          {viewMatrixRole && matrices[viewMatrixRole.id] ? (
            <PermissionsReadonly matrix={matrices[viewMatrixRole.id]} />
          ) : null}
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setViewMatrixRole(null)} variant="outlined" color="inherit">
            Close
          </MuiButton>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete role?"
        description={`Remove ${confirmDelete?.roleName ?? ''} from the catalog?`}
        destructive
        confirmLabel="Delete"
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) {
            setRows((p) => p.filter((r) => r.id !== confirmDelete.id))
            setMatrices((m) => {
              const n = { ...m }
              delete n[confirmDelete.id]
              return n
            })
            showMessage('Role deleted', 'info')
          }
          setConfirmDelete(null)
        }}
      />
    </UserManagementPageShell>
  )
}
