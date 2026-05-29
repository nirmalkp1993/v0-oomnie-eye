'use client'

import FilterListIcon from '@mui/icons-material/FilterList'
import { Box, Button as MuiButton, Tooltip } from '@mui/material'
import { ListFilter, Plus, Trash2 } from 'lucide-react'
import { Badge as ShadcnBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip as ShadcnTooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { countActiveExplorerFilters, createEmptyExplorerFilter } from '@/lib/explorer-list-table/filter-utils'
import {
  EXPLORER_FILTER_OPERATORS,
  type ExplorerFilterItem,
} from '@/lib/explorer-list-table/types'
import {
  MY_DRAWINGS_TABLE,
  myDrawingsToolbarOutlineButtonSx,
} from '@/src/components/tables/my-drawings-table-styles'

export type MultiFilterColumn = { id: string; label: string }

export type MultiFilterPopoverProps = {
  filters: ExplorerFilterItem[]
  onFiltersChange: (filters: ExplorerFilterItem[]) => void
  filterableColumns: MultiFilterColumn[]
  disabled?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  variant?: 'default' | 'drawings'
}

export function MultiFilterPopover({
  filters,
  onFiltersChange,
  filterableColumns,
  disabled = false,
  open,
  onOpenChange,
  variant = 'default',
}: MultiFilterPopoverProps) {
  const activeFilterCount = countActiveExplorerFilters(filters)
  const isDrawings = variant === 'drawings'

  const updateFilter = (id: string, patch: Partial<ExplorerFilterItem>) => {
    onFiltersChange(filters.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  }

  const addFilter = () => {
    const firstCol = filterableColumns[0]?.id ?? ''
    onFiltersChange([...filters, { ...createEmptyExplorerFilter(), columnId: firstCol }])
  }

  const removeFilter = (id: string) => {
    onFiltersChange(filters.filter((f) => f.id !== id))
  }

  const clearFilters = () => onFiltersChange([])

  const triggerButton = (
    <ShadcnTooltip>
      <TooltipTrigger asChild>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            className={cn(
              'gap-2 border-border',
              open && 'border-primary bg-primary/5 text-foreground',
            )}
          >
            <ListFilter className="size-4" />
            <span>Filter</span>
            {activeFilterCount > 0 ? (
              <ShadcnBadge
                variant="default"
                className="h-5 min-w-5 justify-center px-1.5 text-[10px] font-semibold"
              >
                {activeFilterCount}
              </ShadcnBadge>
            ) : null}
          </Button>
        </PopoverTrigger>
      </TooltipTrigger>
      <TooltipContent side="bottom">Filter rows by any column</TooltipContent>
    </ShadcnTooltip>
  )

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      {isDrawings ? (
        <Tooltip title="Filter rows by any column" arrow placement="bottom">
          <Box component="span" sx={{ display: 'inline-flex' }}>
            <PopoverTrigger asChild>
              <MuiButton
                size="small"
                variant="outlined"
                disabled={disabled}
                startIcon={<FilterListIcon sx={{ fontSize: 18 }} />}
                sx={{
                  ...myDrawingsToolbarOutlineButtonSx,
                  ...(open && {
                    borderColor: MY_DRAWINGS_TABLE.accent,
                    bgcolor: 'rgba(41, 50, 229, 0.06)',
                    color: MY_DRAWINGS_TABLE.accent,
                  }),
                }}
              >
                Filter
                {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </MuiButton>
            </PopoverTrigger>
          </Box>
        </Tooltip>
      ) : (
        triggerButton
      )}
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className={cn(
          'w-[min(100vw-2rem,420px)] p-0',
          isDrawings && 'rounded-xl border-[#E5E7EB] font-[Roboto] shadow-[0px_4px_24px_rgba(15,23,42,0.12)]',
        )}
      >
        <div
          className={cn(
            'border-b px-4 py-3',
            isDrawings ? 'border-[#E5E7EB]' : 'border-border',
          )}
        >
          <p className={cn('text-sm font-semibold', isDrawings ? 'text-[#212121]' : 'text-foreground')}>
            Filters
          </p>
          <p className={cn('text-xs', isDrawings ? 'text-[#6b7280]' : 'text-muted-foreground')}>
            All rules must match (AND).
          </p>
        </div>
        <div className="max-h-[min(60vh,360px)] space-y-3 overflow-y-auto p-4">
          {filters.length === 0 ? (
            <p className="text-sm text-muted-foreground">No filters applied. Add a rule to narrow rows.</p>
          ) : (
            filters.map((f) => (
              <div
                key={f.id}
                className="grid gap-2 rounded-md border border-border bg-muted/20 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
              >
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Column</Label>
                  <Select
                    value={f.columnId}
                    onValueChange={(v) => updateFilter(f.id, { columnId: v })}
                  >
                    <SelectTrigger className="h-8 border-border bg-input text-xs">
                      <SelectValue placeholder="Column" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterableColumns.map((col) => (
                        <SelectItem key={col.id} value={col.id}>
                          {col.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Operator</Label>
                  <Select
                    value={f.operator}
                    onValueChange={(v) =>
                      updateFilter(f.id, {
                        operator: v as ExplorerFilterItem['operator'],
                      })
                    }
                  >
                    <SelectTrigger className="h-8 border-border bg-input text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPLORER_FILTER_OPERATORS.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Value</Label>
                  <Input
                    value={f.value}
                    onChange={(e) => updateFilter(f.id, { value: e.target.value })}
                    disabled={f.operator === 'isEmpty' || f.operator === 'isNotEmpty'}
                    placeholder="Value…"
                    className="h-8 border-border bg-input text-xs"
                  />
                </div>
                <div className="flex items-end sm:pb-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove filter"
                    onClick={() => removeFilter(f.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 border-border"
            onClick={addFilter}
          >
            <Plus className="size-4" />
            Add filter
          </Button>
          {activeFilterCount > 0 ? (
            <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  )
}
