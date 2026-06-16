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
import { Globe } from 'lucide-react'
import { useTerritoryStore } from '@/lib/territory-store'
import { useUserDirectoryStore } from '@/lib/user-directory-store'
import { DialogFormField } from '@/src/components/modals/app-dialog'
import {
  findUsersAssignedToTerritoryPaths,
  formatTerritoryDeleteBlockedMessage,
} from '@/src/lib/territory-assignment.utils'
import { findTerritoryNode } from '@/src/lib/territory-tree.utils'
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

type TerritoryFormMode =
  | { type: 'add-root' }
  | { type: 'add-child'; parentId: string }
  | { type: 'edit'; nodeId: string }

function getTerritoryPathLabel(tree: HierarchyTreeNode[], id: string): string {
  const option = collectNestedPathOptions(tree).find((item) => item.id === id)
  if (option) return option.label
  return findTerritoryNode(tree, id)?.name ?? ''
}

const outlineFieldSx = {
  '& .MuiOutlinedInput-root': { borderRadius: 2 },
} as const

function TerritoryFormDialog({
  open,
  mode,
  tree,
  onClose,
  onSaved,
}: {
  open: boolean
  mode: TerritoryFormMode | null
  tree: HierarchyTreeNode[]
  onClose: () => void
  onSaved: (nodeId: string) => void
}) {
  const theme = useTheme()
  const { showMessage } = useAdminSnackbar()
  const createRoot = useTerritoryStore((state) => state.createRoot)
  const createChild = useTerritoryStore((state) => state.createChild)
  const rename = useTerritoryStore((state) => state.rename)

  const [nameInput, setNameInput] = useState('')

  const isEdit = mode?.type === 'edit'
  const parentId = mode?.type === 'add-child' ? mode.parentId : null
  const editNodeId = mode?.type === 'edit' ? mode.nodeId : null

  const parentPathLabel = parentId ? getTerritoryPathLabel(tree, parentId) : ''
  const editPathLabel = editNodeId ? getTerritoryPathLabel(tree, editNodeId) : ''
  const editNode = editNodeId ? findTerritoryNode(tree, editNodeId) : null

  useEffect(() => {
    if (!open || !mode) {
      setNameInput('')
      return
    }
    if (mode.type === 'edit') {
      const node = findTerritoryNode(tree, mode.nodeId)
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
      ? 'Add root territory'
      : mode.type === 'add-child'
        ? 'Add child territory'
        : 'Edit territory'

  const canSave = Boolean(
    nameInput.trim() && (!isEdit || nameInput.trim() !== editNode?.name),
  )

  const handleSave = () => {
    const trimmed = nameInput.trim()
    if (!trimmed) {
      showMessage('Enter a territory name', 'warning')
      return
    }

    if (mode.type === 'add-root') {
      const id = createRoot(trimmed)
      if (!id) {
        showMessage('Could not add territory — name may already exist', 'warning')
        return
      }
      showMessage('Territory added', 'success')
      onSaved(id)
      return
    }

    if (mode.type === 'add-child') {
      const id = createChild(mode.parentId, trimmed)
      if (!id) {
        showMessage('Could not add child territory', 'warning')
        return
      }
      showMessage('Child territory added', 'success')
      onSaved(id)
      return
    }

    const ok = rename(mode.nodeId, trimmed)
    if (!ok) {
      showMessage('Could not save — name may already exist', 'warning')
      return
    }
    showMessage('Territory updated', 'success')
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
        <DialogFormField label="Territory name" htmlFor="territoryFormName" required>
          <TextField
            id="territoryFormName"
            fullWidth
            autoFocus
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Enter territory name"
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
          {isEdit ? 'Save changes' : 'Add territory'}
        </Button>
      </Box>
    </Dialog>
  )
}

export interface TerritoryManageOverlayProps {
  onClose: () => void
  onTreeChanged?: () => void
}

export function TerritoryManageOverlay({ onClose, onTreeChanged }: TerritoryManageOverlayProps) {
  const { showMessage } = useAdminSnackbar()
  const tree = useTerritoryStore((state) => state.tree)
  const remove = useTerritoryStore((state) => state.remove)
  const getSubtreePathLabels = useTerritoryStore((state) => state.getSubtreePathLabels)
  const directoryUsers = useUserDirectoryStore((state) => state.users)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [formMode, setFormMode] = useState<TerritoryFormMode | null>(null)

  const selectedPathLabel = selectedId ? getTerritoryPathLabel(tree, selectedId) : ''

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

  const getAssignedUsersForNode = (nodeId: string) => {
    const pathLabels = getSubtreePathLabels(nodeId)
    return findUsersAssignedToTerritoryPaths(directoryUsers, pathLabels)
  }

  const requestDeleteForNode = (nodeId: string) => {
    const assignedUsers = getAssignedUsersForNode(nodeId)
    if (assignedUsers.length > 0) {
      showMessage(formatTerritoryDeleteBlockedMessage(assignedUsers), 'warning')
      return
    }
    setSelectedId(nodeId)
    setConfirmDeleteOpen(true)
  }

  const handleDelete = () => {
    if (!selectedId) return
    const assignedUsers = getAssignedUsersForNode(selectedId)
    if (assignedUsers.length > 0) {
      showMessage(formatTerritoryDeleteBlockedMessage(assignedUsers), 'warning')
      setConfirmDeleteOpen(false)
      return
    }
    remove(selectedId)
    showMessage('Territory deleted', 'success')
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
            <Globe className="size-5 text-primary-foreground" />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" component="h3" sx={{ color: 'warning.main', fontWeight: 600 }}>
              Manage territories
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Add, edit, or remove territories in the hierarchy
            </Typography>
          </Box>
          <IconButton aria-label="Close manage territories" onClick={onClose} size="small">
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
                Delete territory?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This removes <strong>{selectedPathLabel}</strong> and all nested territories.
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
                entityLabel="territories"
                childLabelSingular="1 sub-territory"
                childLabelPlural="{count} sub-territories"
                selectedId={selectedId}
                onSelect={handleSelectNode}
                onEdit={handleEditNode}
                onDelete={(node) => requestDeleteForNode(node.id)}
                onAddChild={handleAddChildNode}
                emptyMessage='No territories yet. Use "Add root" to create one.'
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

      <TerritoryFormDialog
        open={formMode != null}
        mode={formMode}
        tree={tree}
        onClose={closeForm}
        onSaved={handleFormSaved}
      />
    </>
  )
}

export function TerritoryManageModal({
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
      <TerritoryManageOverlay onClose={onClose} onTreeChanged={onTreeChanged} />
    </Dialog>
  )
}
