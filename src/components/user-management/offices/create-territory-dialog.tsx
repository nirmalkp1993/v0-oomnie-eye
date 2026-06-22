'use client'

import { useEffect, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import { Box, Button, Dialog, TextField, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { useTerritoryStore } from '@/lib/territory-store'
import { DialogFormField } from '@/src/components/modals/app-dialog'
import { findTerritoryNodeById } from '@/src/lib/user-management/territory-tree-page.utils'
import type { HierarchyTreeNode } from '@/src/lib/nested-tree-path-options'
import { useAdminSnackbar } from '@/src/hooks/use-admin-snackbar'

const FORM_DIALOG_WIDTH_PX = 480

const responsiveModalWidthSx = (widthPx: number) =>
  ({
    width: { xs: 'calc(100vw - 32px)', sm: widthPx },
    maxWidth: 'calc(100vw - 32px)',
  }) as const

const outlineFieldSx = {
  '& .MuiOutlinedInput-root': { borderRadius: 2 },
} as const

export type TerritoryFormMode =
  | { type: 'add-root' }
  | { type: 'add-child'; parentId: string }
  | { type: 'edit'; nodeId: string }

export interface CreateTerritoryDialogProps {
  open: boolean
  mode: TerritoryFormMode | null
  tree: HierarchyTreeNode[]
  onClose: () => void
  onSaved?: (territoryId: string) => void
}

export function CreateTerritoryDialog({
  open,
  mode,
  tree,
  onClose,
  onSaved,
}: CreateTerritoryDialogProps) {
  const theme = useTheme()
  const { showMessage } = useAdminSnackbar()
  const createRoot = useTerritoryStore((state) => state.createRoot)
  const createChild = useTerritoryStore((state) => state.createChild)
  const rename = useTerritoryStore((state) => state.rename)

  const [nameInput, setNameInput] = useState('')

  const isEdit = mode?.type === 'edit'
  const parentId = mode?.type === 'add-child' ? mode.parentId : null
  const editNodeId = mode?.type === 'edit' ? mode.nodeId : null
  const parentNode = parentId ? findTerritoryNodeById(tree, parentId) : null
  const editNode = editNodeId ? findTerritoryNodeById(tree, editNodeId) : null

  useEffect(() => {
    if (!open || !mode) {
      setNameInput('')
      return
    }
    if (mode.type === 'edit') {
      setNameInput(editNode?.name ?? '')
      return
    }
    setNameInput('')
  }, [open, mode, editNode?.name])

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
      ? 'New territory'
      : mode.type === 'add-child'
        ? 'New child territory'
        : 'Edit territory'

  const trimmedName = nameInput.trim()
  const canSave =
    mode.type === 'edit'
      ? Boolean(trimmedName && trimmedName !== editNode?.name)
      : Boolean(trimmedName)

  const handleSave = () => {
    if (!trimmedName) {
      showMessage('Enter a territory name', 'warning')
      return
    }

    if (mode.type === 'add-root') {
      const id = createRoot(trimmedName)
      if (!id) {
        showMessage('Could not add territory — name may already exist', 'warning')
        return
      }
      showMessage('Territory added', 'success')
      onSaved?.(id)
      onClose()
      return
    }

    if (mode.type === 'add-child') {
      const id = createChild(mode.parentId, trimmedName)
      if (!id) {
        showMessage('Could not add child territory', 'warning')
        return
      }
      showMessage('Child territory added', 'success')
      onSaved?.(id)
      onClose()
      return
    }

    const ok = rename(mode.nodeId, trimmedName)
    if (!ok) {
      showMessage('Could not save territory', 'warning')
      return
    }
    showMessage('Territory updated', 'success')
    onSaved?.(mode.nodeId)
    onClose()
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
        {parentNode ? (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Adding as child of
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={{ color: 'primary.main' }}>
              {parentNode.name}
            </Typography>
          </Box>
        ) : null}
      </Box>

      <Box sx={{ px: 2.5, py: 2 }}>
        <DialogFormField label="Territory name" htmlFor="createTerritoryName" required>
          <TextField
            id="createTerritoryName"
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
        <Button
          variant="outlined"
          startIcon={<CloseIcon />}
          onClick={onClose}
          sx={{ textTransform: 'none' }}
        >
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
