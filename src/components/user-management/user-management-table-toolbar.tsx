'use client'

import SearchIcon from '@mui/icons-material/Search'
import { Box, InputAdornment, TextField, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { ExplorerAppliedFiltersBarGate } from '@/components/tables/explorer-applied-filters'
import { ExplorerListTableControlsGate } from '@/components/tables/explorer-list-table-controls-gate'

export type UserManagementTableToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder: string
  resultCount?: number
  resultLabel?: string
  filtersSlot?: ReactNode
}

export function UserManagementTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  resultCount,
  resultLabel = 'item',
  filtersSlot,
}: UserManagementTableToolbarProps) {
  const countLabel =
    resultCount !== undefined
      ? `${resultCount} ${resultLabel}${resultCount !== 1 ? 's' : ''}`
      : null

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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

        <ExplorerListTableControlsGate />
      </Box>
      <ExplorerAppliedFiltersBarGate />
    </Box>
  )
}
