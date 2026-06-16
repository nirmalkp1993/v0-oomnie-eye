'use client'

import { useEffect, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import type { OrgChartTreeNode } from '@/src/components/org-chart/hierarchy-flow-types'
import { HierarchyManageTreePanel } from '@/src/components/user-management/hierarchy-manage-tree-panel'
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
  type HierarchyTreeNode,
} from '@/src/lib/nested-tree-path-options'
import { useAdminSnackbar } from '@/src/hooks/use-admin-snackbar'

const MANAGE_MODAL_WIDTH_PX = 980
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
  const ensureSeeded = useJobTitleStore((state) => state.ensureSeeded)
  const remove = useJobTitleStore((state) => state.remove)
  const getSubtreePathLabels = useJobTitleStore((state) => state.getSubtreePathLabels)
  const directoryUsers = useUserDirectoryStore((state) => state.users)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [formMode, setFormMode] = useState<JobTitleFormMode | null>(null)

  const selectedPathLabel = selectedId ? getJobTitlePathLabel(tree, selectedId) : ''

  const notifyTreeChanged = () => {
    onTreeChanged?.()
  }

  useEffect(() => {
    ensureSeeded()
  }, [ensureSeeded])

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

  const getAssignedUsersForNode = (nodeId: string) => {
    const pathLabels = getSubtreePathLabels(nodeId)
    return findUsersAssignedToJobTitlePaths(directoryUsers, pathLabels)
  }

  const requestDeleteForNode = (nodeId: string) => {
    const assignedUsers = getAssignedUsersForNode(nodeId)
    if (assignedUsers.length > 0) {
      showMessage(formatJobTitleDeleteBlockedMessage(assignedUsers), 'warning')
      return
    }
    setSelectedId(nodeId)
    setConfirmDeleteOpen(true)
  }

  const handleDelete = () => {
    if (!selectedId) return
    const assignedUsers = getAssignedUsersForNode(selectedId)
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

  const handleSelectNode = (node: OrgChartTreeNode) => setSelectedId(node.id)

  const handleEditNode = (node: OrgChartTreeNode) => {
    setSelectedId(node.id)
    setFormMode({ type: 'edit', nodeId: node.id })
  }

  const handleAddChildNode = (node: OrgChartTreeNode) => {
    setSelectedId(node.id)
    setFormMode({ type: 'add-child', parentId: node.id })
  }

  return (
    <>
      <Paper
        elevation={12}
        onClick={(e) => e.stopPropagation()}
        sx={{
          ...responsiveModalWidthSx(MANAGE_MODAL_WIDTH_PX),
          maxHeight: 'min(760px, 90vh)',
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

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            px: 2.5,
            py: 2,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
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
            <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
              <HierarchyManageTreePanel
                nodes={tree}
                entityLabel="job titles"
                childLabelSingular="1 sub-title"
                childLabelPlural="{count} sub-titles"
                selectedId={selectedId}
                onSelect={handleSelectNode}
                onEdit={handleEditNode}
                onDelete={(node) => requestDeleteForNode(node.id)}
                onAddChild={handleAddChildNode}
                emptyMessage='No job titles yet. Use "Add root" to create one.'
              />

              {selectedId ? (
                <Box
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: 'action.hover',
                    border: 1,
                    borderColor: 'divider',
                    flexShrink: 0,
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

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, flexShrink: 0 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setFormMode({ type: 'add-root' })}
                  sx={{ textTransform: 'none' }}
                >
                  Add root
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
