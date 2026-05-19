'use client'

import { useCallback, useEffect, type SyntheticEvent } from 'react'
import {
  Edit as EditIcon,
  Height as HeightIcon,
  MyLocation as MyLocationIcon,
  Palette as PaletteIcon,
  Place as PlaceIcon,
  PlayArrow as PlayArrowIcon,
  Videocam as VideocamIcon,
  VideoLibrary as VideoLibraryIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { format } from 'date-fns'
import { usePinStore } from '@/lib/pin-store'
import { useCameraStore } from '@/lib/camera-store'
import {
  PlacemarkCardPanel,
  PlacemarkReadOnlyField,
  PlacemarkSettingsCard,
} from '@/src/components/earth/placemark-card'
import type { CameraPin, PinRecording, PinViewerTab } from '@/types/pin'

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ py: 3 }}>
      {value === index ? children : null}
    </Box>
  )
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.25 }}>
        {value}
      </Typography>
    </Box>
  )
}

function PinViewerDialogBody({
  pin,
  viewerTab,
  setViewerTab,
  linkedCameraName,
  recordings,
}: {
  pin: CameraPin
  viewerTab: PinViewerTab
  setViewerTab: (tab: PinViewerTab) => void
  linkedCameraName: string | null
  recordings: PinRecording[]
}) {
  const theme = useTheme()
  const tabIndex = { preview: 0, info: 1, recording: 2 }[viewerTab]

  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    const tabs: PinViewerTab[] = ['preview', 'info', 'recording']
    setViewerTab(tabs[newValue] ?? 'preview')
  }

  const groundingLabel =
    pin.groundingMode === 'relative'
      ? 'Relative to Ground'
      : pin.groundingMode === 'absolute'
        ? 'Absolute'
        : 'Clamp to Ground'

  return (
    <>
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mx: -3,
          px: 3,
          mb: 0,
          '& .MuiTab-root': {
            minHeight: 64,
            fontSize: '1rem',
            fontWeight: 500,
            textTransform: 'none',
          },
          '& .MuiSvgIcon-root': { fontSize: 24 },
          '& .MuiTabs-indicator': { height: 4, backgroundColor: 'primary.main' },
        }}
      >
        <Tab icon={<VideocamIcon />} label="Preview" iconPosition="start" />
        <Tab icon={<InfoIcon />} label="Info" iconPosition="start" />
        <Tab icon={<VideoLibraryIcon />} label="Recording" iconPosition="start" />
      </Tabs>

      <Box sx={{ minHeight: 360, maxHeight: 480, overflow: 'auto' }}>
        <TabPanel value={tabIndex} index={0}>
          {linkedCameraName ? (
            <Box>
              <Box
                sx={{
                  position: 'relative',
                  aspectRatio: '16 / 9',
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'common.black',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CircularProgress size={48} sx={{ color: 'grey.400' }} />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1.5,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  }}
                >
                  <Chip label="LIVE" size="small" color="error" sx={{ fontWeight: 600 }} />
                  <Chip label="HLS" size="small" variant="outlined" sx={{ color: 'common.white', borderColor: 'grey.500' }} />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                Viewing: {linkedCameraName}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <VideocamIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No cameras linked
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Edit this pin to link cameras.
              </Typography>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabIndex} index={1}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 3,
              alignItems: 'start',
            }}
          >
            <PlacemarkSettingsCard
              title="Basic Information"
              tooltip="General details about this placemark"
              headerIcon={<EditIcon />}
              accentColor={theme.palette.primary.main}
              fullHeight
            >
              <Stack spacing={0}>
                <PlacemarkReadOnlyField label="Name" value={pin.name} copyable />
                {pin.description ? (
                  <PlacemarkReadOnlyField
                    label="Description"
                    value={pin.description}
                    format="markdown"
                  />
                ) : null}
                <PlacemarkReadOnlyField label="Category" value={pin.category || undefined} />
              </Stack>
            </PlacemarkSettingsCard>

            <PlacemarkSettingsCard
              title="Position & Location"
              tooltip="Geographic coordinates for this placemark"
              headerIcon={<PlaceIcon />}
              accentColor={theme.palette.info.main}
              fullHeight
              action={
                <Tooltip title="Fly to this location">
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<MyLocationIcon />}
                    sx={{ textTransform: 'none' }}
                  >
                    Fly To
                  </Button>
                </Tooltip>
              }
            >
              <Stack spacing={0}>
                <PlacemarkReadOnlyField
                  label="Latitude"
                  value={`${pin.latitude.toFixed(6)}°`}
                  format="coordinate"
                  icon={<PlaceIcon sx={{ fontSize: 20 }} />}
                  copyable
                />
                <PlacemarkReadOnlyField
                  label="Longitude"
                  value={`${pin.longitude.toFixed(6)}°`}
                  format="coordinate"
                  icon={<PlaceIcon sx={{ fontSize: 20 }} />}
                  copyable
                />
                <PlacemarkReadOnlyField
                  label="Altitude"
                  value={`${pin.altitude.toFixed(2)} m`}
                  icon={<HeightIcon sx={{ fontSize: 20 }} />}
                  copyable
                />
                <PlacemarkReadOnlyField
                  label="Grounding Mode"
                  value={groundingLabel}
                  icon={<HeightIcon sx={{ fontSize: 20 }} />}
                />
              </Stack>
            </PlacemarkSettingsCard>

            <Box sx={{ gridColumn: { md: '1 / -1' } }}>
              <PlacemarkSettingsCard
                title="Pin Appearance"
                tooltip="How this placemark appears on the map"
                headerIcon={<PaletteIcon />}
                accentColor={theme.palette.warning.main}
                fullHeight
              >
                <Stack spacing={0}>
                  <PlacemarkReadOnlyField
                    label="Icon Type"
                    value={pin.iconType}
                    icon={<PaletteIcon sx={{ fontSize: 20 }} />}
                  />
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 0.5, fontWeight: 600 }}
                    >
                      Icon Color
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        pl: 4.5,
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1,
                          backgroundColor: pin.iconColor,
                          border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                        }}
                      />
                      <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                        {pin.iconColor}
                      </Typography>
                    </Box>
                  </Box>
                  <PlacemarkReadOnlyField label="Icon Size" value={`${pin.iconSize}px`} />
                  <PlacemarkReadOnlyField label="Label Size" value={`${pin.labelSize}px`} />
                </Stack>
              </PlacemarkSettingsCard>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabIndex} index={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Video Recordings
              <Chip label={recordings.length} size="small" sx={{ ml: 1 }} />
            </Typography>
          </Box>

          {recordings.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
                <Box
                  component="img"
                  src={recordings[0].thumbnailUrl}
                  alt={recordings[0].title}
                  sx={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', display: 'block' }}
                />
                <Chip
                  label="Latest recording"
                  size="small"
                  color="primary"
                  sx={{ position: 'absolute', top: 12, left: 12 }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconButtonPlay />
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 2,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: 'common.white' }}>
                    {recordings[0].title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'grey.300' }}>
                    {format(recordings[0].recordedAt, 'MMM dd yyyy - hh:mm a')}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 1,
                }}
              >
                {recordings.slice(1, 5).map((recording) => (
                  <Box key={recording.id} sx={{ position: 'relative', borderRadius: 1, overflow: 'hidden' }}>
                    <Box
                      component="img"
                      src={recording.thumbnailUrl}
                      alt={recording.title}
                      sx={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', display: 'block' }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(theme.palette.common.black, 0.2),
                      }}
                    >
                      <PlayArrowIcon sx={{ color: 'common.white', fontSize: 28 }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          ) : (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <VideoLibraryIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No recordings found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Recordings will appear here once available.
              </Typography>
            </Box>
          )}
        </TabPanel>
      </Box>
    </>
  )
}

function IconButtonPlay() {
  return (
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        bgcolor: alpha('#fff', 0.25),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <PlayArrowIcon sx={{ color: 'common.white', fontSize: 32 }} />
    </Box>
  )
}

export function PinViewerDialog() {
  const {
    isPinViewerOpen,
    setIsPinViewerOpen,
    selectedPin,
    setSelectedPin,
    viewerTab,
    setViewerTab,
    setIsPinEditorOpen,
    setEditingPin,
    deletePin,
    getPinRecordings,
  } = usePinStore()

  const { cameras } = useCameraStore()

  const handleClose = useCallback(() => {
    setIsPinViewerOpen(false)
    setSelectedPin(null)
  }, [setIsPinViewerOpen, setSelectedPin])

  const handleEdit = useCallback(() => {
    if (!selectedPin) return
    setEditingPin(selectedPin)
    setIsPinViewerOpen(false)
    setIsPinEditorOpen(true)
  }, [selectedPin, setEditingPin, setIsPinEditorOpen, setIsPinViewerOpen])

  const handleDelete = useCallback(() => {
    if (!selectedPin) return
    deletePin(selectedPin.id)
    handleClose()
  }, [deletePin, handleClose, selectedPin])

  useEffect(() => {
    if (!isPinViewerOpen || !selectedPin) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
        return
      }
      if (event.key === 'e' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault()
        handleEdit()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleClose, handleEdit, isPinViewerOpen, selectedPin])

  if (!isPinViewerOpen || !selectedPin) return null

  const linkedCameras = cameras.filter((c) => selectedPin.linkedCameraIds.includes(c.id))
  const linkedCameraName = linkedCameras[0]?.name ?? null
  const recordings = getPinRecordings(selectedPin.id)

  return (
    <PlacemarkCardPanel
      title={selectedPin.name}
      mode="view"
      width={900}
      subtitle="Read-only view • Press E to edit"
      placesAutoOpen={selectedPin.placesAutoOpen}
      onPlacesAutoOpenChange={() => {}}
      placesAutoOpenDisabled
      onClose={handleClose}
      footer={
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Button variant="outlined" color="error" onClick={handleDelete}>
            Delete
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Press ESC to close • E to edit
            </Typography>
            <Button variant="outlined" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="contained" startIcon={<EditIcon />} onClick={handleEdit}>
              Edit
            </Button>
          </Box>
        </Box>
      }
    >
      <PinViewerDialogBody
        pin={selectedPin}
        viewerTab={viewerTab}
        setViewerTab={setViewerTab}
        linkedCameraName={linkedCameraName}
        recordings={recordings}
      />
    </PlacemarkCardPanel>
  )
}
