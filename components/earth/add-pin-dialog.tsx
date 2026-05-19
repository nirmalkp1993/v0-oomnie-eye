'use client'

import { useCallback, useEffect, useState } from 'react'
import { Delete as DeleteIcon, Save as SaveIcon } from '@mui/icons-material'
import { Box, Button, Typography } from '@mui/material'
import { usePinStore } from '@/lib/pin-store'
import { useCameraStore } from '@/lib/camera-store'
import { PlacemarkCardPanel } from '@/src/components/earth/placemark-card'
import { CameraStreamModal } from './camera-stream-modal'
import { PinFormDialogBody, type PinEditorTab } from './pin-form-dialog-body'
import type { Camera as CameraType } from '@/types/camera'

export function AddPinDialog() {
  const {
    pendingPinLocation,
    placemarkDraft,
    isPlacemarkStepComplete,
    addPin,
    resetPinPlacement,
    checkPinNameExists,
  } = usePinStore()

  const { cameras, setIsAddDialogOpen } = useCameraStore()

  const [activeTab, setActiveTab] = useState<PinEditorTab>('camera')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [altitude, setAltitude] = useState('50')
  const [groundingMode, setGroundingMode] = useState<'relative' | 'absolute' | 'clampToGround'>('relative')
  const [iconType, setIconType] = useState<'pin' | 'camera' | 'marker'>('camera')
  const [iconColor, setIconColor] = useState('#2196F3')
  const [iconSize, setIconSize] = useState(40)
  const [labelSize, setLabelSize] = useState(14)
  const [placesAutoOpen, setPlacesAutoOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null)
  const [nameError, setNameError] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [streamingCamera, setStreamingCamera] = useState<CameraType | null>(null)

  useEffect(() => {
    if (!pendingPinLocation || !placemarkDraft) return

    setLatitude(pendingPinLocation.latitude.toFixed(10))
    setLongitude(pendingPinLocation.longitude.toFixed(10))
    setAltitude(pendingPinLocation.altitude.toString())
    setDescription(placemarkDraft.description)
    setGroundingMode(placemarkDraft.groundingMode)
    setPlacesAutoOpen(placemarkDraft.placesAutoOpen)
    setIconType('camera')
    const defaultName = `Pin ${Date.now().toString().slice(-4)}`
    setName(defaultName)
  }, [pendingPinLocation, placemarkDraft])

  const filteredCameras = cameras.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ip.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleClose = useCallback(() => {
    resetPinPlacement()
    setSelectedCameraId(null)
    setName('')
    setNameError('')
    setHasUnsavedChanges(false)
  }, [resetPinPlacement])

  const handleCreate = useCallback(() => {
    if (!name.trim()) {
      setNameError('Please enter a name for the pin')
      setActiveTab('general')
      return
    }

    if (checkPinNameExists(name)) {
      setNameError(`A pin named "${name}" already exists. Choose a different name.`)
      setActiveTab('general')
      return
    }

    addPin({
      name,
      description,
      category,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      altitude: parseFloat(altitude),
      groundingMode,
      iconType,
      iconColor,
      iconSize,
      labelSize,
      linkedCameraIds: selectedCameraId ? [selectedCameraId] : [],
      placesAutoOpen,
    })
    resetPinPlacement()
    setSelectedCameraId(null)
    setName('')
    setNameError('')
    setHasUnsavedChanges(false)
  }, [
    addPin,
    altitude,
    category,
    checkPinNameExists,
    description,
    groundingMode,
    iconColor,
    iconSize,
    iconType,
    labelSize,
    latitude,
    longitude,
    name,
    placesAutoOpen,
    resetPinPlacement,
    selectedCameraId,
  ])

  useEffect(() => {
    if (!pendingPinLocation || !isPlacemarkStepComplete || !placemarkDraft) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
        return
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        handleCreate()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pendingPinLocation, isPlacemarkStepComplete, placemarkDraft, handleClose, handleCreate])

  if (!pendingPinLocation || !isPlacemarkStepComplete || !placemarkDraft) return null

  const handleLinkCamera = (camera: CameraType) => {
    setSelectedCameraId((current) => (current === camera.id ? null : camera.id))
    setHasUnsavedChanges(true)
  }

  const handleUnlinkCamera = (_cameraId: string) => {
    setSelectedCameraId(null)
    setHasUnsavedChanges(true)
  }

  return (
    <>
      <PlacemarkCardPanel
        title={`Edit ${name || 'New Pin'}`}
        mode="edit"
        width={900}
        showUnsavedChip={hasUnsavedChanges}
        placesAutoOpen={placesAutoOpen}
        onPlacesAutoOpenChange={setPlacesAutoOpen}
        onClose={handleClose}
        footer={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleClose}>
              Delete
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Press ESC to close • ⌘S to save
              </Typography>
              <Button variant="outlined" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleCreate}>
                Save Changes
              </Button>
            </Box>
          </Box>
        }
      >
        <PinFormDialogBody
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          category={category}
          setCategory={setCategory}
          latitude={latitude}
          setLatitude={setLatitude}
          longitude={longitude}
          setLongitude={setLongitude}
          altitude={altitude}
          setAltitude={setAltitude}
          groundingMode={groundingMode}
          setGroundingMode={setGroundingMode}
          iconType={iconType}
          setIconType={setIconType}
          iconColor={iconColor}
          setIconColor={setIconColor}
          iconSize={iconSize}
          setIconSize={setIconSize}
          labelSize={labelSize}
          setLabelSize={setLabelSize}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          linkedCameraId={selectedCameraId}
          filteredCameras={filteredCameras}
          nameError={nameError}
          setNameError={setNameError}
          onFieldChange={() => setHasUnsavedChanges(true)}
          handleLinkCamera={handleLinkCamera}
          handleUnlinkCamera={handleUnlinkCamera}
          handleCameraNameClick={setStreamingCamera}
          setIsAddDialogOpen={setIsAddDialogOpen}
        />
      </PlacemarkCardPanel>

      {streamingCamera ? (
        <CameraStreamModal camera={streamingCamera} onClose={() => setStreamingCamera(null)} />
      ) : null}
    </>
  )
}
