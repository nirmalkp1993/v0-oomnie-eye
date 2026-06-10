'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Edit as EditIcon,
  Place as PlaceIcon,
  Save as SaveIcon,
} from '@mui/icons-material'
import { Box, Button, MenuItem, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { usePinStore } from '@/lib/pin-store'
import {
  PlacemarkCardPanel,
  PlacemarkLabeledSelect,
  PlacemarkSettingsCard,
  PlacemarkTextFieldWithInfo,
} from '@/src/components/earth/placemark-card'

function AddCameraPlacemarkDialogBody({
  description,
  setDescription,
  latitude,
  setLatitude,
  longitude,
  setLongitude,
  altitude,
  setAltitude,
  groundingMode,
  setGroundingMode,
}: {
  description: string
  setDescription: (v: string) => void
  latitude: string
  setLatitude: (v: string) => void
  longitude: string
  setLongitude: (v: string) => void
  altitude: string
  setAltitude: (v: string) => void
  groundingMode: 'relative' | 'absolute' | 'clampToGround'
  setGroundingMode: (v: 'relative' | 'absolute' | 'clampToGround') => void
}) {
  const theme = useTheme()

  return (
    <Box sx={{ py: 2 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        <PlacemarkSettingsCard
          title="Placemark Details"
          tooltip="Provide basic information for your new placemark"
          headerIcon={<EditIcon />}
          accentColor={theme.palette.primary.main}
          fullHeight
        >
          <PlacemarkTextFieldWithInfo
            label="Description"
            tooltip="Markdown supported (e.g., **bold**, *italic*, [link](url))"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={8}
            placeholder="Enter description..."
          />
        </PlacemarkSettingsCard>

        <PlacemarkSettingsCard
          title="Position"
          tooltip="Geographic coordinates for this placemark"
          headerIcon={<PlaceIcon />}
          accentColor={theme.palette.info.main}
          fullHeight
        >
          <Stack spacing={2}>
            <PlacemarkTextFieldWithInfo
              label="Latitude"
              tooltip="Latitude in decimal degrees"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
            <PlacemarkTextFieldWithInfo
              label="Longitude"
              tooltip="Longitude in decimal degrees"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
            <PlacemarkTextFieldWithInfo
              label="Altitude"
              tooltip="Height above reference in meters"
              value={altitude}
              onChange={(e) => setAltitude(e.target.value)}
              InputProps={{
                endAdornment: (
                  <Typography variant="body2" color="text.secondary" sx={{ pr: 1 }}>
                    m
                  </Typography>
                ),
              }}
            />
            <PlacemarkLabeledSelect
              label="Grounding"
              tooltip="How the placemark is anchored to the terrain"
              value={groundingMode}
              onChange={(e) => setGroundingMode(e.target.value as typeof groundingMode)}
            >
              <MenuItem value="relative">Relative to Ground</MenuItem>
              <MenuItem value="absolute">Absolute</MenuItem>
              <MenuItem value="clampToGround">Clamp to Ground</MenuItem>
            </PlacemarkLabeledSelect>
          </Stack>
        </PlacemarkSettingsCard>
      </Box>
    </Box>
  )
}

export function AddCameraPlacemarkDialog() {
  const {
    pendingPinLocation,
    isPlacemarkStepComplete,
    confirmPlacemarkStep,
    resetPinPlacement,
  } = usePinStore()

  const [description, setDescription] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [altitude, setAltitude] = useState('50')
  const [groundingMode, setGroundingMode] = useState<'relative' | 'absolute' | 'clampToGround'>('relative')
  const [placesAutoOpen, setPlacesAutoOpen] = useState(true)

  useEffect(() => {
    if (!pendingPinLocation) return

    setDescription('')
    setLatitude(pendingPinLocation.latitude.toFixed(14))
    setLongitude(pendingPinLocation.longitude.toFixed(14))
    setAltitude(pendingPinLocation.altitude.toString())
    setGroundingMode('relative')
    setPlacesAutoOpen(true)
  }, [pendingPinLocation])

  const handleCreatePlacemark = useCallback(() => {
    confirmPlacemarkStep({
      description,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      altitude: parseFloat(altitude),
      groundingMode,
      placesAutoOpen,
    })
  }, [altitude, confirmPlacemarkStep, description, groundingMode, latitude, longitude, placesAutoOpen])

  useEffect(() => {
    if (!pendingPinLocation || isPlacemarkStepComplete) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        resetPinPlacement()
        return
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        handleCreatePlacemark()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleCreatePlacemark, isPlacemarkStepComplete, pendingPinLocation, resetPinPlacement])

  if (!pendingPinLocation || isPlacemarkStepComplete) return null

  return (
    <PlacemarkCardPanel
      title="Add Camera"
      mode="preview"
      width={900}
      placesAutoOpen={placesAutoOpen}
      onPlacesAutoOpenChange={setPlacesAutoOpen}
      onClose={resetPinPlacement}
      footer={
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            Press ESC to close • ⌘S to save
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
            <Button variant="outlined" onClick={resetPinPlacement}>
              Cancel
            </Button>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleCreatePlacemark}>
              Create Placemark
            </Button>
          </Box>
        </Box>
      }
    >
      <AddCameraPlacemarkDialogBody
        description={description}
        setDescription={setDescription}
        latitude={latitude}
        setLatitude={setLatitude}
        longitude={longitude}
        setLongitude={setLongitude}
        altitude={altitude}
        setAltitude={setAltitude}
        groundingMode={groundingMode}
        setGroundingMode={setGroundingMode}
      />
    </PlacemarkCardPanel>
  )
}
