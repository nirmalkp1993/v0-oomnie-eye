'use client'

import { useEffect, useMemo, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import SearchIcon from '@mui/icons-material/Search'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import VideoFileOutlinedIcon from '@mui/icons-material/VideoFileOutlined'
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import { useCameraStore } from '@/lib/camera-store'
import type { Camera } from '@/types/camera'
import { EarthDialogShell } from '@/src/components/modals/earth-dialog-shell'
import {
  PL_CARD_SPACING,
  PL_CONTAINER_PADDING,
} from '@/src/components/theme/professional-light-theme'

function camGroupIds(c: { groupIds?: string[] | null }): string[] {
  return c.groupIds ?? []
}

function cameraMatchesModalSearch(cam: Camera, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    cam.name.toLowerCase().includes(q) ||
    cam.ip.toLowerCase().includes(q) ||
    cam.type.toLowerCase().includes(q)
  )
}

export function AddCamerasToGroupDialog() {
  const {
    addCamerasModalGroupId,
    setAddCamerasModalGroupId,
    cameras,
    cameraGroups,
    addCamerasToParentGroup,
  } = useCameraStore()

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const open = addCamerasModalGroupId !== null

  const group = useMemo(
    () => cameraGroups.find((g) => g.id === addCamerasModalGroupId) ?? null,
    [cameraGroups, addCamerasModalGroupId],
  )

  const sortedCameras = useMemo(
    () => [...cameras].sort((a, b) => a.name.localeCompare(b.name)),
    [cameras],
  )

  const filteredCameras = useMemo(
    () => sortedCameras.filter((c) => cameraMatchesModalSearch(c, query)),
    [sortedCameras, query],
  )

  const selectedInView = useMemo(
    () => filteredCameras.filter((c) => selected.has(c.id)).length,
    [filteredCameras, selected],
  )

  const allFilteredSelected =
    filteredCameras.length > 0 && selectedInView === filteredCameras.length

  useEffect(() => {
    if (!open) return
    setSelected(new Set())
    setQuery('')
  }, [open, addCamerasModalGroupId])

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAllMatching = () => {
    setSelected((prev) => {
      const next = new Set(prev)
      for (const c of filteredCameras) next.add(c.id)
      return next
    })
  }

  const clearSelection = () => setSelected(new Set())

  const handleClose = () => setAddCamerasModalGroupId(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!addCamerasModalGroupId || selected.size === 0) return
    addCamerasToParentGroup(addCamerasModalGroupId, [...selected])
  }

  if (!open) return null

  const summaryLine =
    filteredCameras.length === sortedCameras.length
      ? `${sortedCameras.length} camera${sortedCameras.length !== 1 ? 's' : ''}`
      : `${filteredCameras.length} of ${sortedCameras.length} cameras match`

  const scrollBody =
    sortedCameras.length === 0 ? (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="subtitle2" color="text.primary" sx={{ mb: 0.5 }}>
          No cameras
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add cameras from the main camera module first.
        </Typography>
      </Box>
    ) : filteredCameras.length === 0 ? (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="subtitle2" color="text.primary" sx={{ mb: 0.5 }}>
          No cameras match
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try another name, IP, or device type, or clear the search to see everything.
        </Typography>
      </Box>
    ) : (
      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {filteredCameras.map((cam) => {
          const inThis = addCamerasModalGroupId
            ? camGroupIds(cam).includes(addCamerasModalGroupId)
            : false
          const isChecked = selected.has(cam.id)
          return (
            <Box component="li" key={cam.id}>
              <Box
                component="label"
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  px: 1.25,
                  py: 1.25,
                  borderRadius: 1,
                  border: '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'background-color 200ms',
                  ...(isChecked && {
                    borderColor: 'rgba(25, 118, 210, 0.25)',
                    bgcolor: 'rgba(25, 118, 210, 0.07)',
                  }),
                  '&:hover': {
                    borderColor: 'divider',
                    bgcolor: 'rgba(0, 0, 0, 0.02)',
                  },
                }}
              >
                <Checkbox
                  checked={isChecked}
                  onChange={() => toggle(cam.id)}
                  size="small"
                  sx={{ mt: 0.25, p: 0.5 }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'text.secondary',
                        flexShrink: 0,
                      }}
                    >
                      <VideoFileOutlinedIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{ fontWeight: 500, flex: 1, minWidth: 0 }}
                    >
                      {cam.name}
                    </Typography>
                    {inThis ? (
                      <Chip
                        label="In group"
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.625rem', textTransform: 'uppercase' }}
                      />
                    ) : null}
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ pl: 5, display: 'block' }}>
                    {cam.ip} · {cam.type}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )
        })}
      </Box>
    )

  return (
    <EarthDialogShell
      open
      onClose={handleClose}
      title="Add cameras"
      description={
        group
          ? `Choose one or more cameras to assign to ${group.name}. Cameras can belong to multiple groups; other assignments are unchanged.`
          : 'Pick a group from the table context menu first.'
      }
      headerIcon={<VideocamOutlinedIcon sx={{ fontSize: 28, color: 'primary.main' }} />}
      maxWidth="lg"
      showOpacityControl={false}
      footer={
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {selected.size > 0
              ? `${selected.size} camera${selected.size !== 1 ? 's' : ''} will be added`
              : 'Select at least one camera'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button type="button" variant="outlined" startIcon={<CloseIcon />} onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-cameras-to-group-form"
              variant="contained"
              startIcon={<CheckIcon />}
              disabled={!group || selected.size === 0}
            >
              {selected.size > 0 ? `Add (${selected.size})` : 'Add'}
            </Button>
          </Box>
        </Box>
      }
    >
      <Box
        component="form"
        id="add-cameras-to-group-form"
        onSubmit={submit}
        sx={{ display: 'flex', flexDirection: 'column' }}
      >
        <Box sx={{ px: PL_CONTAINER_PADDING, py: PL_CARD_SPACING, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { sm: 'center' },
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            <TextField
              size="small"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, IP, or type…"
              autoFocus
              aria-label="Search cameras"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
              <Button
                type="button"
                variant="outlined"
                size="small"
                disabled={filteredCameras.length === 0 || allFilteredSelected}
                onClick={selectAllMatching}
              >
                Select matching
              </Button>
              <Button
                type="button"
                variant="text"
                size="small"
                disabled={selected.size === 0}
                onClick={clearSelection}
              >
                Clear
              </Button>
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {summaryLine}
            {selected.size > 0 ? (
              <Typography component="span" variant="caption" color="text.primary">
                {' '}
                · {selected.size} selected
              </Typography>
            ) : null}
          </Typography>
        </Box>

        <Divider />

        <Box
          sx={{
            mx: PL_CONTAINER_PADDING,
            my: PL_CARD_SPACING,
            maxHeight: 'min(320px, calc(100vh - 22rem))',
            overflow: 'auto',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'rgba(0, 0, 0, 0.02)',
            p: 0.75,
          }}
        >
          {scrollBody}
        </Box>
      </Box>
    </EarthDialogShell>
  )
}
