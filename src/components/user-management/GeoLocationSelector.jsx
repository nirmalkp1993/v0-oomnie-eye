'use client'

import ClearIcon from '@mui/icons-material/Clear'
import PlaceOutlined from '@mui/icons-material/PlaceOutlined'
import PublicOutlined from '@mui/icons-material/PublicOutlined'
import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView'
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { MOCK_GEO_DATA } from '@/src/mock-data/mockGeoData'
import { filterGeoEntries, flattenGeoTree } from '@/src/utils/flattenGeoTree'

const DEBOUNCE_MS = 300
const PANEL_MAX_HEIGHT = 280

const scrollSx = {
  maxHeight: PANEL_MAX_HEIGHT,
  overflow: 'auto',
  scrollbarWidth: 'thin',
  scrollbarColor: (t) => `${alpha(t.palette.text.primary, 0.28)} transparent`,
  '&::-webkit-scrollbar': { width: 6 },
  '&::-webkit-scrollbar-thumb': {
    borderRadius: 8,
    bgcolor: (t) => alpha(t.palette.text.primary, 0.22),
  },
  '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
}

const GeoTreeBranch = memo(function GeoTreeBranch({ node, selectedIds, highlightedId, onToggle }) {
  const theme = useTheme()
  const selected = selectedIds.has(node.id)
  const highlighted = highlightedId === node.id
  const isLeaf = !node.children?.length
  const isWorld = node.id === 'world'

  return (
    <TreeItem
      itemId={node.id}
      onClick={(e) => {
        if ((e.target).closest(`.${treeItemClasses.iconContainer}`)) return
        onToggle(node.id)
      }}
      label={
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{
            py: 0.35,
            px: 0.75,
            mx: -0.75,
            borderRadius: 1,
            flex: 1,
            minWidth: 0,
            bgcolor: selected
              ? alpha(theme.palette.primary.main, 0.16)
              : highlighted
                ? alpha(theme.palette.primary.main, 0.08)
                : 'transparent',
            outline: highlighted ? `1px solid ${alpha(theme.palette.primary.main, 0.45)}` : 'none',
          }}
        >
          {isWorld ? <PublicOutlined sx={{ fontSize: 17, color: 'text.secondary', flexShrink: 0 }} /> : null}
          {isLeaf ? <PlaceOutlined sx={{ fontSize: 17, color: 'error.main', opacity: 0.85, flexShrink: 0 }} /> : null}
          <Typography variant="body2" fontWeight={node.children?.length ? 600 : 500} noWrap>
            {node.name}
          </Typography>
        </Stack>
      }
    >
      {node.children?.map((child) => (
        <GeoTreeBranch
          key={child.id}
          node={child}
          selectedIds={selectedIds}
          highlightedId={highlightedId}
          onToggle={onToggle}
        />
      ))}
    </TreeItem>
  )
})

/**
 * Hierarchical, searchable, multi-select geo location picker for user access assignment.
 */
/**
 * @param {{ selectedIds: Set<string>, onChange: (updater: Set<string> | ((prev: Set<string>) => Set<string>)) => void, root?: import('@/src/mock-data/mockGeoData').GeoTreeNode, onLocationFocus?: (location: { id: string, name: string }) => void, showHeader?: boolean, titleClassName?: string }} props
 */
export function GeoLocationSelector({
  selectedIds,
  onChange,
  root = MOCK_GEO_DATA,
  onLocationFocus,
  showHeader = true,
  titleClassName = 'text-accent',
}) {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [expandedItems, setExpandedItems] = useState(['world', 'asia', 'india'])
  const [highlightedId, setHighlightedId] = useState(null)

  const flatEntries = useMemo(() => flattenGeoTree(root), [root])

  const labelById = useMemo(() => {
    const map = new Map()
    for (const entry of flatEntries) map.set(entry.id, entry.name)
    return map
  }, [flatEntries])

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(searchInput), DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const searchResults = useMemo(
    () => filterGeoEntries(flatEntries, debouncedQuery),
    [flatEntries, debouncedQuery]
  )

  const showSearchResults = debouncedQuery.trim().length > 0

  const emitFocus = useCallback(
    (id) => {
      const name = labelById.get(id)
      if (name && onLocationFocus) onLocationFocus({ id, name })
    },
    [labelById, onLocationFocus]
  )

  const onToggle = useCallback(
    (id) => {
      setHighlightedId(id)
      emitFocus(id)
      onChange((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
    },
    [onChange, emitFocus]
  )

  const handleSearchSelect = useCallback(
    (entry) => {
      setExpandedItems(entry.pathIds)
      setHighlightedId(entry.id)
      if (onLocationFocus) onLocationFocus({ id: entry.id, name: entry.name })
      onChange((prev) => {
        if (prev.has(entry.id)) return prev
        const next = new Set(prev)
        next.add(entry.id)
        return next
      })
      setSearchInput('')
      setDebouncedQuery('')
    },
    [onChange, onLocationFocus]
  )

  const handleClearSearch = useCallback(() => {
    setSearchInput('')
    setDebouncedQuery('')
  }, [])

  return (
    <Stack spacing={1.25}>
      {showHeader ? (
        <>
          <Stack direction="row" alignItems="center" flexWrap="wrap" gap={0.75} useFlexGap>
            <span className={`shrink-0 text-sm font-medium ${titleClassName}`}>Location access</span>
            {[...selectedIds].map((id) => {
              const label = labelById.get(id)
              if (!label) return null
              return (
                <Chip
                  key={id}
                  size="small"
                  color="primary"
                  variant="filled"
                  label={label}
                  onDelete={() => {
                    onChange((prev) => {
                      const next = new Set(prev)
                      next.delete(id)
                      return next
                    })
                  }}
                />
              )
            })}
          </Stack>

          <Typography variant="caption" className="text-muted-foreground" sx={{ color: 'inherit' }}>
            Search globally or browse the tree. Select countries, regions, or cities; choices appear as tags above.
          </Typography>
        </>
      ) : null}

      <Box
        sx={{
          borderRadius: 2,
          border: (t) => `1px solid ${t.palette.divider}`,
          bgcolor: 'background.paper',
          boxShadow: (t) => `0 4px 14px ${alpha(t.palette.common.black, 0.06)}`,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            px: 1.25,
            py: 1,
            bgcolor: 'background.paper',
            borderBottom: (t) => `1px solid ${t.palette.divider}`,
          }}
        >
          <TextField
            size="small"
            fullWidth
            placeholder="Search continents, countries, states, cities…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchInput ? (
                  <InputAdornment position="end">
                    <IconButton size="small" aria-label="Clear search" onClick={handleClearSearch} edge="end">
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 1.5, bgcolor: (t) => alpha(t.palette.action.hover, 0.35) },
            }}
          />
        </Box>

        {showSearchResults ? (
          <Box sx={scrollSx}>
            {searchResults.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 3, px: 2, textAlign: 'center' }}>
                No locations found
              </Typography>
            ) : (
              <List dense disablePadding>
                {searchResults.map((entry) => (
                  <ListItemButton
                    key={entry.id}
                    onClick={() => handleSearchSelect(entry)}
                    sx={{
                      py: 0.85,
                      px: 1.5,
                      '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.06) },
                    }}
                  >
                    <ListItemText
                      primary={entry.name}
                      secondary={entry.fullPath}
                      slotProps={{
                        primary: { variant: 'body2', fontWeight: 600 },
                        secondary: { variant: 'caption', color: 'text.secondary' },
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Box>
        ) : (
          <Box sx={{ ...scrollSx, p: 1 }}>
            <SimpleTreeView
              expandedItems={expandedItems}
              onExpandedItemsChange={(_e, ids) => setExpandedItems(ids)}
              disableSelection
              expansionTrigger="iconContainer"
              sx={{ userSelect: 'none' }}
            >
              <GeoTreeBranch
                node={root}
                selectedIds={selectedIds}
                highlightedId={highlightedId}
                onToggle={onToggle}
              />
            </SimpleTreeView>
          </Box>
        )}
      </Box>
    </Stack>
  )
}
