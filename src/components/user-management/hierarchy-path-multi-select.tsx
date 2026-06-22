'use client'

import { useMemo, useRef, useState, type ReactNode } from 'react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  Checkbox,
  ClickAwayListener,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Popper,
  TextField,
  Typography,
  type SxProps,
  type Theme,
} from '@mui/material'
import {
  formatHierarchyMultiTriggerLabel,
  resolveStoredLabels,
} from '@/src/lib/hierarchy-path.utils'
import {
  collectNestedPathOptions,
  filterNestedPathOptions,
  type HierarchyTreeNode,
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
  onToggle,
}: {
  node: HierarchyTreeNode
  depth: number
  pathLabel: string
  selected: boolean
  onToggle: (label: string) => void
}) {
  return (
    <ListItemButton
      selected={selected}
      onClick={() => onToggle(pathLabel)}
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
      <ListItemIcon sx={{ minWidth: 32 }}>
        <Checkbox edge="start" checked={selected} tabIndex={-1} disableRipple size="small" />
      </ListItemIcon>
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
  selectedLabels: string[],
  onToggle: (label: string) => void,
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
        selected={selectedLabels.includes(pathLabel)}
        onToggle={onToggle}
      />,
    )
    if (node.children?.length) {
      rows.push(...renderHierarchyTree(node.children, depth + 1, labelById, selectedLabels, onToggle))
    }
  }

  return rows
}

export function HierarchyPathMultiSelect({
  id,
  value,
  onChange,
  tree,
  searchPlaceholder,
  emptySearchMessage,
  fieldSx,
  disabled = false,
  dropdownZIndex,
}: {
  id?: string
  value: string[]
  onChange: (labels: string[]) => void
  tree: HierarchyTreeNode[]
  searchPlaceholder: string
  emptySearchMessage: string
  fieldSx?: SxProps<Theme>
  disabled?: boolean
  dropdownZIndex?: number
}) {
  const anchorRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const allOptions = useMemo(() => collectNestedPathOptions(tree), [tree])
  const labelById = useMemo(
    () => new Map(allOptions.map((option) => [option.id, option.label])),
    [allOptions],
  )
  const selectedLabels = useMemo(
    () => resolveStoredLabels(value, allOptions),
    [allOptions, value],
  )
  const isSearching = searchQuery.trim().length > 0
  const filteredOptions = useMemo(
    () => filterNestedPathOptions(allOptions, searchQuery),
    [allOptions, searchQuery],
  )

  const closeDropdown = () => {
    setOpen(false)
    setSearchQuery('')
  }

  const toggleValue = (label: string) => {
    if (selectedLabels.includes(label)) {
      onChange(selectedLabels.filter((item) => item !== label))
      return
    }
    onChange([...selectedLabels, label])
  }

  const clearSelection = () => {
    onChange([])
    closeDropdown()
  }

  return (
    <Box ref={anchorRef}>
      <TextField
        id={id}
        fullWidth
        disabled={disabled}
        value={formatHierarchyMultiTriggerLabel(value, allOptions)}
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
          sx: { cursor: disabled ? 'default' : 'pointer' },
        }}
        inputProps={{
          style: {
            cursor: disabled ? 'default' : 'pointer',
            color: selectedLabels.length > 0 ? undefined : 'inherit',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        }}
        sx={[
          fieldSx,
          selectedLabels.length === 0 && {
            '& .MuiInputBase-input': { color: 'text.secondary' },
          },
        ]}
      />

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        sx={{ zIndex: (theme) => dropdownZIndex ?? theme.zIndex.modal + 2, width: anchorRef.current?.clientWidth }}
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
                      selected={selectedLabels.length === 0}
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
                    {renderHierarchyTree(tree, 0, labelById, selectedLabels, toggleValue)}
                  </>
                ) : filteredOptions.length === 0 ? (
                  <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {emptySearchMessage}
                    </Typography>
                  </Box>
                ) : (
                  filteredOptions.map((option) => {
                    const selected = selectedLabels.includes(option.label)
                    return (
                      <ListItemButton
                        key={option.id}
                        selected={selected}
                        onClick={() => toggleValue(option.label)}
                        sx={{
                          minHeight: ROW_HEIGHT,
                          py: 0.5,
                          px: 1,
                          '&.Mui-selected': {
                            bgcolor: 'action.hover',
                            '&:hover': { bgcolor: 'action.hover' },
                          },
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Checkbox edge="start" checked={selected} tabIndex={-1} disableRipple size="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={option.label}
                          primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                        />
                      </ListItemButton>
                    )
                  })
                )}
              </List>
            </Box>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  )
}
