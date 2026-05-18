'use client'

import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import RuleFolderOutlinedIcon from '@mui/icons-material/RuleFolderOutlined'
import { Menu, MenuItem } from '@mui/material'
import { DataGrid, useGridApiRef, type GridColDef } from '@mui/x-data-grid'
import { MoreVertical, Plus, Shield } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  UM_GRID_CELL_MUTED,
  UM_GRID_CELL_PRIMARY,
  userManagementDataGridDefaults,
  userManagementDataGridSx,
} from '@/src/components/user-management/user-management-data-grid-defaults'
import { UserManagementTableToolbar } from '@/src/components/user-management/user-management-table-toolbar'
import { gridColDefsToFilterColumns } from '@/src/lib/user-management/grid-filter-columns'
import { AppDialog } from '@/src/components/modals/app-dialog'
import { RoleFormModal } from '@/src/components/modals/role-form-modal'
import { ConfirmDialog } from '@/src/components/modals/confirm-dialog'
import { EnterpriseDataGridSurface } from '@/src/components/tables/enterprise-data-grid-surface'
import { UserManagementPageShell } from '@/src/components/user-management/user-management-page-shell'
import { PermissionMatrixReadonly } from '@/src/components/user-management/permission-matrix-readonly'
import {
  clonePermissionMatrix,
  createEmptyPermissionMatrix,
  type PermissionMatrix,
} from '@/src/constants/permissions-matrix'
import { useAdminSnackbar } from '@/src/hooks/use-admin-snackbar'
import { MOCK_ROLE_PERMISSIONS, MOCK_ROLES } from '@/src/mock-data/roles'
import type { RoleRow } from '@/src/types/user-management'
import type { RoleFormValues } from '@/src/utils/validation'

export function RolesPermissionsPage() {
  const { showMessage } = useAdminSnackbar()
  const apiRef = useGridApiRef()
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
      {
        field: 'roleName',
        headerName: 'Role Name',
        flex: 1,
        minWidth: 160,
        cellClassName: UM_GRID_CELL_PRIMARY,
      },
      {
        field: 'description',
        headerName: 'Description',
        flex: 1.5,
        minWidth: 220,
        cellClassName: UM_GRID_CELL_MUTED,
      },
      {
        field: 'userCount',
        headerName: 'User Count',
        type: 'number',
        width: 120,
        cellClassName: UM_GRID_CELL_MUTED,
      },
      { field: 'createdDate', headerName: 'Created Date', width: 130, cellClassName: UM_GRID_CELL_MUTED },
      {
        field: 'actions',
        headerName: 'Actions',
        sortable: false,
        filterable: false,
        hideable: false,
        width: 88,
        align: 'right',
        headerAlign: 'right',
        renderCell: (p) => (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-primary"
            onClick={(e) => {
              setMenuRow(p.row)
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
      <UserManagementTableToolbar
        apiRef={apiRef}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search roles…"
        resultCount={filtered.length}
        resultLabel="role"
        filterStorageKey="user-management:roles"
        filterableColumns={filterableColumns}
      />

      <EnterpriseDataGridSurface className="min-h-[480px]">
        <DataGrid
          apiRef={apiRef}
          rows={filtered}
          columns={columns}
          loading={loading}
          getRowId={(r) => r.id}
          {...userManagementDataGridDefaults}
          pageSizeOptions={[5, 10]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          sx={{ ...userManagementDataGridSx, minHeight: 400 }}
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

      <AppDialog
        open={Boolean(viewMatrixRole)}
        onClose={() => setViewMatrixRole(null)}
        title={`Permissions — ${viewMatrixRole?.roleName ?? ''}`}
        icon={Shield}
        maxWidth="4xl"
        footer={
          <Button type="button" variant="outline" className="border-border" onClick={() => setViewMatrixRole(null)}>
            Close
          </Button>
        }
      >
        {viewMatrixRole && matrices[viewMatrixRole.id] ? (
          <PermissionMatrixReadonly matrix={matrices[viewMatrixRole.id]} maxHeight={360} />
        ) : null}
      </AppDialog>

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
