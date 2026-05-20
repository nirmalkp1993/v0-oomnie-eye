'use client'

import { useState, type DragEvent, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, GripVertical } from 'lucide-react'
import { TableHead, TableRow } from '@/components/ui/table'
import { useExplorerListTable } from '@/components/tables/explorer-list-table-context'
import { cn } from '@/lib/utils'

export function ExplorerTableHeaderRow({ leading }: { leading?: ReactNode }) {
  const { visibleColumns, sort, toggleSort, reorderColumns } = useExplorerListTable()
  const [dragColumnId, setDragColumnId] = useState<string | null>(null)
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null)

  const handleDragStart = (columnId: string, e: DragEvent) => {
    if (columnId === 'actions') return
    setDragColumnId(columnId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', columnId)
  }

  const handleDragOver = (columnId: string, e: DragEvent) => {
    if (!dragColumnId || columnId === 'actions' || dragColumnId === 'actions') return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverColumnId !== columnId) setDragOverColumnId(columnId)
  }

  const handleDrop = (targetColumnId: string, e: DragEvent) => {
    e.preventDefault()
    const sourceId = dragColumnId ?? e.dataTransfer.getData('text/plain')
    if (!sourceId || sourceId === targetColumnId || targetColumnId === 'actions') {
      clearDragState()
      return
    }
    const ids = visibleColumns.map((c) => c.id)
    const from = ids.indexOf(sourceId)
    const to = ids.indexOf(targetColumnId)
    if (from < 0 || to < 0) {
      clearDragState()
      return
    }
    const next = [...ids]
    next.splice(from, 1)
    next.splice(to, 0, sourceId)
    reorderColumns(next)
    clearDragState()
  }

  const clearDragState = () => {
    setDragColumnId(null)
    setDragOverColumnId(null)
  }

  return (
    <TableRow className="border-border hover:bg-transparent">
      {leading}
      {visibleColumns.map((col) => {
        const isSortable = col.sortable !== false && col.id !== 'actions'
        const isSorted = sort?.columnId === col.id
        const sortDirection = isSorted ? sort?.direction : null
        const isDraggable = col.id !== 'actions'
        const isDragOver = dragOverColumnId === col.id && dragColumnId !== col.id

        return (
          <TableHead
            key={col.id}
            onDragOver={(e) => handleDragOver(col.id, e)}
            onDragLeave={() => {
              if (dragOverColumnId === col.id) setDragOverColumnId(null)
            }}
            onDrop={(e) => handleDrop(col.id, e)}
            className={cn(
              'select-none font-semibold text-primary',
              col.headerClassName,
              isDragOver && 'bg-primary/10 ring-2 ring-inset ring-primary/40'
            )}
            style={{ fontWeight: 600, fontSize: '0.875rem' }}
          >
            <TableHeaderCellContent
              label={col.label}
              isDraggable={isDraggable}
              isSortable={isSortable}
              sortDirection={sortDirection}
              onSort={() => isSortable && toggleSort(col.id)}
              onDragStart={(e) => handleDragStart(col.id, e)}
              onDragEnd={clearDragState}
            />
          </TableHead>
        )
      })}
    </TableRow>
  )
}

function TableHeaderCellContent({
  label,
  isDraggable,
  isSortable,
  sortDirection,
  onSort,
  onDragStart,
  onDragEnd,
}: {
  label: string
  isDraggable: boolean
  isSortable: boolean
  sortDirection: 'asc' | 'desc' | null | undefined
  onSort: () => void
  onDragStart: (e: DragEvent) => void
  onDragEnd: () => void
}) {
  return (
    <div className="flex items-center gap-1">
      {isDraggable ? (
        <span
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          className="cursor-grab touch-none active:cursor-grabbing"
          aria-label={`Drag to reorder ${label} column`}
        >
          <GripVertical className="size-3.5 shrink-0 text-muted-foreground/70" aria-hidden />
        </span>
      ) : null}
      {isSortable ? (
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-1 text-left hover:text-foreground"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onSort()
          }}
          aria-label={`Sort by ${label}${
            sortDirection ? `, ${sortDirection === 'asc' ? 'ascending' : 'descending'}` : ''
          }`}
        >
          <span className="truncate">{label}</span>
          {sortDirection === 'asc' ? (
            <ArrowUp className="size-3.5 shrink-0" aria-hidden />
          ) : sortDirection === 'desc' ? (
            <ArrowDown className="size-3.5 shrink-0" aria-hidden />
          ) : (
            <ArrowUpDown className="size-3.5 shrink-0 opacity-40" aria-hidden />
          )}
        </button>
      ) : (
        <span className="min-w-0 truncate">{label}</span>
      )}
    </div>
  )
}
