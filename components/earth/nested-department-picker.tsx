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
} from '@mui/material'
import { getDepartmentNestedPathOptions } from '@/src/lib/department-nested-paths'
import {
  filterNestedPathOptions,
  type HierarchyTreeNode,
} from '@/src/lib/nested-tree-path-options'
import { DEPARTMENT_HIERARCHY_TREE } from '@/src/mock-data/department-hierarchy'

const ROW_HEIGHT = 40
const INDENT_PX = 20

function DepartmentTreeConnector({ depth }: { depth: number }) {
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

function DepartmentTreeRow({
  node,
  depth,
  selected,
  onToggle,
}: {
  node: HierarchyTreeNode
  depth: number
  selected: boolean
  onToggle: (id: string) => void
}) {
  return (
    <ListItemButton
      selected={selected}
      onClick={() => onToggle(node.id)}
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
      <DepartmentTreeConnector depth={depth} />
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

function renderFlatDepartmentTree(
  nodes: HierarchyTreeNode[],
  depth: number,
  value: string[],
  onToggle: (id: string) => void,
): ReactNode[] {
  const rows: ReactNode[] = []

  for (const node of nodes) {
    rows.push(
      <DepartmentTreeRow
        key={node.id}
        node={node}
        depth={depth}
        selected={value.includes(node.id)}
        onToggle={onToggle}
      />,
    )
    if (node.children?.length) {
      rows.push(...renderFlatDepartmentTree(node.children, depth + 1, value, onToggle))
    }
  }

  return rows
}

function formatDepartmentTriggerLabel(value: string[], allOptions: { id: string; label: string }[]): string {
  if (value.length === 0) return 'None'
  const labels = value
    .map((id) => allOptions.find((option) => option.id === id)?.label)
    .filter((label): label is string => Boolean(label))
  if (labels.length <= 2) return labels.join(', ')
  return `${labels.length} departments selected`
}

export function NestedDepartmentPicker({
  value,
  onChange,
}: {
  value: string[]
  onChange: (departmentIds: string[]) => void
}) {
  const anchorRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const allOptions = useMemo(() => getDepartmentNestedPathOptions(), [])
  const isSearching = searchQuery.trim().length > 0
  const filteredOptions = useMemo(
    () => filterNestedPathOptions(allOptions, searchQuery),
    [allOptions, searchQuery],
  )

  const triggerLabel = formatDepartmentTriggerLabel(value, allOptions)

  const closeDropdown = () => {
    setOpen(false)
    setSearchQuery('')
  }

  const toggleSelection = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((item) => item !== id))
      return
    }
    onChange([...value, id])
  }

  const clearSelection = () => onChange([])

  return (
    <Box ref={anchorRef}>
      <TextField
        fullWidth
        size="small"
        label="Department"
        value={triggerLabel}
        InputLabelProps={{ shrink: true }}
        onClick={() => setOpen(true)}
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
        inputProps={{ style: { cursor: 'pointer' } }}
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
                placeholder="Search departments..."
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
                      selected={value.length === 0}
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
                        None
                      </Typography>
                    </ListItemButton>
                    {renderFlatDepartmentTree(DEPARTMENT_HIERARCHY_TREE, 0, value, toggleSelection)}
                  </>
                ) : filteredOptions.length === 0 ? (
                  <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No departments match your search.
                    </Typography>
                  </Box>
                ) : (
                  filteredOptions.map((option) => {
                    const selected = value.includes(option.id)
                    return (
                      <ListItemButton
                        key={option.id}
                        selected={selected}
                        onClick={() => toggleSelection(option.id)}
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
