'use client'

import type { ReactNode } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import ViewListIcon from '@mui/icons-material/ViewList'
import ViewModuleIcon from '@mui/icons-material/ViewModule'
import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { ExplorerAppliedFiltersBarGate } from '@/components/tables/explorer-applied-filters'
import { ExplorerListTableControlsGate } from '@/components/tables/explorer-list-table-controls-gate'
import {
  MY_DRAWINGS_TABLE,
  myDrawingsSearchFieldSx,
  myDrawingsToolbarRowSx,
  myDrawingsToolbarShellSx,
  myDrawingsViewToggleSx,
} from '@/src/components/tables/my-drawings-table-styles'

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
  /** `drawings` matches dt_timemachine My Drawings toolbar chrome */
  variant?: 'default' | 'drawings'
  /** Shown on the left after search (e.g. expand/collapse) when variant is drawings */
  leadingToolbarActions?: ReactNode
  /** When false, hides list/card view toggle (e.g. dedicated multi-panel layouts). */
  showViewModeToggle?: boolean
  /** Column picker and filter controls (defaults to list/table view visibility). */
  showTableControls?: boolean
  /** `card` = compact toolbar inside a panel header (camera group tree). */
  layout?: 'page' | 'card'
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
  variant = 'default',
  leadingToolbarActions,
  showViewModeToggle = true,
  showTableControls,
  layout = 'page',
}: EnterpriseExplorerToolbarProps) {
  const tableControlsVisible = showTableControls ?? (showViewModeToggle && viewMode === 'table')
  const isDrawings = variant === 'drawings'
  const isCardLayout = layout === 'card'

  const searchField = (
    <TextField
      size="small"
      value={searchQuery}
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder={searchPlaceholder}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: isDrawings ? '#4A5565' : 'text.secondary' }} />
            </InputAdornment>
          ),
          endAdornment:
            isDrawings && searchQuery ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search"
                  sx={{ p: '4px' }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : undefined,
        },
      }}
      sx={
        isCardLayout
          ? {
              ...myDrawingsSearchFieldSx,
              flex: 1,
              minWidth: 120,
              width: 'auto',
            }
          : isDrawings
            ? myDrawingsSearchFieldSx
            : { width: { xs: '100%', sm: 280 } }
      }
    />
  )

  const viewToggle = (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={viewMode}
      onChange={(_, next) => {
        if (next === 'card' || next === 'table') onViewModeChange(next)
      }}
      aria-label="Toggle view mode"
      sx={
        isDrawings
          ? myDrawingsViewToggleSx
          : {
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
            }
      }
    >
      <ToggleButton value="table" aria-label="Table view" title="List view">
        <ViewListIcon fontSize="small" />
      </ToggleButton>
      <ToggleButton value="card" aria-label="Card view" title="Grid view">
        <ViewModuleIcon fontSize="small" />
      </ToggleButton>
    </ToggleButtonGroup>
  )

  const toolbarControlsInner = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flex: 1,
        minWidth: 0,
        flexWrap: isCardLayout ? 'wrap' : 'nowrap',
      }}
    >
      {searchField}
      {leadingToolbarActions}
      <ExplorerListTableControlsGate
        showColumns={tableControlsVisible}
        variant={isDrawings ? 'drawings' : undefined}
      />
      {showViewModeToggle ? viewToggle : null}
    </Box>
  )

  if (isDrawings && isCardLayout) {
    if (tableControlsVisible) {
      return (
        <Box
          sx={{
            flexShrink: 0,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              ...myDrawingsToolbarRowSx,
              flexWrap: 'wrap',
              rowGap: 1,
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
              {searchField}
              {leadingToolbarActions}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
              <ExplorerListTableControlsGate showColumns variant="drawings" />
              {showViewModeToggle ? viewToggle : null}
              {trailingActions}
            </Box>
          </Box>
          <Box sx={{ ...myDrawingsToolbarRowSx, py: 0.5, minHeight: 0, borderTop: 0 }}>
            <ExplorerAppliedFiltersBarGate variant="drawings" />
          </Box>
        </Box>
      )
    }

    return (
      <Box
        sx={{
          flexShrink: 0,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          px: 2,
          py: 0.75,
          minHeight: `${MY_DRAWINGS_TABLE.rowHeight}px`,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: 'nowrap',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
          {searchField}
          {leadingToolbarActions}
        </Box>
        {trailingActions ? (
          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{trailingActions}</Box>
        ) : null}
      </Box>
    )
  }

  if (isDrawings) {
    return (
      <Box sx={myDrawingsToolbarShellSx}>
        <Box sx={myDrawingsToolbarRowSx}>
          {toolbarControlsInner}
          {trailingActions ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
              {trailingActions}
            </Box>
          ) : null}
        </Box>
        <Box sx={{ ...myDrawingsToolbarRowSx, py: 0.5, minHeight: 0, borderTop: 0 }}>
          <ExplorerAppliedFiltersBarGate variant="drawings" />
        </Box>
      </Box>
    )
  }

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
          {searchField}
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            {resultCount} {resultLabel}
            {resultCount !== 1 ? 's' : ''}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
          <ExplorerListTableControlsGate showColumns={viewMode === 'table'} />
          {viewToggle}
          {trailingActions}
        </Box>
      </Box>
      <ExplorerAppliedFiltersBarGate />
    </Box>
  )
}
