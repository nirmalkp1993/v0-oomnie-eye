'use client'

import ColumnsIcon from '@mui/icons-material/ViewColumnOutlined'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import type { GridApi } from '@mui/x-data-grid'
import type { MutableRefObject, ReactNode } from 'react'
import { useId, useState } from 'react'
import { MultiFilterPopover, type MultiFilterColumn } from '@/components/tables/multi-filter-popover'
import { useUserManagementDataGridControls } from '@/src/hooks/use-user-management-data-grid-controls'
import { useUserManagementMultiFilter } from '@/src/hooks/use-user-management-multi-filter'

export type UserManagementTableToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder: string
  apiRef: MutableRefObject<GridApi | null>
  filterStorageKey: string
  filterableColumns: MultiFilterColumn[]
  resultCount?: number
  resultLabel?: string
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
        <TextField
          size="small"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: { xs: '100%', sm: 280 } }}
        />
        {countLabel ? (
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            {countLabel}
          </Typography>
        ) : null}
        {filtersSlot}
      </Box>

      <Box
        sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}
        role="group"
        aria-label="Table display options"
      >
        {activeFilterCount > 0 ? (
          <Button
            type="button"
            variant="text"
            size="small"
            disabled={!ready}
            onClick={clearFilters}
            startIcon={<RestartAltIcon fontSize="small" />}
            sx={{ color: 'text.secondary' }}
          >
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

        <Tooltip title="Show, hide, and reorder columns">
          <Button
            type="button"
            id={columnsButtonId}
            variant="outlined"
            size="small"
            disabled={!ready}
            aria-expanded={columnsPanelOpen}
            aria-controls={columnsPanelOpen ? columnsPanelId : undefined}
            aria-haspopup="dialog"
            onClick={toggleColumnsPanel}
            onPointerUp={(e) => {
              if (columnsPanelOpen) e.stopPropagation()
            }}
            startIcon={<ColumnsIcon fontSize="small" />}
            sx={
              columnsPanelOpen
                ? { borderColor: 'primary.main', bgcolor: 'action.selected', color: 'text.primary' }
                : undefined
            }
          >
            Columns
          </Button>
        </Tooltip>
      </Box>
    </Box>
  )
}
