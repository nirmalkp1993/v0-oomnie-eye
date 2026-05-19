'use client'

import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import RuleFolderOutlinedIcon from '@mui/icons-material/RuleFolderOutlined'
import { IconButton, Menu, MenuItem } from '@mui/material'
import { DataGrid, useGridApiRef, type GridColDef } from '@mui/x-data-grid'
import { MoreVertical } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react'
import AddIcon from '@mui/icons-material/Add'
import { Button } from '@mui/material'
import {
  UM_GRID_CELL_MUTED,
  UM_GRID_CELL_PRIMARY,
  userManagementDataGridDefaults,
  userManagementDataGridSx,
} from '@/src/components/user-management/user-management-data-grid-defaults'
import { UserManagementTableToolbar } from '@/src/components/user-management/user-management-table-toolbar'
import { gridColDefsToFilterColumns } from '@/src/lib/user-management/grid-filter-columns'
import { RoleFormModal, type RoleFormTab } from '@/src/components/modals/role-form-modal'
import { ConfirmDialog } from '@/src/components/modals/confirm-dialog'
import { EnterpriseDataGridSurface } from '@/src/components/tables/enterprise-data-grid-surface'
import { UserManagementPageShell } from '@/src/components/user-management/user-management-page-shell'
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
  const [modal, setModal] = useState<{
    open: boolean
    mode: 'create' | 'edit'
    row?: RoleRow | null
    initialTab?: RoleFormTab
  }>({
    open: false,
    mode: 'create',
  })
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

  const openEdit = useCallback((row: RoleRow, initialTab: RoleFormTab = 'details') => {
    setModal({ open: true, mode: 'edit', row, initialTab })
    closeMenu()
  }, [])

  const handleRowClick = useCallback(
    (row: RoleRow, event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target.closest('[data-field="actions"]') || target.closest('button')) {
        return
      }
      openEdit(row)
    },
    [openEdit]
  )

  const requestDeleteRole = useCallback((row: RoleRow) => {
    setModal({ open: false, mode: 'create', row: null, initialTab: undefined })
    setConfirmDelete(row)
  }, [])

  const confirmDeleteRole = useCallback(() => {
    if (!confirmDelete) return
    setRows((prev) => prev.filter((r) => r.id !== confirmDelete.id))
    setMatrices((m) => {
      const next = { ...m }
      delete next[confirmDelete.id]
      return next
    })
    showMessage('Role deleted', 'info')
    setConfirmDelete(null)
  }, [confirmDelete, showMessage])

  const saveRole = useCallback(
    (values: RoleFormValues, matrix: PermissionMatrix, existingId?: string) => {
      if (existingId) {
        setRows((prev) =>
          prev.map((r) =>
            r.id === existingId ? { ...r, roleName: values.roleName, description: values.description ?? '' } : r
          )
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
      setModal({ open: false, mode: 'create', row: null, initialTab: undefined })
    },
    [showMessage]
  )

  const cloneRole = useCallback(
    (source: RoleRow) => {
      const id = `r${Date.now()}`
      const clone: RoleRow = {
        ...source,
        id,
        roleName: `${source.roleName} (copy)`,
        userCount: 0,
        createdDate: new Date().toISOString().slice(0, 10),
      }
      setRows((p) => [...p, clone])
      setMatrices((m) => ({
        ...m,
        [id]: matrices[source.id] ? clonePermissionMatrix(matrices[source.id]) : createEmptyPermissionMatrix(),
      }))
      showMessage('Role cloned')
    },
    [matrices, showMessage]
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
          <IconButton
            size="small"
            aria-label="Row actions"
            sx={{ color: 'text.secondary' }}
            onClick={(e) => {
              e.stopPropagation()
              setMenuRow(p.row)
              setMenuAnchor(e.currentTarget)
            }}
          >
            <MoreVertical className="size-4" />
          </IconButton>
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setModal({ open: true, mode: 'create', row: null, initialTab: undefined })}
        >
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
          onRowClick={(params, event) => handleRowClick(params.row, event)}
          pageSizeOptions={[5, 10]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          sx={{
            ...userManagementDataGridSx,
            minHeight: 400,
            '& .MuiDataGrid-row': { cursor: 'pointer' },
            '& [data-field="actions"]': { cursor: 'default' },
          }}
        />
      </EnterpriseDataGridSurface>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            if (menuRow) openEdit(menuRow)
          }}
        >
          <EditOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuRow) requestDeleteRole(menuRow)
            closeMenu()
          }}
        >
          <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuRow) cloneRole(menuRow)
            closeMenu()
          }}
        >
          <ContentCopyOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Clone Role
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuRow) openEdit(menuRow, 'permissions')
          }}
        >
          <RuleFolderOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> View Permissions
        </MenuItem>
      </Menu>

      <RoleFormModal
        open={modal.open}
        mode={modal.mode}
        roleRow={modal.row ?? undefined}
        roleId={modal.row?.id ?? null}
        initial={modal.row ? { roleName: modal.row.roleName, description: modal.row.description } : undefined}
        initialMatrix={modal.row && matrices[modal.row.id] ? matrices[modal.row.id] : null}
        initialTab={modal.initialTab}
        onClose={() => setModal({ open: false, mode: 'create', row: null, initialTab: undefined })}
        onSubmit={(vals, matrix) => saveRole(vals, matrix, modal.row?.id)}
        onDeleteRequest={
          modal.mode === 'edit' && modal.row ? () => requestDeleteRole(modal.row as RoleRow) : undefined
        }
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete role?"
        description={`Remove ${confirmDelete?.roleName ?? ''} from the catalog?`}
        destructive
        confirmLabel="Delete"
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteRole}
      />
    </UserManagementPageShell>
  )
}
