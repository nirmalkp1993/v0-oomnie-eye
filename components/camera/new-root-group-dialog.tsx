'use client'

import { useEffect, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined'
import { Box, Button } from '@mui/material'
import { useCameraStore } from '@/lib/camera-store'
import { PlacemarkTextFieldWithInfo } from '@/src/components/earth/placemark-card'
import { EarthDialogShell } from '@/src/components/modals/earth-dialog-shell'
import {
  PL_CARD_SPACING,
  PL_CONTAINER_PADDING,
} from '@/src/components/theme/professional-light-theme'

export function NewRootGroupDialog() {
  const { isNewRootGroupModalOpen, setIsNewRootGroupModalOpen, createRootGroup } = useCameraStore()
  const [name, setName] = useState('')

  useEffect(() => {
    if (!isNewRootGroupModalOpen) return
    setName('')
  }, [isNewRootGroupModalOpen])

  const handleClose = () => setIsNewRootGroupModalOpen(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    createRootGroup(name)
  }

  if (!isNewRootGroupModalOpen) return null

  return (
    <EarthDialogShell
      open
      onClose={handleClose}
      title="New group"
      description="Creates an empty group at the root of the list. Use the table context menu on a group to add subgroups or cameras."
      headerIcon={<CreateNewFolderOutlinedIcon sx={{ fontSize: 28, color: 'primary.main' }} />}
      maxWidth="md"
      showOpacityControl={false}
      footer={
        <>
          <Button type="button" variant="outlined" startIcon={<CloseIcon />} onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="new-root-group-form" variant="contained" startIcon={<CheckIcon />}>
            Create
          </Button>
        </>
      }
    >
      <Box
        component="form"
        id="new-root-group-form"
        onSubmit={submit}
        sx={{
          px: PL_CONTAINER_PADDING,
          py: PL_CARD_SPACING,
          display: 'flex',
          flexDirection: 'column',
          gap: PL_CARD_SPACING,
        }}
      >
        <PlacemarkTextFieldWithInfo
          label="Group name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Building A"
          required
          autoFocus
          autoComplete="off"
        />
      </Box>
    </EarthDialogShell>
  )
}
