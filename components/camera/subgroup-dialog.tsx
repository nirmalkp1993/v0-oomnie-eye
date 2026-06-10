'use client'

import { useEffect, useMemo, useState } from 'react'
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

export function SubgroupDialog() {
  const { subgroupModalParentId, setSubgroupModalParentId, cameraGroups, createSubgroupUnder } =
    useCameraStore()

  const [name, setName] = useState('')
  const open = subgroupModalParentId !== null

  const parent = useMemo(
    () => cameraGroups.find((g) => g.id === subgroupModalParentId) ?? null,
    [cameraGroups, subgroupModalParentId],
  )

  useEffect(() => {
    if (!open) return
    setName('')
  }, [open, subgroupModalParentId])

  const handleClose = () => setSubgroupModalParentId(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subgroupModalParentId) return
    createSubgroupUnder(subgroupModalParentId, name)
  }

  if (!open) return null

  return (
    <EarthDialogShell
      open
      onClose={handleClose}
      title="New subgroup"
      description={
        parent
          ? `Parent: ${parent.name}`
          : 'Select a parent from the list.'
      }
      headerIcon={<CreateNewFolderOutlinedIcon sx={{ fontSize: 28, color: 'primary.main' }} />}
      maxWidth="md"
      showOpacityControl={false}
      footer={
        <>
          <Button type="button" variant="outlined" startIcon={<CloseIcon />} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="subgroup-form"
            variant="contained"
            startIcon={<CheckIcon />}
            disabled={!parent}
          >
            Create
          </Button>
        </>
      }
    >
      <Box
        component="form"
        id="subgroup-form"
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
          label="Subgroup name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Floor 2"
          required
          autoFocus
          disabled={!parent}
          autoComplete="off"
        />
      </Box>
    </EarthDialogShell>
  )
}
