'use client'

import CloseIcon from '@mui/icons-material/Close'
import { Box, Chip, Typography } from '@mui/material'
import {
  formatExplorerFilterLabel,
  getActiveExplorerFilters,
} from '@/lib/explorer-list-table/filter-utils'
import type { ExplorerFilterItem } from '@/lib/explorer-list-table/types'

export type AppliedFiltersBarColumn = { id: string; label: string }

export type AppliedFiltersBarProps = {
  filters: ExplorerFilterItem[]
  onFiltersChange: (filters: ExplorerFilterItem[]) => void
  columns: AppliedFiltersBarColumn[]
  variant?: 'default' | 'drawings'
}

export function AppliedFiltersBar({
  filters,
  onFiltersChange,
  columns,
  variant = 'default',
}: AppliedFiltersBarProps) {
  const activeFilters = getActiveExplorerFilters(filters)
  if (activeFilters.length === 0) return null

  const isDrawings = variant === 'drawings'

  const removeFilter = (id: string) => {
    onFiltersChange(filters.filter((f) => f.id !== id))
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        minWidth: 0,
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          flexShrink: 0,
          fontWeight: 600,
          textTransform: isDrawings ? 'none' : 'uppercase',
          letterSpacing: isDrawings ? 0 : 0.4,
          fontFamily: isDrawings ? 'Roboto, sans-serif' : undefined,
          fontSize: isDrawings ? '12px' : undefined,
        }}
      >
        {isDrawings ? 'Active filters' : 'Applied filters'}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          minWidth: 0,
          gap: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
          py: 0.25,
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: 3,
            bgcolor: 'action.disabled',
          },
        }}
      >
        {activeFilters.map((f) => {
          const columnLabel = columns.find((c) => c.id === f.columnId)?.label ?? f.columnId
          return (
            <Chip
              key={f.id}
              size="small"
              label={formatExplorerFilterLabel(f, columnLabel)}
              onDelete={() => removeFilter(f.id)}
              deleteIcon={<CloseIcon sx={{ fontSize: 16 }} />}
              sx={{
                flexShrink: 0,
                maxWidth: 280,
                fontFamily: isDrawings ? 'Roboto, sans-serif' : undefined,
                fontSize: isDrawings ? '12px' : undefined,
                bgcolor: isDrawings ? 'rgba(41, 50, 229, 0.08)' : undefined,
                color: isDrawings ? '#2932E5' : undefined,
                border: isDrawings ? '1px solid #E5E7EB' : undefined,
                '& .MuiChip-deleteIcon': {
                  color: isDrawings ? '#4A5565' : undefined,
                },
                '& .MuiChip-label': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                },
              }}
            />
          )
        })}
      </Box>
    </Box>
  )
}
