'use client'

import { Columns3, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { MultiFilterPopover } from '@/components/tables/multi-filter-popover'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useExplorerListTable } from '@/components/tables/explorer-list-table-context'
import { countActiveExplorerFilters } from '@/lib/explorer-list-table/filter-utils'

export function ExplorerListTableControls({ className }: { className?: string }) {
  const {
    columns,
    visibility,
    filters,
    setFilters,
    clearFilters,
    setColumnVisible,
    resetColumns,
    filterableColumns,
  } = useExplorerListTable()

  const [filterOpen, setFilterOpen] = useState(false)
  const [columnsOpen, setColumnsOpen] = useState(false)

  const activeFilterCount = countActiveExplorerFilters(filters)
  const visibleCount = columns.filter((c) => visibility[c.id] !== false).length
  const hideableColumns = columns.filter((c) => c.hideable !== false)

  return (
    <div
      className={cn('flex flex-wrap items-center gap-1.5', className)}
      role="group"
      aria-label="Table display options"
    >
      {activeFilterCount > 0 ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
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
        filterableColumns={filterableColumns.map((c) => ({ id: c.id, label: c.label }))}
        open={filterOpen}
        onOpenChange={setFilterOpen}
      />

      <Popover open={columnsOpen} onOpenChange={setColumnsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  'gap-2 border-border',
                  columnsOpen && 'border-primary bg-primary/5 text-foreground'
                )}
              >
                <Columns3 className="size-4" />
                <span>Columns</span>
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Show, hide, and reorder columns</TooltipContent>
        </Tooltip>
        <PopoverContent align="end" side="bottom" sideOffset={8} className="w-72 p-0">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Manage columns</p>
            <p className="text-xs text-muted-foreground">
              {visibleCount} of {columns.length} visible
            </p>
          </div>
          <div className="max-h-[min(50vh,320px)] space-y-1 overflow-y-auto p-2">
            {hideableColumns.map((col) => {
              const checked = visibility[col.id] !== false
              return (
                <label
                  key={col.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/80"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(v) => setColumnVisible(col.id, v === true)}
                  />
                  <span className="text-sm text-foreground">{col.label}</span>
                </label>
              )
            })}
            {columns
              .filter((c) => c.hideable === false)
              .map((col) => (
                <div
                  key={col.id}
                  className="flex items-center gap-3 rounded-md px-2 py-2 opacity-60"
                >
                  <Checkbox checked disabled />
                  <span className="text-sm text-foreground">{col.label}</span>
                </div>
              ))}
          </div>
          <Separator />
          <div className="flex justify-end px-4 py-3">
            <Button type="button" variant="ghost" size="sm" onClick={resetColumns}>
              Reset to default
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
