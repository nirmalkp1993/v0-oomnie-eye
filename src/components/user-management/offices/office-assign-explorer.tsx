'use client'

import { useMemo, type DragEvent, type MouseEvent } from 'react'
import { Box, Typography } from '@mui/material'
import { ExplorerListTableProvider } from '@/components/tables/explorer-list-table-context'
import { OFFICE_ASSIGN_COLUMNS } from '@/lib/explorer-list-table/user-management-columns'
import { UserManagementExplorerTable } from '@/src/components/user-management/user-management-explorer-table'
import { UserManagementTableToolbar } from '@/src/components/user-management/user-management-table-toolbar'
import {
  UserGroupFolderBreadcrumbs,
  type UserGroupFolderBreadcrumb,
} from '@/src/components/user-management/groups/user-group-folder-breadcrumbs'
import {
  filterPanelOffices,
  getOfficeRowCellValue,
} from '@/src/lib/user-management/office-territory-members.utils'
import type { OfficeListItem } from '@/src/types/office-page'

export type OfficeAssignExplorerProps = {
  storageKey: string
  offices: OfficeListItem[]
  searchQuery: string
  onSearchChange: (value: string) => void
  emptyMessage: string
  breadcrumbItems?: UserGroupFolderBreadcrumb[]
  onBreadcrumbNavigate?: (segmentIndex: number) => void
  selectedIds?: string[]
  onSelectedIdsChange?: (ids: string[]) => void
  checkboxSelection?: boolean
  onRowDoubleClick?: (office: OfficeListItem, event: MouseEvent<HTMLTableRowElement>) => void
  rowClickToggleSelect?: boolean
  isRowDraggable?: (office: OfficeListItem) => boolean
  onRowDragStart?: (office: OfficeListItem, event: DragEvent<HTMLTableRowElement>) => void
}

function renderOfficeCell(row: OfficeListItem, columnId: string) {
  const value = getOfficeRowCellValue(row, columnId)
  if (columnId === 'name') {
    return (
      <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
        {value}
      </Typography>
    )
  }
  return (
    <Typography variant="body2" color="text.secondary" noWrap>
      {value}
    </Typography>
  )
}

export function OfficeAssignExplorer({
  storageKey,
  offices,
  searchQuery,
  onSearchChange,
  emptyMessage,
  breadcrumbItems = [],
  onBreadcrumbNavigate,
  selectedIds,
  onSelectedIdsChange,
  checkboxSelection = false,
  onRowDoubleClick,
  rowClickToggleSelect = false,
  isRowDraggable,
  onRowDragStart,
}: OfficeAssignExplorerProps) {
  const filteredOffices = useMemo(
    () => filterPanelOffices(offices, searchQuery),
    [offices, searchQuery],
  )

  const panelEmptyMessage =
    searchQuery.trim() && filteredOffices.length === 0
      ? 'No offices match your search.'
      : emptyMessage

  return (
    <ExplorerListTableProvider storageKey={storageKey} columns={OFFICE_ASSIGN_COLUMNS}>
      <UserManagementTableToolbar
        search={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search offices..."
        resultCount={filteredOffices.length}
        resultLabel="office"
      />
      {breadcrumbItems.length > 0 && onBreadcrumbNavigate ? (
        <UserGroupFolderBreadcrumbs items={breadcrumbItems} onNavigate={onBreadcrumbNavigate} />
      ) : null}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <UserManagementExplorerTable
          embedded
          rows={filteredOffices}
          getRowId={(row) => row.id}
          getCellValue={getOfficeRowCellValue}
          renderCell={renderOfficeCell}
          emptyMessage={panelEmptyMessage}
          checkboxSelection={checkboxSelection}
          selectedIds={selectedIds}
          onSelectedIdsChange={onSelectedIdsChange}
          rowClickToggleSelect={rowClickToggleSelect}
          onRowDoubleClick={onRowDoubleClick}
          isRowDraggable={isRowDraggable}
          onRowDragStart={onRowDragStart}
        />
      </Box>
    </ExplorerListTableProvider>
  )
}
