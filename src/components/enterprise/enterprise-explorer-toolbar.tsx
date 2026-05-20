'use client'

import type { ReactNode } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import ViewListIcon from '@mui/icons-material/ViewList'
import ViewModuleIcon from '@mui/icons-material/ViewModule'
import {
  Box,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { ExplorerAppliedFiltersBarGate } from '@/components/tables/explorer-applied-filters'
import { ExplorerListTableControlsGate } from '@/components/tables/explorer-list-table-controls-gate'

export type ExplorerViewMode = 'card' | 'table'

export interface EnterpriseExplorerToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  searchPlaceholder: string
  resultCount: number
  resultLabel: string
  viewMode: ExplorerViewMode
  onViewModeChange: (mode: ExplorerViewMode) => void
  trailingActions?: ReactNode
}

export function EnterpriseExplorerToolbar({
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  resultCount,
  resultLabel,
  viewMode,
  onViewModeChange,
  trailingActions,
}: EnterpriseExplorerToolbarProps) {
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          size="small"
          value={searchQuery}
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
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
          {resultCount} {resultLabel}
          {resultCount !== 1 ? 's' : ''}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
        <ExplorerListTableControlsGate showColumns={viewMode === 'table'} />

        <ToggleButtonGroup
          exclusive
          size="small"
          value={viewMode}
          onChange={(_, next) => {
            if (next === 'card' || next === 'table') onViewModeChange(next)
          }}
          sx={{
            bgcolor: 'secondary.main',
            p: 0.5,
            borderRadius: 2,
            '& .MuiToggleButton-root': {
              border: 0,
              borderRadius: 1.5,
              px: 1,
              py: 0.75,
              color: 'text.secondary',
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.dark' },
              },
            },
          }}
        >
          <ToggleButton value="card" aria-label="Card view">
            <ViewModuleIcon sx={{ fontSize: 18 }} />
          </ToggleButton>
          <ToggleButton value="table" aria-label="Table view">
            <ViewListIcon sx={{ fontSize: 18 }} />
          </ToggleButton>
        </ToggleButtonGroup>

        {trailingActions}
      </Box>
    </Box>
    <ExplorerAppliedFiltersBarGate />
    </Box>
  )
}
