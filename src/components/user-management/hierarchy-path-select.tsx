'use client'

import { useMemo, useRef, useState, type ReactNode } from 'react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  ClickAwayListener,
  InputAdornment,
  List,
  ListItemButton,
  Paper,
  Popper,
  TextField,
  Typography,
  type SxProps,
  type Theme,
} from '@mui/material'
import { SELECT_EMPTY_VALUE } from '@/src/constants/add-user'
import {
  collectNestedPathOptions,
  filterNestedPathOptions,
  type HierarchyTreeNode,
  type NestedPathOption,
} from '@/src/lib/nested-tree-path-options'

const ROW_HEIGHT = 40
const INDENT_PX = 20

function TreeConnector({ depth }: { depth: number }) {
  if (depth <= 0) return null

  return (
    <Box
      aria-hidden
      sx={{
        position: 'relative',
        width: 14,
        height: 14,
        flexShrink: 0,
        mr: 0.75,
        color: 'text.disabled',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 4,
          top: 0,
          bottom: '50%',
          width: '1px',
          bgcolor: 'currentColor',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: 4,
          top: '50%',
          width: 8,
          height: '1px',
          bgcolor: 'currentColor',
        }}
      />
    </Box>
  )
}

function TreeRow({
  node,
  depth,
  pathLabel,
  selected,
  onSelect,
}: {
  node: HierarchyTreeNode
  depth: number
  pathLabel: string
  selected: boolean
  onSelect: (label: string) => void
}) {
  return (
    <ListItemButton
      selected={selected}
      onClick={() => onSelect(pathLabel)}
      sx={{
        minHeight: ROW_HEIGHT,
        py: 0.5,
        pl: `${12 + depth * INDENT_PX}px`,
        pr: 1,
        '&.Mui-selected': {
          bgcolor: 'action.hover',
          '&:hover': { bgcolor: 'action.hover' },
        },
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <TreeConnector depth={depth} />
      <Typography
        variant="body2"
        noWrap
        sx={{
          fontWeight: depth === 0 ? 600 : 400,
          color: 'text.primary',
        }}
      >
        {node.name}
      </Typography>
    </ListItemButton>
  )
}

function renderHierarchyTree(
  nodes: HierarchyTreeNode[],
  depth: number,
  labelById: Map<string, string>,
  selectedLabel: string,
  onSelect: (label: string) => void,
): ReactNode[] {
  const rows: ReactNode[] = []

  for (const node of nodes) {
    const pathLabel = labelById.get(node.id) ?? node.name

    rows.push(
      <TreeRow
        key={node.id}
        node={node}
        depth={depth}
        pathLabel={pathLabel}
        selected={selectedLabel === pathLabel}
        onSelect={onSelect}
      />,
    )
    if (node.children?.length) {
      rows.push(...renderHierarchyTree(node.children, depth + 1, labelById, selectedLabel, onSelect))
    }
  }

  return rows
}

function resolveStoredLabel(stored: string, options: NestedPathOption[]): string {
  if (!stored || stored === SELECT_EMPTY_VALUE) return ''
  const exact = options.find((option) => option.label === stored)
  if (exact) return exact.label
  const byLeaf = options.find((option) => {
    const parts = option.label.split(' > ')
    return parts[parts.length - 1] === stored
  })
  return byLeaf?.label ?? stored
}

function formatTriggerLabel(stored: string, options: NestedPathOption[]): string {
  const resolved = resolveStoredLabel(stored, options)
  return resolved || 'Select…'
}

export function HierarchyPathSelect({
  id,
  value,
  onChange,
  tree,
  searchPlaceholder,
  emptySearchMessage,
  fieldSx,
  disabled = false,
}: {
  id?: string
  value: string
  onChange: (label: string) => void
  tree: HierarchyTreeNode[]
  searchPlaceholder: string
  emptySearchMessage: string
  fieldSx?: SxProps<Theme>
  disabled?: boolean
}) {
  const anchorRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const allOptions = useMemo(() => collectNestedPathOptions(tree), [tree])
  const labelById = useMemo(
    () => new Map(allOptions.map((option) => [option.id, option.label])),
    [allOptions],
  )
  const selectedLabel = resolveStoredLabel(value, allOptions)
  const isSearching = searchQuery.trim().length > 0
  const filteredOptions = useMemo(
    () => filterNestedPathOptions(allOptions, searchQuery),
    [allOptions, searchQuery],
  )

  const closeDropdown = () => {
    setOpen(false)
    setSearchQuery('')
  }

  const selectValue = (label: string) => {
    onChange(label)
    closeDropdown()
  }

  const clearSelection = () => {
    onChange(SELECT_EMPTY_VALUE)
    closeDropdown()
  }

  return (
    <Box ref={anchorRef}>
      <TextField
        id={id}
        fullWidth
        disabled={disabled}
        value={formatTriggerLabel(value, allOptions)}
        onClick={() => {
          if (!disabled) setOpen(true)
        }}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <KeyboardArrowDownIcon
              sx={{
                color: 'action.active',
                transform: open ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            />
          ),
          sx: { cursor: 'pointer' },
        }}
        inputProps={{
          style: {
            cursor: 'pointer',
            color: selectedLabel ? undefined : 'inherit',
          },
        }}
        sx={[
          fieldSx,
          !selectedLabel && {
            '& .MuiInputBase-input': { color: 'text.secondary' },
          },
        ]}
      />

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        sx={{ zIndex: (theme) => theme.zIndex.modal + 2, width: anchorRef.current?.clientWidth }}
      >
        <ClickAwayListener onClickAway={closeDropdown}>
          <Paper
            elevation={4}
            sx={{
              mt: 0.5,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 360,
            }}
          >
            <Box
              sx={{
                p: 1,
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <TextField
                size="small"
                fullWidth
                autoFocus
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ overflowY: 'auto', maxHeight: 300 }}>
              <List dense disablePadding>
                {!isSearching ? (
                  <>
                    <ListItemButton
                      selected={!selectedLabel}
                      onClick={clearSelection}
                      sx={{
                        minHeight: ROW_HEIGHT,
                        py: 0.5,
                        px: 1.5,
                        '&.Mui-selected': {
                          bgcolor: 'action.hover',
                          '&:hover': { bgcolor: 'action.hover' },
                        },
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Typography variant="body2" fontStyle="italic" color="text.secondary">
                        Select…
                      </Typography>
                    </ListItemButton>
                    {renderHierarchyTree(tree, 0, labelById, selectedLabel, selectValue)}
                  </>
                ) : filteredOptions.length === 0 ? (
                  <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {emptySearchMessage}
                    </Typography>
                  </Box>
                ) : (
                  filteredOptions.map((option) => (
                    <ListItemButton
                      key={option.id}
                      selected={selectedLabel === option.label}
                      onClick={() => selectValue(option.label)}
                      sx={{
                        minHeight: ROW_HEIGHT,
                        py: 0.5,
                        px: 1.5,
                        '&.Mui-selected': {
                          bgcolor: 'action.hover',
                          '&:hover': { bgcolor: 'action.hover' },
                        },
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Typography variant="body2" noWrap>
                        {option.label}
                      </Typography>
                    </ListItemButton>
                  ))
                )}
              </List>
            </Box>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  )
}
