'use client'

import { useMemo, useRef, useState } from 'react'
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  Button,
  ClickAwayListener,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Popper,
  TextField,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { DialogFormField } from '@/src/components/modals/app-dialog'
import {
  getAttachCandidatesForNewRoot,
  getDirectChildNodes,
  getReparentCandidateOptions,
} from '@/src/lib/hierarchy-tree.utils'
import { filterNestedPathOptions } from '@/src/lib/nested-tree-path-options'
import type { HierarchyTreeNode } from '@/src/lib/nested-tree-path-options'

const outlineFieldSx = {
  '& .MuiOutlinedInput-root': { borderRadius: 2 },
} as const

const ROW_HEIGHT = 40

function AttachCandidateSelect({
  candidates,
  value,
  onChange,
  entityLabel,
  disabled,
  dropdownZIndex,
  trigger = 'field',
}: {
  candidates: { id: string; label: string }[]
  value: string
  onChange: (id: string) => void
  entityLabel: string
  disabled?: boolean
  dropdownZIndex?: number
  trigger?: 'field' | 'button'
}) {
  const theme = useTheme()
  const anchorRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredOptions = useMemo(
    () => filterNestedPathOptions(candidates, searchQuery),
    [candidates, searchQuery],
  )

  const selectedLabel = candidates.find((option) => option.id === value)?.label ?? ''

  const closeDropdown = () => {
    setOpen(false)
    setSearchQuery('')
  }

  const openDropdown = () => {
    if (!disabled) setOpen(true)
  }

  const placeholder =
    candidates.length === 0
      ? `No other ${entityLabel}s available`
      : `Select ${entityLabel} to attach…`

  return (
    <Box ref={anchorRef} sx={trigger === 'field' ? { flex: 1, minWidth: 0 } : undefined}>
      {trigger === 'button' ? (
        <Button
          variant="outlined"
          startIcon={<AccountTreeOutlinedIcon />}
          endIcon={
            <KeyboardArrowDownIcon
              sx={{
                transform: open ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            />
          }
          onClick={openDropdown}
          disabled={disabled}
          sx={{ textTransform: 'none' }}
        >
          Select child
        </Button>
      ) : (
        <TextField
          fullWidth
          disabled={disabled}
          value={selectedLabel || placeholder}
          onClick={openDropdown}
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
            },
          }}
          sx={[
            outlineFieldSx,
            !selectedLabel && {
              '& .MuiInputBase-input': { color: 'text.secondary' },
            },
          ]}
        />
      )}

      {trigger === 'button' && selectedLabel ? (
        <Typography variant="body2" sx={{ mt: 1, fontWeight: 500 }}>
          Selected: {selectedLabel}
        </Typography>
      ) : null}

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        sx={{
          zIndex: dropdownZIndex ?? theme.zIndex.modal + 6,
          width: trigger === 'field' ? anchorRef.current?.clientWidth : 360,
        }}
      >
        <ClickAwayListener onClickAway={closeDropdown}>
          <Paper
            elevation={8}
            sx={{
              mt: 0.5,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 320,
            }}
          >
            <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
              <TextField
                size="small"
                fullWidth
                autoFocus
                placeholder={`Search ${entityLabel}s…`}
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

            <Box sx={{ overflowY: 'auto', maxHeight: 260 }}>
              <List dense disablePadding>
                {filteredOptions.length === 0 ? (
                  <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No {entityLabel}s match your search.
                    </Typography>
                  </Box>
                ) : (
                  filteredOptions.map((option) => (
                    <ListItemButton
                      key={option.id}
                      selected={value === option.id}
                      onClick={() => {
                        onChange(option.id)
                        closeDropdown()
                      }}
                      sx={{
                        minHeight: ROW_HEIGHT,
                        py: 0.5,
                        px: 1.5,
                        '&.Mui-selected': {
                          bgcolor: 'action.hover',
                          '&:hover': { bgcolor: 'action.hover' },
                        },
                      }}
                    >
                      <ListItemText
                        primary={option.label}
                        primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                      />
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

export function HierarchyFormChildrenSection({
  tree,
  parentId,
  entityLabel,
  selectedAttachId,
  onSelectedAttachIdChange,
  dropdownZIndex,
  isNewRoot = false,
}: {
  tree: HierarchyTreeNode[]
  parentId?: string | null
  entityLabel: string
  selectedAttachId: string
  onSelectedAttachIdChange: (id: string) => void
  dropdownZIndex?: number
  isNewRoot?: boolean
}) {
  const directChildren = useMemo(() => {
    if (isNewRoot || !parentId) return []
    return getDirectChildNodes(tree, parentId)
  }, [isNewRoot, parentId, tree])

  const attachCandidates = useMemo(() => {
    if (isNewRoot || !parentId) return getAttachCandidatesForNewRoot(tree)
    return getReparentCandidateOptions(tree, parentId)
  }, [isNewRoot, parentId, tree])

  const selectedLabel =
    attachCandidates.find((option) => option.id === selectedAttachId)?.label ?? ''

  return (
    <Box sx={{ mt: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {!isNewRoot ? (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Current children
          </Typography>
          {directChildren.length === 0 ? (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              No child {entityLabel}s yet.
            </Typography>
          ) : (
            <List
              dense
              disablePadding
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              {directChildren.map((child) => (
                <ListItem
                  key={child.id}
                  divider
                  sx={{
                    py: 0.75,
                    '&:last-child': { borderBottom: 0 },
                  }}
                >
                  <ListItemText
                    primary={child.name}
                    secondary={
                      child.children?.length
                        ? `${child.children.length} nested ${entityLabel}${child.children.length === 1 ? '' : 's'}`
                        : undefined
                    }
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      ) : selectedLabel ? (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Selected child
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            {selectedLabel}
          </Typography>
        </Box>
      ) : null}

      <DialogFormField
        label={isNewRoot ? 'Attach existing child' : `Attach existing ${entityLabel}`}
      >
        <AttachCandidateSelect
          candidates={attachCandidates}
          value={selectedAttachId}
          onChange={onSelectedAttachIdChange}
          entityLabel={entityLabel}
          disabled={attachCandidates.length === 0}
          dropdownZIndex={dropdownZIndex}
          trigger={isNewRoot ? 'button' : 'field'}
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
          Selected {entityLabel}s are attached when you save. The entire subtree moves under this
          node.
        </Typography>
      </DialogFormField>
    </Box>
  )
}
