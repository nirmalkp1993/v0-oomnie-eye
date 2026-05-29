'use client'

import RestartAltIcon from '@mui/icons-material/RestartAlt'
import ViewColumnIcon from '@mui/icons-material/ViewColumn'
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Popover,
  Typography,
} from '@mui/material'
import { Columns3, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { MultiFilterPopover } from '@/components/tables/multi-filter-popover'
import { Button as ShadcnButton } from '@/components/ui/button'
import { Checkbox as ShadcnCheckbox } from '@/components/ui/checkbox'
import { Popover as ShadcnPopover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useExplorerListTable } from '@/components/tables/explorer-list-table-context'
import { countActiveExplorerFilters } from '@/lib/explorer-list-table/filter-utils'
import {
  MY_DRAWINGS_TABLE,
  myDrawingsToolbarOutlineButtonSx,
} from '@/src/components/tables/my-drawings-table-styles'

export function ExplorerListTableControls({
  className,
  showColumns = true,
  variant = 'default',
}: {
  className?: string
  showColumns?: boolean
  variant?: 'default' | 'drawings'
}) {
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
  const [columnsAnchor, setColumnsAnchor] = useState<HTMLElement | null>(null)

  const activeFilterCount = countActiveExplorerFilters(filters)
  const visibleCount = columns.filter((c) => visibility[c.id] !== false).length
  const hideableColumns = columns.filter((c) => c.hideable !== false)
  const isDrawings = variant === 'drawings'

  if (isDrawings) {
    return (
      <Box
        className={className}
        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        role="group"
        aria-label="Table display options"
      >
        {activeFilterCount > 0 ? (
          <Button
            size="small"
            variant="outlined"
            onClick={clearFilters}
            startIcon={<RestartAltIcon sx={{ fontSize: 18 }} />}
            sx={myDrawingsToolbarOutlineButtonSx}
          >
            Clear
          </Button>
        ) : null}

        <MultiFilterPopover
          variant="drawings"
          filters={filters}
          onFiltersChange={setFilters}
          filterableColumns={filterableColumns.map((c) => ({ id: c.id, label: c.label }))}
          open={filterOpen}
          onOpenChange={setFilterOpen}
        />

        {showColumns ? (
          <>
            <Badge
              badgeContent={visibleCount < columns.length ? columns.length - visibleCount : 0}
              invisible={visibleCount === columns.length}
              sx={{
                '& .MuiBadge-badge': {
                  height: 18,
                  minWidth: 18,
                  fontSize: '10px',
                  fontWeight: 600,
                  bgcolor: MY_DRAWINGS_TABLE.accent,
                  right: 4,
                  top: 4,
                },
              }}
            >
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => setColumnsAnchor(e.currentTarget)}
                startIcon={<ViewColumnIcon sx={{ fontSize: 18 }} />}
                sx={{
                  ...myDrawingsToolbarOutlineButtonSx,
                  ...(Boolean(columnsAnchor) && {
                    borderColor: MY_DRAWINGS_TABLE.accent,
                    bgcolor: 'rgba(41, 50, 229, 0.06)',
                    color: MY_DRAWINGS_TABLE.accent,
                  }),
                }}
              >
                Columns
              </Button>
            </Badge>
            <Popover
              open={Boolean(columnsAnchor)}
              anchorEl={columnsAnchor}
              onClose={() => setColumnsAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{
                paper: {
                  sx: {
                    width: 288,
                    borderRadius: '12px',
                    border: `1px solid ${MY_DRAWINGS_TABLE.border}`,
                    boxShadow: '0px 4px 24px rgba(15, 23, 42, 0.12)',
                    fontFamily: 'Roboto, sans-serif',
                  },
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${MY_DRAWINGS_TABLE.border}` }}>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#212121' }}>
                  Manage columns
                </Typography>
                <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
                  {visibleCount} of {columns.length} visible
                </Typography>
              </Box>
              <Box sx={{ maxHeight: 320, overflowY: 'auto', p: 1 }}>
                {hideableColumns.map((col) => {
                  const checked = visibility[col.id] !== false
                  return (
                    <FormControlLabel
                      key={col.id}
                      sx={{ display: 'flex', mx: 0, px: 1, py: 0.25, width: '100%' }}
                      control={
                        <Checkbox
                          size="small"
                          checked={checked}
                          onChange={(e) => setColumnVisible(col.id, e.target.checked)}
                          sx={{
                            color: MY_DRAWINGS_TABLE.border,
                            '&.Mui-checked': { color: MY_DRAWINGS_TABLE.accent },
                          }}
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: '14px', fontFamily: 'Roboto, sans-serif' }}>
                          {col.label}
                        </Typography>
                      }
                    />
                  )
                })}
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, py: 1.5 }}>
                <Button
                  size="small"
                  onClick={resetColumns}
                  sx={{
                    textTransform: 'none',
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '14px',
                    color: MY_DRAWINGS_TABLE.accent,
                  }}
                >
                  Reset to default
                </Button>
              </Box>
            </Popover>
          </>
        ) : null}
      </Box>
    )
  }

  return (
    <div
      className={cn('flex flex-wrap items-center gap-1.5', className)}
      role="group"
      aria-label="Table display options"
    >
      {activeFilterCount > 0 ? (
        <ShadcnButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-4" />
          Clear filters
        </ShadcnButton>
      ) : null}

      <MultiFilterPopover
        filters={filters}
        onFiltersChange={setFilters}
        filterableColumns={filterableColumns.map((c) => ({ id: c.id, label: c.label }))}
        open={filterOpen}
        onOpenChange={setFilterOpen}
      />

      {showColumns ? (
        <ShadcnPopover open={columnsOpen} onOpenChange={setColumnsOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <ShadcnButton
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    'gap-2 border-border',
                    columnsOpen && 'border-primary bg-primary/5 text-foreground',
                  )}
                >
                  <Columns3 className="size-4" />
                  <span>Columns</span>
                </ShadcnButton>
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
                    <ShadcnCheckbox
                      checked={checked}
                      onCheckedChange={(v) => setColumnVisible(col.id, v === true)}
                    />
                    <span className="text-sm text-foreground">{col.label}</span>
                  </label>
                )
              })}
            </div>
            <Separator />
            <div className="flex justify-end px-4 py-3">
              <ShadcnButton type="button" variant="ghost" size="sm" onClick={resetColumns}>
                Reset to default
              </ShadcnButton>
            </div>
          </PopoverContent>
        </ShadcnPopover>
      ) : null}
    </div>
  )
}
