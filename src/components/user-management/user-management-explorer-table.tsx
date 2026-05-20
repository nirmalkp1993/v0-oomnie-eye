'use client'

import { useMemo, type MouseEvent, type ReactNode } from 'react'
import { Box, CircularProgress, Paper } from '@mui/material'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ExplorerTableHeaderRow } from '@/components/tables/explorer-table-header-row'
import { useExplorerListTable } from '@/components/tables/explorer-list-table-context'
import { matchesAllExplorerFilters } from '@/lib/explorer-list-table/filter-utils'
import { compareExplorerSortValues } from '@/lib/explorer-list-table/sort-utils'
import { getEnterpriseSettingsCardSx } from '@/src/components/enterprise'
import { cn } from '@/lib/utils'

export type UserManagementExplorerTableProps<TRow> = {
  rows: TRow[]
  loading?: boolean
  getRowId: (row: TRow) => string
  getCellValue: (row: TRow, columnId: string) => string
  renderCell: (row: TRow, columnId: string) => ReactNode
  onRowClick?: (row: TRow, event: MouseEvent<HTMLTableRowElement>) => void
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
  getRowId,
  getCellValue,
  renderCell,
  onRowClick,
  emptyMessage = 'No rows match your search or filters.',
  primaryColumnId,
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

  const someSelected = displayRows.some((r) => selectedIds.includes(getRowId(r)))

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

  const colSpan =
    visibleColumns.length + (checkboxSelection ? 1 : 0)

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        overflow: 'hidden',
        minHeight,
        position: 'relative',
        ...getEnterpriseSettingsCardSx(theme),
      })}
    >
      {loading ? (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'action.hover',
          }}
        >
          <CircularProgress size={32} />
        </Box>
      ) : null}
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHeader>
            <ExplorerTableHeaderRow
              leading={
                checkboxSelection ? (
                  <TableHead className="w-10 bg-card">
                    <Checkbox
                      checked={allVisibleSelected}
                      onCheckedChange={toggleAll}
                      aria-label="Select all visible rows"
                    />
                  </TableHead>
                ) : undefined
              }
            />
          </TableHeader>
          <TableBody>
            {displayRows.map((row) => {
              const id = getRowId(row)
              const isSelected = selectedIds.includes(id)
              return (
                <TableRow
                  key={id}
                  className={cn(
                    'border-border',
                    onRowClick && 'cursor-pointer hover:bg-primary/5',
                    isSelected && 'bg-primary/5'
                  )}
                  onClick={onRowClick ? (e) => onRowClick(row, e) : undefined}
                >
                  {checkboxSelection ? (
                    <TableCell
                      className="w-10 bg-card"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleRow(id)}
                        aria-label={`Select row ${id}`}
                      />
                    </TableCell>
                  ) : null}
                  {visibleColumns.map((col) => {
                    const isPrimary = col.id === primaryColumnId
                    const isActions = col.id === 'actions'
                    return (
                      <TableCell
                        key={col.id}
                        className={cn(
                          isPrimary &&
                            'sticky left-0 z-10 bg-card font-medium text-foreground',
                          isActions &&
                            'sticky right-0 z-10 bg-card text-right',
                          !isPrimary && !isActions && 'text-muted-foreground'
                        )}
                        onClick={
                          isActions || col.id === 'select'
                            ? (e) => e.stopPropagation()
                            : undefined
                        }
                      >
                        {renderCell(row, col.id)}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
            {!loading && displayRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="h-32 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  )
}
