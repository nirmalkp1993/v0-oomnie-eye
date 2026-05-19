'use client'

import CloseIcon from '@mui/icons-material/Close'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import { Box, Button } from '@mui/material'

export interface DialogFormFooterProps {
  isCreate: boolean
  isEditing: boolean
  onClose: () => void
  onEdit: () => void
  onSave: () => void
  onDelete?: () => void
  deleteLabel?: string
}

export function DialogFormFooter({
  isCreate,
  isEditing,
  onClose,
  onEdit,
  onSave,
  onDelete,
  deleteLabel = 'Delete',
}: DialogFormFooterProps) {
  if (isCreate) {
    return (
      <>
        <Box sx={{ mr: 'auto' }} />
        <Button type="button" variant="outlined" startIcon={<CloseIcon />} onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" variant="contained" startIcon={<SaveOutlinedIcon />} onClick={onSave}>
          Save
        </Button>
      </>
    )
  }

  return (
    <>
      {onDelete ? (
        <Button
          type="button"
          variant="contained"
          color="error"
          startIcon={<DeleteOutlineIcon />}
          sx={{ mr: 'auto' }}
          onClick={onDelete}
        >
          {deleteLabel}
        </Button>
      ) : (
        <Box sx={{ mr: 'auto' }} />
      )}
      <Button type="button" variant="outlined" startIcon={<CloseIcon />} onClick={onClose}>
        {isEditing ? 'Cancel' : 'Close'}
      </Button>
      {isEditing ? (
        <Button type="button" variant="contained" startIcon={<SaveOutlinedIcon />} onClick={onSave}>
          Save
        </Button>
      ) : (
        <Button type="button" variant="contained" startIcon={<EditOutlinedIcon />} onClick={onEdit}>
          Edit
        </Button>
      )}
    </>
  )
}
