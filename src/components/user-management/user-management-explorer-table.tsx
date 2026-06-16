'use client'

import { useMemo, type DragEvent, type MouseEvent, type ReactNode } from 'react'
import {
  Box,
  Checkbox,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { ExplorerTableHeaderRow } from '@/components/tables/explorer-table-header-row'
import { useExplorerListTable } from '@/components/tables/explorer-list-table-context'
import { matchesAllExplorerFilters } from '@/lib/explorer-list-table/filter-utils'
import { compareExplorerSortValues } from '@/lib/explorer-list-table/sort-utils'
import { getEnterpriseSettingsCardSx } from '@/src/components/enterprise'
import {
  MY_DRAWINGS_TABLE,
  myDrawingsBodyRowSx,
  myDrawingsBodySecondaryTypographySx,
  myDrawingsTableBodySx,
  myDrawingsTableCellSx,
  myDrawingsTableHeadSx,
  myDrawingsTableSx,
} from '@/src/components/tables/my-drawings-table-styles'

export type UserManagementExplorerTableProps<TRow> = {
  rows: TRow[]
  loading?: boolean
  embedded?: boolean
  getRowId: (row: TRow) => string
  getCellValue: (row: TRow, columnId: string) => string
  renderCell: (row: TRow, columnId: string) => ReactNode
  onRowClick?: (row: TRow, event: MouseEvent<HTMLTableRowElement>) => void
  onRowDoubleClick?: (row: TRow, event: MouseEvent<HTMLTableRowElement>) => void
  onRowContextMenu?: (row: TRow, event: MouseEvent<HTMLTableRowElement>) => void
  rowClickToggleSelect?: boolean
  isRowDraggable?: (row: TRow) => boolean
  onRowDragStart?: (row: TRow, event: DragEvent<HTMLTableRowElement>) => void
  emptyMessage?: string
  primaryColumnId?: string
  checkboxSelection?: boolean
  selectedIds?: string[]
  onSelectedIdsChange?: (ids: string[]) => void
  minHeight?: number
}

export function UserManagementExplorerTable<TRow>({
  rows,
  loading = false,
  embedded = false,
  getRowId,
  getCellValue,
  renderCell,
  onRowClick,
  onRowDoubleClick,
  onRowContextMenu,
  rowClickToggleSelect = false,
  isRowDraggable,
  onRowDragStart,
  emptyMessage = 'No rows match your search or filters.',
  primaryColumnId: _primaryColumnId,
  checkboxSelection = false,
  selectedIds = [],
  onSelectedIdsChange,
  minHeight = 400,
}: UserManagementExplorerTableProps<TRow>) {
  const { visibleColumns, filters, sort } = useExplorerListTable()

  const displayRows = useMemo(() => {
    let list = rows.filter((row) =>
      matchesAllExplorerFilters(filters, (colId) => getCellValue(row, colId))
    )
    if (sort) {
      list = [...list].sort((a, b) =>
        compareExplorerSortValues(
          getCellValue(a, sort.columnId),
          getCellValue(b, sort.columnId),
          sort.direction
        )
      )
    }
    return list
  }, [rows, filters, sort, getCellValue])

  const allVisibleSelected =
    displayRows.length > 0 && displayRows.every((r) => selectedIds.includes(getRowId(r)))

  const toggleAll = () => {
    if (!onSelectedIdsChange) return
    if (allVisibleSelected) {
      const visibleSet = new Set(displayRows.map(getRowId))
      onSelectedIdsChange(selectedIds.filter((id) => !visibleSet.has(id)))
    } else {
      const merged = new Set([...selectedIds, ...displayRows.map(getRowId)])
      onSelectedIdsChange([...merged])
    }
  }

  const toggleRow = (id: string) => {
    if (!onSelectedIdsChange) return
    if (selectedIds.includes(id)) {
      onSelectedIdsChange(selectedIds.filter((x) => x !== id))
    } else {
      onSelectedIdsChange([...selectedIds, id])
    }
  }

  const colSpan = visibleColumns.length + (checkboxSelection ? 1 : 0)

  const tableContent = (
    <>
      {loading ? (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255,255,255,0.6)',
          }}
        >
          <CircularProgress size={32} sx={{ color: MY_DRAWINGS_TABLE.accent }} />
        </Box>
      ) : null}
      <TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto', pb: 1 }}>
        <Table stickyHeader size="small" sx={myDrawingsTableSx}>
          <TableHead sx={myDrawingsTableHeadSx}>
            <ExplorerTableHeaderRow
              variant="drawings"
              leading={
                checkboxSelection ? (
                  <TableCell sx={{ ...myDrawingsTableCellSx, width: 48, px: 1 }}>
                    <Checkbox
                      size="small"
                      checked={allVisibleSelected}
                      indeterminate={
                        !allVisibleSelected && displayRows.some((r) => selectedIds.includes(getRowId(r)))
                      }
                      onChange={toggleAll}
                      aria-label="Select all visible rows"
                    />
                  </TableCell>
                ) : undefined
              }
            />
          </TableHead>
          <TableBody sx={myDrawingsTableBodySx}>
            {displayRows.map((row) => {
              const id = getRowId(row)
              const isSelected = selectedIds.includes(id)
              const draggable = isRowDraggable?.(row) ?? false
              const isInteractive =
                Boolean(onRowClick) ||
                Boolean(onRowContextMenu) ||
                rowClickToggleSelect ||
                draggable
              return (
                <TableRow
                  key={id}
                  hover={false}
                  draggable={draggable}
                  onDragStart={onRowDragStart ? (e) => onRowDragStart(row, e) : undefined}
                  onClick={(e) => {
                    if (onRowClick) {
                      onRowClick(row, e)
                      return
                    }
                    if (rowClickToggleSelect) {
                      toggleRow(id)
                    }
                  }}
                  onDoubleClick={onRowDoubleClick ? (e) => onRowDoubleClick(row, e) : undefined}
                  onContextMenu={onRowContextMenu ? (e) => onRowContextMenu(row, e) : undefined}
                  sx={{
                    ...myDrawingsBodyRowSx({ selected: isSelected }),
                    cursor: draggable ? 'grab' : isInteractive ? 'pointer' : 'default',
                    ...(draggable ? { '&:active': { cursor: 'grabbing' } } : {}),
                  }}
                >
                  {checkboxSelection ? (
                    <TableCell
                      sx={{ ...myDrawingsTableCellSx, width: 48, px: 1 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        size="small"
                        checked={isSelected}
                        onChange={() => toggleRow(id)}
                        aria-label={`Select row ${id}`}
                      />
                    </TableCell>
                  ) : null}
                  {visibleColumns.map((col) => {
                    const isActions = col.id === 'actions'
                    return (
                      <TableCell
                        key={col.id}
                        align={isActions ? 'right' : 'left'}
                        sx={{
                          ...myDrawingsTableCellSx,
                          ...(isActions ? { width: 72, minWidth: 72 } : {}),
                        }}
                        onClick={isActions ? (e) => e.stopPropagation() : undefined}
                      >
                        {renderCell(row, col.id)}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
            {!loading && displayRows.length === 0 ? (
              <TableRow hover={false}>
                <TableCell colSpan={colSpan} sx={{ ...myDrawingsTableCellSx, height: 128, textAlign: 'center' }}>
                  <Typography variant="body2" sx={myDrawingsBodySecondaryTypographySx}>
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )

  if (embedded) {
    return (
      <Box
        sx={{
          overflow: 'hidden',
          minHeight,
          position: 'relative',
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {tableContent}
      </Box>
    )
  }

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        overflow: 'hidden',
        minHeight,
        position: 'relative',
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        ...getEnterpriseSettingsCardSx(theme),
      })}
    >
      {tableContent}
    </Paper>
  )
}
