'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import ClearIcon from '@mui/icons-material/Clear'
import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { HierarchyFlowChart } from '@/src/components/org-chart/hierarchy-flow-chart'
import type { OrgChartTreeNode } from '@/src/components/org-chart/hierarchy-flow-types'
import {
  collectAllOrgChartIds,
  collectOrgChartIdsWithChildren,
  countOrgChartSearchMatches,
  filterOrgChartHierarchy,
  normalizeOrgChartNodes,
} from '@/src/lib/hierarchy-tree-display.utils'
import type { HierarchyTreeNode } from '@/src/lib/nested-tree-path-options'

const outlineFieldSx = {
  '& .MuiOutlinedInput-root': { borderRadius: 2 },
} as const

export interface HierarchyManageTreePanelProps {
  nodes: HierarchyTreeNode[]
  entityLabel: string
  childLabelSingular?: string
  childLabelPlural?: string
  selectedId?: string | null
  onSelect?: (node: OrgChartTreeNode) => void
  onEdit?: (node: OrgChartTreeNode) => void
  onDelete?: (node: OrgChartTreeNode) => void
  onAddChild?: (node: OrgChartTreeNode) => void
  emptyMessage?: string
  diagramHint?: string
}

export function HierarchyManageTreePanel({
  nodes,
  entityLabel,
  childLabelSingular = '1 child',
  childLabelPlural = '{count} children',
  selectedId = null,
  onSelect,
  onEdit,
  onDelete,
  onAddChild,
  emptyMessage,
  diagramHint = 'Pan and zoom the diagram. Hover a card for actions.',
}: HierarchyManageTreePanelProps) {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())

  const chartNodes = useMemo(() => normalizeOrgChartNodes(nodes), [nodes])
  const trimmedQuery = search.trim()
  const isSearching = trimmedQuery.length > 0

  const filteredNodes = useMemo(
    () => (isSearching ? filterOrgChartHierarchy(chartNodes, trimmedQuery) : chartNodes),
    [chartNodes, isSearching, trimmedQuery],
  )

  const expandableIds = useMemo(() => collectOrgChartIdsWithChildren(chartNodes), [chartNodes])

  useEffect(() => {
    if (isSearching) {
      setExpanded(new Set(collectAllOrgChartIds(filteredNodes)))
      return
    }
    setExpanded(new Set(collectOrgChartIdsWithChildren(chartNodes)))
  }, [chartNodes, expandableIds, filteredNodes, isSearching])

  const onToggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const matchCount = useMemo(
    () => (isSearching ? countOrgChartSearchMatches(filteredNodes, trimmedQuery) : 0),
    [filteredNodes, isSearching, trimmedQuery],
  )

  const hasNoData = chartNodes.length === 0
  const noMatches = isSearching && filteredNodes.length === 0

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <TextField
          size="small"
          fullWidth
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={`Search ${entityLabel}...`}
          sx={outlineFieldSx}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  aria-label="Clear search"
                  onClick={() => setSearch('')}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
          {isSearching
            ? noMatches
              ? `No ${entityLabel} match "${trimmedQuery}".`
              : `${matchCount} match${matchCount === 1 ? '' : 'es'} for "${trimmedQuery}".`
            : diagramHint}
        </Typography>
      </Box>

      <Box sx={{ height: 420, minHeight: 420, width: '100%', overflow: 'hidden', p: 1, position: 'relative' }}>
        {hasNoData ? (
          <Stack sx={{ py: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {emptyMessage ?? `No ${entityLabel} yet.`}
            </Typography>
          </Stack>
        ) : noMatches ? (
          <Stack sx={{ py: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">Try a different search term.</Typography>
          </Stack>
        ) : (
          <Box sx={{ position: 'absolute', inset: 8 }}>
            <HierarchyFlowChart
              roots={filteredNodes}
              highlight={trimmedQuery}
              ariaLabel={`${entityLabel} hierarchy`}
              selectedId={selectedId}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              allowEdit={Boolean(onEdit)}
              allowDelete={Boolean(onDelete)}
              allowCreate={Boolean(onAddChild)}
              childLabelSingular={childLabelSingular}
              childLabelPlural={childLabelPlural}
            />
          </Box>
        )}
      </Box>
    </Paper>
  )
}
