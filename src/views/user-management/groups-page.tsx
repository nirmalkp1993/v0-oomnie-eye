'use client'

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'
import { Menu, MenuItem } from '@mui/material'
import { DataGrid, useGridApiRef, type GridColDef } from '@mui/x-data-grid'
import { MoreVertical, Plus } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react'
import { Button } from '@/components/ui/button'
import {
  UM_GRID_CELL_MUTED,
  UM_GRID_CELL_PRIMARY,
  userManagementDataGridDefaults,
  userManagementDataGridSx,
} from '@/src/components/user-management/user-management-data-grid-defaults'
import { UserManagementTableToolbar } from '@/src/components/user-management/user-management-table-toolbar'
import { gridColDefsToFilterColumns } from '@/src/lib/user-management/grid-filter-columns'
import {
  GroupFormModal,
  type GroupFormTab,
} from '@/src/components/modals/group-form-modal'
import { ConfirmDialog } from '@/src/components/modals/confirm-dialog'
import { EnterpriseDataGridSurface } from '@/src/components/tables/enterprise-data-grid-surface'
import { UserManagementPageShell } from '@/src/components/user-management/user-management-page-shell'
import type { TransferUserItem } from '@/src/components/user-management/dual-transfer-list'
import { useAdminSnackbar } from '@/src/hooks/use-admin-snackbar'
import { MOCK_GROUPS } from '@/src/mock-data/groups'
import { MOCK_USERS } from '@/src/mock-data/users'
import type { GroupRow } from '@/src/types/user-management'
import type { GroupFormValues } from '@/src/utils/validation'

const userDirectory: TransferUserItem[] = MOCK_USERS.map((u) => ({
  id: u.id,
  label: u.userName,
  secondary: u.email,
}))

const initialMembers: Record<string, string[]> = {
  g1: ['u1', 'u5', 'u8'],
  g2: ['u2', 'u6'],
  g3: ['u3'],
  g4: ['u4'],
  g5: ['u7'],
}

export function GroupsPage() {
  const { showMessage } = useAdminSnackbar()
  const apiRef = useGridApiRef()
  const [rows, setRows] = useState<GroupRow[]>([])
  const [membersByGroup, setMembersByGroup] = useState<Record<string, string[]>>({ ...initialMembers })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [menuRow, setMenuRow] = useState<GroupRow | null>(null)
  const [modal, setModal] = useState<{
    open: boolean
    mode: 'create' | 'edit'
    row?: GroupRow | null
    initialTab?: GroupFormTab
  }>({
    open: false,
    mode: 'create',
  })
  const [confirmDelete, setConfirmDelete] = useState<GroupRow | null>(null)

  useEffect(() => {
    setLoading(true)
    const t = window.setTimeout(() => {
      setRows(MOCK_GROUPS.map((g) => ({ ...g })))
      setLoading(false)
    }, 600)
    return () => window.clearTimeout(t)
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) =>
        r.groupName.toLowerCase().includes(q) ||
        r.groupId.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    )
  }, [rows, search])

  const closeMenu = () => {
    setMenuAnchor(null)
    setMenuRow(null)
  }

  const openEdit = useCallback((row: GroupRow, initialTab: GroupFormTab = 'details') => {
    setModal({ open: true, mode: 'edit', row, initialTab })
    closeMenu()
  }, [])

  const handleRowClick = useCallback(
    (row: GroupRow, event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (
        target.closest('[data-field="actions"]') ||
        target.closest('button')
      ) {
        return
      }
      openEdit(row)
    },
    [openEdit]
  )

  const requestDeleteGroup = useCallback((row: GroupRow) => {
    setModal({ open: false, mode: 'create', row: null, initialTab: undefined })
    setConfirmDelete(row)
  }, [])

  const confirmDeleteGroup = useCallback(() => {
    if (!confirmDelete) return
    setRows((prev) => prev.filter((r) => r.id !== confirmDelete.id))
    setMembersByGroup((m) => {
      const next = { ...m }
      delete next[confirmDelete.id]
      return next
    })
    showMessage('Group deleted', 'info')
    setConfirmDelete(null)
  }, [confirmDelete, showMessage])

  const saveGroup = useCallback(
    (values: GroupFormValues & { memberUserIds: string[] }, existingId?: string) => {
      if (existingId) {
        setRows((prev) =>
          prev.map((r) =>
            r.id === existingId
              ? {
                  ...r,
                  groupName: values.groupName,
                  description: values.description ?? '',
                  assignedUsersCount: values.memberUserIds.length,
                }
              : r
          )
        )
        setMembersByGroup((m) => ({ ...m, [existingId]: values.memberUserIds }))
        showMessage('Group updated')
      } else {
        const id = `g${Date.now()}`
        const gid = `GRP-${2000 + rows.length}`
        setRows((prev) => [
          ...prev,
          {
            id,
            groupId: gid,
            groupName: values.groupName,
            description: values.description ?? '',
            assignedUsersCount: values.memberUserIds.length,
            createdDate: new Date().toISOString().slice(0, 10),
          },
        ])
        setMembersByGroup((m) => ({ ...m, [id]: values.memberUserIds }))
        showMessage('Group created')
      }
      setModal({ open: false, mode: 'create', row: null, initialTab: undefined })
    },
    [rows.length, showMessage]
  )

  const columns: GridColDef<GroupRow>[] = useMemo(
    () => [
      { field: 'groupId', headerName: 'Group ID', flex: 0.8, minWidth: 120, cellClassName: UM_GRID_CELL_MUTED },
      {
        field: 'groupName',
        headerName: 'Group Name',
        flex: 1,
        minWidth: 160,
        cellClassName: UM_GRID_CELL_PRIMARY,
      },
      {
        field: 'description',
        headerName: 'Description',
        flex: 1.4,
        minWidth: 220,
        cellClassName: UM_GRID_CELL_MUTED,
      },
      {
        field: 'assignedUsersCount',
        headerName: 'Assigned Users Count',
        type: 'number',
        width: 200,
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
              e.stopPropagation()
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
      title="Groups"
      description="Organize operators into access groups with dual-list membership editing."
      actions={
        <Button
          onClick={() => setModal({ open: true, mode: 'create', row: null, initialTab: undefined })}
          className="gap-2"
        >
          <Plus className="size-4" />
          Add Group
        </Button>
      }
    >
      <UserManagementTableToolbar
        apiRef={apiRef}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search groups…"
        resultCount={filtered.length}
        resultLabel="group"
        filterStorageKey="user-management:groups"
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
            if (menuRow) requestDeleteGroup(menuRow)
            closeMenu()
          }}
        >
          <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuRow) openEdit(menuRow, 'members')
          }}
        >
          <PeopleOutlineIcon fontSize="small" sx={{ mr: 1 }} /> View Users
        </MenuItem>
      </Menu>

      <GroupFormModal
        open={modal.open}
        mode={modal.mode}
        groupRow={modal.row ?? undefined}
        initialTab={modal.initialTab}
        initial={
          modal.row
            ? {
                groupName: modal.row.groupName,
                description: modal.row.description,
                memberUserIds: membersByGroup[modal.row.id] ?? [],
              }
            : undefined
        }
        allUsers={userDirectory}
        onClose={() => setModal({ open: false, mode: 'create', row: null, initialTab: undefined })}
        onSubmit={(vals) => saveGroup(vals, modal.row?.id)}
        onDeleteRequest={
          modal.mode === 'edit' && modal.row ? () => requestDeleteGroup(modal.row as GroupRow) : undefined
        }
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete group?"
        description={`Remove ${confirmDelete?.groupName ?? ''} and its local membership mapping?`}
        destructive
        confirmLabel="Delete"
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteGroup}
      />
    </UserManagementPageShell>
  )
}
