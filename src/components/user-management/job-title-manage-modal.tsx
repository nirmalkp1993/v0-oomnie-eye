'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import SearchIcon from '@mui/icons-material/Search'
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight'
import {
  Box,
  Button,
  Dialog,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { Briefcase } from 'lucide-react'
import { useJobTitleStore } from '@/lib/job-title-store'
import { useUserDirectoryStore } from '@/lib/user-directory-store'
import { DialogFormField } from '@/src/components/modals/app-dialog'
import {
  findUsersAssignedToJobTitlePaths,
  formatJobTitleDeleteBlockedMessage,
} from '@/src/lib/job-title-assignment.utils'
import { findJobTitleNode } from '@/src/lib/job-title-tree.utils'
import {
  collectNestedPathOptions,
  filterNestedPathOptions,
  type HierarchyTreeNode,
} from '@/src/lib/nested-tree-path-options'
import { useAdminSnackbar } from '@/src/hooks/use-admin-snackbar'

const ROW_HEIGHT = 40
const INDENT_PX = 20
const MANAGE_MODAL_WIDTH_PX = 860
const FORM_DIALOG_WIDTH_PX = 520

const responsiveModalWidthSx = (widthPx: number) =>
  ({
    width: { xs: 'calc(100vw - 32px)', sm: widthPx },
    maxWidth: 'calc(100vw - 32px)',
  }) as const

type JobTitleFormMode =
  | { type: 'add-root' }
  | { type: 'add-child'; parentId: string }
  | { type: 'edit'; nodeId: string }

function getJobTitlePathLabel(tree: HierarchyTreeNode[], id: string): string {
  const option = collectNestedPathOptions(tree).find((item) => item.id === id)
  if (option) return option.label
  return findJobTitleNode(tree, id)?.name ?? ''
}

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

function renderManageTree(
  nodes: HierarchyTreeNode[],
  depth: number,
  selectedId: string | null,
  onSelect: (id: string) => void,
): ReactNode[] {
  const rows: ReactNode[] = []

  for (const node of nodes) {
    rows.push(
      <ListItemButton
        key={node.id}
        selected={selectedId === node.id}
        onClick={() => onSelect(node.id)}
        sx={{
          minHeight: ROW_HEIGHT,
          py: 0.5,
          pl: `${12 + depth * INDENT_PX}px`,
          pr: 1,
          '&.Mui-selected': {
            bgcolor: 'action.selected',
            '&:hover': { bgcolor: 'action.selected' },
          },
        }}
      >
        <TreeConnector depth={depth} />
        <Typography variant="body2" noWrap sx={{ fontWeight: depth === 0 ? 600 : 400 }}>
          {node.name}
        </Typography>
      </ListItemButton>,
    )
    if (node.children?.length) {
      rows.push(...renderManageTree(node.children, depth + 1, selectedId, onSelect))
    }
  }

  return rows
}

const outlineFieldSx = {
  '& .MuiOutlinedInput-root': { borderRadius: 2 },
} as const

function JobTitleFormDialog({
  open,
  mode,
  tree,
  onClose,
  onSaved,
}: {
  open: boolean
  mode: JobTitleFormMode | null
  tree: HierarchyTreeNode[]
  onClose: () => void
  onSaved: (nodeId: string) => void
}) {
  const theme = useTheme()
  const { showMessage } = useAdminSnackbar()
  const createRoot = useJobTitleStore((state) => state.createRoot)
  const createChild = useJobTitleStore((state) => state.createChild)
  const rename = useJobTitleStore((state) => state.rename)

  const [nameInput, setNameInput] = useState('')

  const isEdit = mode?.type === 'edit'
  const parentId = mode?.type === 'add-child' ? mode.parentId : null
  const editNodeId = mode?.type === 'edit' ? mode.nodeId : null

  const parentPathLabel = parentId ? getJobTitlePathLabel(tree, parentId) : ''
  const editPathLabel = editNodeId ? getJobTitlePathLabel(tree, editNodeId) : ''
  const editNode = editNodeId ? findJobTitleNode(tree, editNodeId) : null

  useEffect(() => {
    if (!open || !mode) {
      setNameInput('')
      return
    }
    if (mode.type === 'edit') {
      const node = findJobTitleNode(tree, mode.nodeId)
      setNameInput(node?.name ?? '')
      return
    }
    setNameInput('')
  }, [open, mode, tree])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      onClose()
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [open, onClose])

  if (!open || !mode) return null

  const title =
    mode.type === 'add-root'
      ? 'Add root job title'
      : mode.type === 'add-child'
        ? 'Add child job title'
        : 'Edit job title'

  const canSave = Boolean(
    nameInput.trim() && (!isEdit || nameInput.trim() !== editNode?.name),
  )

  const handleSave = () => {
    const trimmed = nameInput.trim()
    if (!trimmed) {
      showMessage('Enter a job title name', 'warning')
      return
    }

    if (mode.type === 'add-root') {
      const id = createRoot(trimmed)
      if (!id) {
        showMessage('Could not add job title — name may already exist', 'warning')
        return
      }
      showMessage('Job title added', 'success')
      onSaved(id)
      return
    }

    if (mode.type === 'add-child') {
      const id = createChild(mode.parentId, trimmed)
      if (!id) {
        showMessage('Could not add child job title', 'warning')
        return
      }
      showMessage('Child job title added', 'success')
      onSaved(id)
      return
    }

    const ok = rename(mode.nodeId, trimmed)
    if (!ok) {
      showMessage('Could not save — name may already exist', 'warning')
      return
    }
    showMessage('Job title updated', 'success')
    onSaved(mode.nodeId)
  }

  return (
    <Dialog
      open
      onClose={(_, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') onClose()
      }}
      maxWidth={false}
      slotProps={{
        backdrop: { sx: { bgcolor: alpha(theme.palette.common.black, 0.45) } },
      }}
      PaperProps={{
        sx: {
          ...responsiveModalWidthSx(FORM_DIALOG_WIDTH_PX),
          m: 2,
          borderRadius: 2,
          overflow: 'hidden',
        },
      }}
      sx={{ zIndex: (t) => t.zIndex.modal + 4 }}
    >
      <Box sx={{ px: 2.5, py: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" component="h3" sx={{ color: 'warning.main', fontWeight: 600 }}>
          {title}
        </Typography>
        {mode.type === 'add-child' ? (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Adding as child of
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={{ color: 'primary.main' }}>
              {parentPathLabel}
            </Typography>
          </Box>
        ) : null}
        {mode.type === 'edit' ? (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Current location
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {editPathLabel}
            </Typography>
          </Box>
        ) : null}
      </Box>

      <Box sx={{ px: 2.5, py: 2 }}>
        <DialogFormField label="Job title name" htmlFor="jobTitleFormName" required>
          <TextField
            id="jobTitleFormName"
            fullWidth
            autoFocus
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Enter job title name"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canSave) handleSave()
            }}
            sx={outlineFieldSx}
          />
        </DialogFormField>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1,
          px: 2.5,
          py: 1.5,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Button variant="outlined" startIcon={<CloseIcon />} onClick={onClose} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveOutlinedIcon />}
          onClick={handleSave}
          disabled={!canSave}
          sx={{ textTransform: 'none' }}
        >
          {isEdit ? 'Save changes' : 'Add job title'}
        </Button>
      </Box>
    </Dialog>
  )
}

export interface JobTitleManageOverlayProps {
  onClose: () => void
  onTreeChanged?: () => void
}

export function JobTitleManageOverlay({ onClose, onTreeChanged }: JobTitleManageOverlayProps) {
  const { showMessage } = useAdminSnackbar()
  const tree = useJobTitleStore((state) => state.tree)
  const remove = useJobTitleStore((state) => state.remove)
  const getSubtreePathLabels = useJobTitleStore((state) => state.getSubtreePathLabels)
  const directoryUsers = useUserDirectoryStore((state) => state.users)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [formMode, setFormMode] = useState<JobTitleFormMode | null>(null)

  const allOptions = useMemo(() => collectNestedPathOptions(tree), [tree])
  const isSearching = searchQuery.trim().length > 0
  const filteredOptions = useMemo(
    () => filterNestedPathOptions(allOptions, searchQuery),
    [allOptions, searchQuery],
  )

  const selectedPathLabel = selectedId ? getJobTitlePathLabel(tree, selectedId) : ''

  const notifyTreeChanged = () => {
    onTreeChanged?.()
  }

  const closeForm = () => setFormMode(null)

  const handleFormSaved = (nodeId: string) => {
    setSelectedId(nodeId)
    closeForm()
    notifyTreeChanged()
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      if (formMode) {
        closeForm()
        return
      }
      if (confirmDeleteOpen) {
        setConfirmDeleteOpen(false)
        return
      }
      onClose()
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [confirmDeleteOpen, formMode, onClose])

  const getAssignedUsersForSelection = () => {
    if (!selectedId) return []
    const pathLabels = getSubtreePathLabels(selectedId)
    return findUsersAssignedToJobTitlePaths(directoryUsers, pathLabels)
  }

  const requestDelete = () => {
    if (!selectedId) return
    const assignedUsers = getAssignedUsersForSelection()
    if (assignedUsers.length > 0) {
      showMessage(formatJobTitleDeleteBlockedMessage(assignedUsers), 'warning')
      return
    }
    setConfirmDeleteOpen(true)
  }

  const handleDelete = () => {
    if (!selectedId) return
    const assignedUsers = getAssignedUsersForSelection()
    if (assignedUsers.length > 0) {
      showMessage(formatJobTitleDeleteBlockedMessage(assignedUsers), 'warning')
      setConfirmDeleteOpen(false)
      return
    }
    remove(selectedId)
    showMessage('Job title deleted', 'success')
    setSelectedId(null)
    setConfirmDeleteOpen(false)
    notifyTreeChanged()
  }

  return (
    <>
      <Paper
        elevation={12}
        onClick={(e) => e.stopPropagation()}
        sx={{
          ...responsiveModalWidthSx(MANAGE_MODAL_WIDTH_PX),
          maxHeight: 'min(640px, 88vh)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
            px: 2.5,
            py: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.main',
              flexShrink: 0,
            }}
          >
            <Briefcase className="size-5 text-primary-foreground" />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" component="h3" sx={{ color: 'warning.main', fontWeight: 600 }}>
              Manage job titles
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Add, edit, or remove job titles in the hierarchy
            </Typography>
          </Box>
          <IconButton aria-label="Close manage job titles" onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: 2.5, py: 2 }}>
          {confirmDeleteOpen ? (
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                Delete job title?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This removes <strong>{selectedPathLabel}</strong> and all nested job titles.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => setConfirmDeleteOpen(false)} sx={{ textTransform: 'none' }}>
                  Cancel
                </Button>
                <Button variant="contained" color="error" onClick={handleDelete} sx={{ textTransform: 'none' }}>
                  Delete
                </Button>
              </Box>
            </Stack>
          ) : (
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search job titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={outlineFieldSx}
              />

              <Box
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden',
                  maxHeight: 280,
                  overflowY: 'auto',
                  bgcolor: 'background.paper',
                }}
              >
                <List dense disablePadding>
                  {!isSearching ? (
                    tree.length === 0 ? (
                      <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          No job titles yet. Use &quot;Add root&quot; to create one.
                        </Typography>
                      </Box>
                    ) : (
                      renderManageTree(tree, 0, selectedId, setSelectedId)
                    )
                  ) : filteredOptions.length === 0 ? (
                    <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No job titles match your search.
                      </Typography>
                    </Box>
                  ) : (
                    filteredOptions.map((option) => (
                      <ListItemButton
                        key={option.id}
                        selected={selectedId === option.id}
                        onClick={() => setSelectedId(option.id)}
                        sx={{ minHeight: ROW_HEIGHT, py: 0.5, px: 1.5 }}
                      >
                        <Typography variant="body2" noWrap>
                          {option.label}
                        </Typography>
                      </ListItemButton>
                    ))
                  )}
                </List>
              </Box>

              {selectedId ? (
                <Box
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: 'action.hover',
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Selected
                  </Typography>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {selectedPathLabel}
                  </Typography>
                </Box>
              ) : null}

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setFormMode({ type: 'add-root' })}
                  sx={{ textTransform: 'none' }}
                >
                  Add root
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<SubdirectoryArrowRightIcon />}
                  onClick={() => {
                    if (!selectedId) {
                      showMessage('Select a parent job title first', 'warning')
                      return
                    }
                    setFormMode({ type: 'add-child', parentId: selectedId })
                  }}
                  disabled={!selectedId}
                  sx={{ textTransform: 'none' }}
                >
                  Add child
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<EditOutlinedIcon />}
                  onClick={() => {
                    if (!selectedId) return
                    setFormMode({ type: 'edit', nodeId: selectedId })
                  }}
                  disabled={!selectedId}
                  sx={{ textTransform: 'none' }}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={requestDelete}
                  disabled={!selectedId}
                  sx={{ textTransform: 'none' }}
                >
                  Delete
                </Button>
              </Box>
            </Stack>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            px: 2.5,
            py: 1.5,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Button variant="outlined" onClick={onClose} sx={{ textTransform: 'none' }}>
            Close
          </Button>
        </Box>
      </Paper>

      <JobTitleFormDialog
        open={formMode != null}
        mode={formMode}
        tree={tree}
        onClose={closeForm}
        onSaved={handleFormSaved}
      />
    </>
  )
}

export function JobTitleManageModal({
  open,
  onClose,
  onTreeChanged,
}: {
  open: boolean
  onClose: () => void
  onTreeChanged?: () => void
}) {
  const theme = useTheme()

  if (!open) return null

  return (
    <Dialog
      open
      onClose={(_, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') onClose()
      }}
      maxWidth={false}
      slotProps={{
        backdrop: { sx: { bgcolor: alpha(theme.palette.common.black, 0.55) } },
      }}
      PaperProps={{
        sx: {
          ...responsiveModalWidthSx(MANAGE_MODAL_WIDTH_PX),
          bgcolor: 'transparent',
          backgroundImage: 'none',
          boxShadow: 'none',
          overflow: 'visible',
          m: 2,
        },
      }}
      sx={{ zIndex: (t) => t.zIndex.modal + 2 }}
    >
      <JobTitleManageOverlay onClose={onClose} onTreeChanged={onTreeChanged} />
    </Dialog>
  )
}
