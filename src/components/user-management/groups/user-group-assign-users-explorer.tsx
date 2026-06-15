'use client'

import { useMemo, type DragEvent, type MouseEvent } from 'react'
import { Box } from '@mui/material'
import { ExplorerListTableProvider } from '@/components/tables/explorer-list-table-context'
import { USER_GROUP_ASSIGN_USER_COLUMNS } from '@/lib/explorer-list-table/user-management-columns'
import { UserManagementExplorerTable } from '@/src/components/user-management/user-management-explorer-table'
import { UserManagementTableToolbar } from '@/src/components/user-management/user-management-table-toolbar'
import { renderUserDirectoryCell } from '@/src/components/user-management/user-directory-table-cells'
import { filterPanelUsers } from '@/src/lib/user-management/user-panel-filters'
import { getUserRowCellValue } from '@/src/lib/user-management/user-row-values'
import type { UserListItem } from '@/src/types/user-management'

export type UserGroupAssignUsersExplorerProps = {
  storageKey: string
  users: UserListItem[]
  searchQuery: string
  onSearchChange: (value: string) => void
  emptyMessage: string
  selectedIds?: string[]
  onSelectedIdsChange?: (ids: string[]) => void
  checkboxSelection?: boolean
  onRowClick?: (user: UserListItem, event: MouseEvent<HTMLTableRowElement>) => void
  onRowDoubleClick?: (user: UserListItem, event: MouseEvent<HTMLTableRowElement>) => void
  rowClickToggleSelect?: boolean
  isRowDraggable?: (user: UserListItem) => boolean
  onRowDragStart?: (user: UserListItem, event: DragEvent<HTMLTableRowElement>) => void
}

export function UserGroupAssignUsersExplorer({
  storageKey,
  users,
  searchQuery,
  onSearchChange,
  emptyMessage,
  selectedIds,
  onSelectedIdsChange,
  checkboxSelection = false,
  onRowClick,
  onRowDoubleClick,
  rowClickToggleSelect = false,
  isRowDraggable,
  onRowDragStart,
}: UserGroupAssignUsersExplorerProps) {
  const filteredUsers = useMemo(
    () => filterPanelUsers(users, searchQuery),
    [users, searchQuery],
  )

  const panelEmptyMessage =
    searchQuery.trim() && filteredUsers.length === 0
      ? 'No users match your search or filters.'
      : emptyMessage

  return (
    <ExplorerListTableProvider storageKey={storageKey} columns={USER_GROUP_ASSIGN_USER_COLUMNS}>
      <UserManagementTableToolbar
        search={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search users..."
        resultCount={filteredUsers.length}
        resultLabel="user"
      />
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <UserManagementExplorerTable
          embedded
          rows={filteredUsers}
          getRowId={(row) => row.id}
          getCellValue={getUserRowCellValue}
          renderCell={renderUserDirectoryCell}
          emptyMessage={panelEmptyMessage}
          minHeight={0}
          checkboxSelection={checkboxSelection}
          selectedIds={selectedIds}
          onSelectedIdsChange={onSelectedIdsChange}
          onRowClick={onRowClick}
          onRowDoubleClick={onRowDoubleClick}
          rowClickToggleSelect={rowClickToggleSelect}
          isRowDraggable={isRowDraggable}
          onRowDragStart={onRowDragStart}
        />
      </Box>
    </ExplorerListTableProvider>
  )
}
