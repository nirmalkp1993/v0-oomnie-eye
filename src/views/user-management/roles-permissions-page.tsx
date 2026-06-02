'use client'

import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import RuleFolderOutlinedIcon from '@mui/icons-material/RuleFolderOutlined'
import { IconButton, Menu, MenuItem, Button, Chip } from '@mui/material'
import { MoreVertical } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react'
import AddIcon from '@mui/icons-material/Add'
import { ExplorerListTableProvider } from '@/components/tables/explorer-list-table-context'
import { ROLE_LIST_COLUMNS } from '@/lib/explorer-list-table/user-management-columns'
import { RoleFormModal, type RoleFormTab } from '@/src/components/modals/role-form-modal'
import { ConfirmDialog } from '@/src/components/modals/confirm-dialog'
import { UserManagementExplorerTable } from '@/src/components/user-management/user-management-explorer-table'
import { UserManagementPageShell } from '@/src/components/user-management/user-management-page-shell'
import { UserManagementTableToolbar } from '@/src/components/user-management/user-management-table-toolbar'
import {
  clonePermissionMatrix,
  createEmptyPermissionMatrix,
  type PermissionMatrix,
} from '@/src/constants/permissions-matrix'
import { useAdminSnackbar } from '@/src/hooks/use-admin-snackbar'
import { getRoleRowCellValue } from '@/src/lib/user-management/role-row-values'
import { MOCK_ROLE_PERMISSIONS, MOCK_ROLES } from '@/src/mock-data/roles'
import type { RoleListItem } from '@/src/types/user-management'
import type { RoleFormValues } from '@/src/utils/validation'

export function RolesPermissionsPage() {
  const { showMessage } = useAdminSnackbar()
  const [rows, setRows] = useState<RoleListItem[]>([])
  const [matrices, setMatrices] = useState<Record<string, PermissionMatrix>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [menuRow, setMenuRow] = useState<RoleListItem | null>(null)
  const [modal, setModal] = useState<{
    open: boolean
    mode: 'create' | 'edit'
    row?: RoleListItem | null
    initialTab?: RoleFormTab
  }>({
    open: false,
    mode: 'create',
  })
  const [confirmDelete, setConfirmDelete] = useState<RoleListItem | null>(null)

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
      (r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    )
  }, [rows, search])

  const closeMenu = () => {
    setMenuAnchor(null)
    setMenuRow(null)
  }

  const openEdit = useCallback((row: RoleListItem, initialTab: RoleFormTab = 'details') => {
    setModal({ open: true, mode: 'edit', row, initialTab })
    closeMenu()
  }, [])

  const handleRowClick = useCallback(
    (row: RoleListItem, event: MouseEvent<HTMLTableRowElement>) => {
      const target = event.target as HTMLElement
      if (target.closest('[data-um-actions]') || target.closest('button')) {
        return
      }
      openEdit(row)
    },
    [openEdit]
  )

  const requestDeleteRole = useCallback((row: RoleListItem) => {
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
            r.id === existingId
              ? { ...r, name: values.roleName, description: values.description ?? '' }
              : r
          )
        )
        setMatrices((prev) => ({ ...prev, [existingId]: clonePermissionMatrix(matrix) }))
        showMessage('Role & permissions saved')
      } else {
        const id = `role-${Date.now()}`
        setRows((prev) => [
          ...prev,
          {
            id,
            name: values.roleName,
            description: values.description ?? '',
            badges: [],
            iconVariant: 'hexagon',
            userCount: 0,
            groupCount: 0,
            permissionCount: 0,
            dataScope: 'Own records',
            status: 'active',
            lastUpdated: new Date().toISOString().slice(0, 10),
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
    (source: RoleListItem) => {
      const id = `role-${Date.now()}`
      const clone: RoleListItem = {
        ...source,
        id,
        name: `${source.name} (copy)`,
        userCount: 0,
        groupCount: 0,
        lastUpdated: new Date().toISOString().slice(0, 10),
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

  const renderCell = useCallback((row: RoleListItem, columnId: string) => {
    switch (columnId) {
      case 'name':
        return (
          <span className="truncate font-medium">
            {row.name}
            {row.badges.includes('system') ? (
              <Chip label="System" size="small" sx={{ ml: 1 }} variant="outlined" />
            ) : null}
          </span>
        )
      case 'description':
        return <span className="line-clamp-2">{row.description}</span>
      case 'userCount':
        return row.userCount
      case 'groupCount':
        return row.groupCount
      case 'permissionCount':
        return row.permissionCount
      case 'dataScope':
        return row.dataScope
      case 'status':
        return (
          <Chip
            label={row.status === 'active' ? 'Active' : 'Inactive'}
            size="small"
            color={row.status === 'active' ? 'success' : 'default'}
            variant="outlined"
          />
        )
      case 'lastUpdated':
        return row.lastUpdated
      case 'actions':
        return (
          <IconButton
            size="small"
            aria-label="Row actions"
            data-um-actions
            sx={{ color: 'text.secondary' }}
            onClick={(e) => {
              e.stopPropagation()
              setMenuRow(row)
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
      <ExplorerListTableProvider storageKey="explorer-list-table:roles" columns={ROLE_LIST_COLUMNS}>
        <UserManagementTableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search roles…"
          resultCount={filtered.length}
          resultLabel="role"
        />

        <UserManagementExplorerTable
          rows={filtered}
          loading={loading}
          getRowId={(r) => r.id}
          getCellValue={getRoleRowCellValue}
          renderCell={renderCell}
          onRowClick={handleRowClick}
          primaryColumnId="name"
          minHeight={480}
          emptyMessage={
            search.trim()
              ? 'No roles match your search or filters.'
              : 'No roles yet. Add a role to build your RBAC catalog.'
          }
        />
      </ExplorerListTableProvider>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={() => menuRow && openEdit(menuRow)}>
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
          <ContentCopyOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Clone role
        </MenuItem>
        <MenuItem onClick={() => menuRow && openEdit(menuRow, 'permissions')}>
          <RuleFolderOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> View permissions
        </MenuItem>
      </Menu>

      <RoleFormModal
        open={modal.open}
        mode={modal.mode}
        roleRow={modal.row ?? undefined}
        roleId={modal.row?.id ?? null}
        initial={modal.row ? { roleName: modal.row.name, description: modal.row.description } : undefined}
        initialMatrix={modal.row && matrices[modal.row.id] ? matrices[modal.row.id] : null}
        initialTab={modal.initialTab}
        onClose={() => setModal({ open: false, mode: 'create', row: null, initialTab: undefined })}
        onSubmit={(vals, matrix) => saveRole(vals, matrix, modal.row?.id)}
        onDeleteRequest={
          modal.mode === 'edit' && modal.row
            ? () => requestDeleteRole(modal.row as RoleListItem)
            : undefined
        }
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete role?"
        description={`Remove ${confirmDelete?.name ?? ''} from the catalog?`}
        destructive
        confirmLabel="Delete"
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteRole}
      />
    </UserManagementPageShell>
  )
}
