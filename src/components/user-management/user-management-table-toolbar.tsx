'use client'

import { Columns3, RotateCcw, Search } from 'lucide-react'
import type { GridApi } from '@mui/x-data-grid'
import type { MutableRefObject, ReactNode } from 'react'
import { useId, useState } from 'react'
import { MultiFilterPopover, type MultiFilterColumn } from '@/components/tables/multi-filter-popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useUserManagementDataGridControls } from '@/src/hooks/use-user-management-data-grid-controls'
import { useUserManagementMultiFilter } from '@/src/hooks/use-user-management-multi-filter'

export type UserManagementTableToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder: string
  apiRef: MutableRefObject<GridApi | null>
  filterStorageKey: string
  filterableColumns: MultiFilterColumn[]
  /** Optional count label (e.g. "5 users") — matches Camera / Report toolbar */
  resultCount?: number
  resultLabel?: string
  /** Extra filters (e.g. status) rendered next to search */
  filtersSlot?: ReactNode
  className?: string
}

export function UserManagementTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  apiRef,
  filterStorageKey,
  filterableColumns,
  resultCount,
  resultLabel = 'item',
  filtersSlot,
  className,
}: UserManagementTableToolbarProps) {
  const columnsButtonId = useId()
  const columnsPanelId = useId()
  const [filterOpen, setFilterOpen] = useState(false)

  const {
    ready: gridReady,
    columnsPanelOpen,
    toggleColumnsPanel,
  } = useUserManagementDataGridControls(apiRef, {
    columnsButtonId,
    columnsPanelId,
  })

  const {
    ready: filterReady,
    filters,
    setFilters,
    clearFilters,
    activeFilterCount,
  } = useUserManagementMultiFilter(apiRef, filterStorageKey, filterableColumns)

  const ready = gridReady && filterReady

  const countLabel =
    resultCount !== undefined
      ? `${resultCount} ${resultLabel}${resultCount !== 1 ? 's' : ''}`
      : null

  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-64 border-border bg-input pl-9 text-foreground placeholder:text-muted-foreground focus:border-primary"
          />
        </div>
        {countLabel ? (
          <span className="text-sm text-muted-foreground">{countLabel}</span>
        ) : null}
        {filtersSlot ? (
          <div className="flex flex-wrap items-center gap-2">{filtersSlot}</div>
        ) : null}
      </div>

      <div
        className="flex flex-wrap items-center gap-1.5"
        role="group"
        aria-label="Table display options"
      >
        {activeFilterCount > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!ready}
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-4" />
            Clear filters
          </Button>
        ) : null}

        <MultiFilterPopover
          filters={filters}
          onFiltersChange={setFilters}
          filterableColumns={filterableColumns}
          disabled={!ready}
          open={filterOpen}
          onOpenChange={setFilterOpen}
        />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              id={columnsButtonId}
              variant="outline"
              size="sm"
              disabled={!ready}
              aria-expanded={columnsPanelOpen}
              aria-controls={columnsPanelOpen ? columnsPanelId : undefined}
              aria-haspopup="dialog"
              onClick={toggleColumnsPanel}
              onPointerUp={(e) => {
                if (columnsPanelOpen) e.stopPropagation()
              }}
              className={cn(
                'gap-2 border-border',
                columnsPanelOpen && 'border-primary bg-primary/5 text-foreground'
              )}
            >
              <Columns3 className="size-4" />
              <span>Columns</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Show, hide, and reorder columns
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
