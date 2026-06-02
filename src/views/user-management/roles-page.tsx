'use client'

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import { Box, Button, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react'
import { ExplorerListTableProvider } from '@/components/tables/explorer-list-table-context'
import { ROLE_LIST_COLUMNS } from '@/lib/explorer-list-table/user-management-columns'
import { RoleFormModal } from '@/src/components/modals/role-form-modal'
import { ConfirmDialog } from '@/src/components/modals/confirm-dialog'
import { UserManagementExplorerTable } from '@/src/components/user-management/user-management-explorer-table'
import { UserManagementPageShell } from '@/src/components/user-management/user-management-page-shell'
import { UserManagementTableToolbar } from '@/src/components/user-management/user-management-table-toolbar'
import { RoleBadges } from '@/src/components/user-management/roles/role-badges'
import { RoleIcon } from '@/src/components/user-management/roles/role-icon'
import { RoleStatusBadge } from '@/src/components/user-management/roles/role-status-badge'
import {
  UmFilterSelect,
  UmPrimaryText,
  UmSecondaryText,
  myDrawingsPrimaryButtonSx,
  myDrawingsToolbarIconButtonSx,
} from '@/src/components/user-management/user-management-table-primitives'
import {
  MY_DRAWINGS_TABLE,
  myDrawingsBodySecondaryTypographySx,
} from '@/src/components/tables/my-drawings-table-styles'
import { useAdminSnackbar } from '@/src/hooks/use-admin-snackbar'
import { getRoleRowCellValue } from '@/src/lib/user-management/role-row-values'
import { MOCK_ROLES } from '@/src/mock-data/roles'
import type { RoleListItem, RoleStatus } from '@/src/types/user-management'

export function RolesPage() {
  const { showMessage } = useAdminSnackbar()
  const [rows, setRows] = useState<RoleListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | RoleStatus>('all')
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [menuRow, setMenuRow] = useState<RoleListItem | null>(null)
  const [modal, setModal] = useState<{ open: boolean; mode: 'create' | 'edit'; row?: RoleListItem | null }>({
    open: false,
    mode: 'create',
  })
  const [confirmDelete, setConfirmDelete] = useState<RoleListItem | null>(null)

  useEffect(() => {
    setLoading(true)
    const t = window.setTimeout(() => {
      setRows(MOCK_ROLES.map((r) => ({ ...r })))
      setLoading(false)
    }, 600)
    return () => window.clearTimeout(t)
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (!q) return true
      return (
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.dataScope.toLowerCase().includes(q)
      )
    })
  }, [rows, search, statusFilter])

  const closeMenu = () => {
    setMenuAnchor(null)
    setMenuRow(null)
  }

  const openEdit = useCallback((row: RoleListItem) => {
    setModal({ open: true, mode: 'edit', row })
    closeMenu()
  }, [])

  const handleRowClick = useCallback(
    (row: RoleListItem, event: MouseEvent<HTMLTableRowElement>) => {
      const target = event.target as HTMLElement
      if (target.closest('[data-um-actions]') || target.closest('button')) return
      openEdit(row)
    },
    [openEdit]
  )

  const saveRole = useCallback(
    (role: RoleListItem) => {
      const existingId = modal.row?.id
      if (existingId) {
        setRows((prev) => prev.map((r) => (r.id === existingId ? { ...role, id: existingId } : r)))
        showMessage('Role updated')
      } else {
        setRows((prev) => [role, ...prev])
        showMessage('Role created')
      }
      setModal({ open: false, mode: 'create', row: null })
    },
    [modal.row?.id, showMessage]
  )

  const renderCell = useCallback((row: RoleListItem, columnId: string) => {
    switch (columnId) {
      case 'name':
        return (
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', minWidth: 0 }}>
            <RoleIcon variant={row.iconVariant} />
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                <UmPrimaryText>{row.name}</UmPrimaryText>
                <RoleBadges badges={row.badges} />
              </Box>
              <Typography variant="body2" noWrap sx={myDrawingsBodySecondaryTypographySx}>
                {row.description}
              </Typography>
            </Box>
          </Box>
        )
      case 'description':
        return <UmSecondaryText>{row.description}</UmSecondaryText>
      case 'userCount':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <PersonOutlineOutlinedIcon sx={{ fontSize: 18, color: MY_DRAWINGS_TABLE.folderClosed }} />
            <UmSecondaryText>{row.userCount}</UmSecondaryText>
          </Box>
        )
      case 'groupCount':
        return <UmSecondaryText>{row.groupCount}</UmSecondaryText>
      case 'permissionCount':
        return <UmSecondaryText>{row.permissionCount}</UmSecondaryText>
      case 'dataScope':
        return <UmSecondaryText>{row.dataScope}</UmSecondaryText>
      case 'status':
        return <RoleStatusBadge status={row.status} />
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
    <UserManagementPageShell title="Roles" description="">
      <ExplorerListTableProvider storageKey="explorer-list-table:roles" columns={ROLE_LIST_COLUMNS}>
        <UserManagementTableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search roles…"
          resultCount={filtered.length}
          resultLabel="role"
          filtersSlot={
            <UmFilterSelect
              label="Status"
              labelId="roles-status-filter"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as 'all' | RoleStatus)}
            >
              <MenuItem value="all">All statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </UmFilterSelect>
          }
          trailingActions={
            <Button
              variant="contained"
              disableElevation
              size="small"
              startIcon={<ShieldOutlinedIcon />}
              onClick={() => setModal({ open: true, mode: 'create', row: null })}
              sx={myDrawingsPrimaryButtonSx}
            >
              New role
            </Button>
          }
        />

        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <UserManagementExplorerTable
          rows={filtered}
          loading={loading}
          getRowId={(r) => r.id}
          getCellValue={getRoleRowCellValue}
          renderCell={renderCell}
          onRowClick={handleRowClick}
          primaryColumnId="name"
          minHeight={480}
          emptyMessage={search.trim() || statusFilter !== 'all' ? 'No roles match your filters.' : 'No roles yet. Create a role to get started.'}
        />
        </Box>
      </ExplorerListTableProvider>
    </UserManagementPageShell>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={() => menuRow && openEdit(menuRow)}>
          <EditOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuRow) {
              setModal({ open: false, mode: 'create', row: null })
              setConfirmDelete(menuRow)
            }
            closeMenu()
          }}
        >
          <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      <RoleFormModal
        open={modal.open}
        mode={modal.mode}
        initial={modal.row ?? undefined}
        onClose={() => setModal({ open: false, mode: 'create', row: null })}
        onSubmit={saveRole}
        onDeleteRequest={
          modal.mode === 'edit' && modal.row ? () => setConfirmDelete(modal.row as RoleListItem) : undefined
        }
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete role?"
        description={`Remove ${confirmDelete?.name ?? ''} from the catalog?`}
        destructive
        confirmLabel="Delete"
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return
          setRows((prev) => prev.filter((r) => r.id !== confirmDelete.id))
          showMessage('Role deleted', 'info')
          setConfirmDelete(null)
        }}
      />
    </>
  )
}
