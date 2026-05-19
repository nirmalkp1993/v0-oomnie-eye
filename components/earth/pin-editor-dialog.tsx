'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
} from '@mui/icons-material'
import { Box, Button, Typography } from '@mui/material'
import { usePinStore } from '@/lib/pin-store'
import { useCameraStore } from '@/lib/camera-store'
import { PlacemarkCardPanel } from '@/src/components/earth/placemark-card'
import { CameraStreamModal } from './camera-stream-modal'
import { PinFormDialogBody, type PinEditorTab } from './pin-form-dialog-body'
import type { Camera as CameraType } from '@/types/camera'

export function PinEditorDialog() {
  const {
    isPinEditorOpen,
    setIsPinEditorOpen,
    editingPin,
    setEditingPin,
    updatePin,
    deletePin,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    editorTab,
    setEditorTab,
    linkCameraToPin,
    unlinkCameraFromPin,
    checkPinNameExists,
  } = usePinStore()

  const { cameras, setIsAddDialogOpen } = useCameraStore()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [altitude, setAltitude] = useState('')
  const [groundingMode, setGroundingMode] = useState<'relative' | 'absolute' | 'clampToGround'>('relative')
  const [iconType, setIconType] = useState<'pin' | 'camera' | 'marker'>('pin')
  const [iconColor, setIconColor] = useState('#2196F3')
  const [iconSize, setIconSize] = useState(40)
  const [labelSize, setLabelSize] = useState(14)
  const [placesAutoOpen, setPlacesAutoOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [nameError, setNameError] = useState('')
  const [streamingCamera, setStreamingCamera] = useState<CameraType | null>(null)

  useEffect(() => {
    if (!editingPin) return
    setName(editingPin.name)
    setDescription(editingPin.description || '')
    setCategory(editingPin.category || '')
    setLatitude(editingPin.latitude.toString())
    setLongitude(editingPin.longitude.toString())
    setAltitude(editingPin.altitude.toString())
    setGroundingMode(editingPin.groundingMode)
    setIconType(editingPin.iconType)
    setIconColor(editingPin.iconColor)
    setIconSize(editingPin.iconSize)
    setLabelSize(editingPin.labelSize)
    setPlacesAutoOpen(editingPin.placesAutoOpen)
  }, [editingPin])

  const linkedCameraId = editingPin?.linkedCameraIds[0] ?? null

  const filteredCameras = cameras.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ip.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleClose = useCallback(() => {
    setIsPinEditorOpen(false)
    setEditingPin(null)
    setNameError('')
    setHasUnsavedChanges(false)
  }, [setEditingPin, setHasUnsavedChanges, setIsPinEditorOpen])

  const handleSave = useCallback(() => {
    if (!editingPin) return

    if (checkPinNameExists(name, editingPin.id)) {
      setNameError(`A pin named "${name}" already exists. Choose a different name.`)
      setEditorTab('general')
      return
    }

    updatePin(editingPin.id, {
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
      placesAutoOpen,
    })
    handleClose()
  }, [
    altitude,
    category,
    checkPinNameExists,
    description,
    editingPin,
    groundingMode,
    handleClose,
    iconColor,
    iconSize,
    iconType,
    labelSize,
    latitude,
    longitude,
    name,
    placesAutoOpen,
    setEditorTab,
    updatePin,
  ])

  const handleReset = useCallback(() => {
    if (!editingPin) return
    setName(editingPin.name)
    setDescription(editingPin.description || '')
    setCategory(editingPin.category || '')
    setLatitude(editingPin.latitude.toString())
    setLongitude(editingPin.longitude.toString())
    setAltitude(editingPin.altitude.toString())
    setGroundingMode(editingPin.groundingMode)
    setIconType(editingPin.iconType)
    setIconColor(editingPin.iconColor)
    setIconSize(editingPin.iconSize)
    setLabelSize(editingPin.labelSize)
    setPlacesAutoOpen(editingPin.placesAutoOpen)
    setHasUnsavedChanges(false)
    setNameError('')
  }, [editingPin, setHasUnsavedChanges])

  const handleDelete = useCallback(() => {
    if (!editingPin) return
    deletePin(editingPin.id)
    handleClose()
  }, [deletePin, editingPin, handleClose])

  useEffect(() => {
    if (!isPinEditorOpen || !editingPin) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
        return
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        handleSave()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editingPin, handleClose, handleSave, isPinEditorOpen])

  if (!isPinEditorOpen || !editingPin) return null

  const handleLinkCamera = (camera: CameraType) => {
    if (linkedCameraId === camera.id) {
      unlinkCameraFromPin(editingPin.id, camera.id)
    } else {
      linkCameraToPin(editingPin.id, camera.id)
    }
    setHasUnsavedChanges(true)
  }

  const handleUnlinkCamera = (cameraId: string) => {
    unlinkCameraFromPin(editingPin.id, cameraId)
    setHasUnsavedChanges(true)
  }

  return (
    <>
      <PlacemarkCardPanel
        title={`Edit ${editingPin.name}`}
        mode="edit"
        width={900}
        showUnsavedChip={hasUnsavedChanges}
        placesAutoOpen={placesAutoOpen}
        onPlacesAutoOpenChange={(checked) => {
          setPlacesAutoOpen(checked)
          setHasUnsavedChanges(true)
        }}
        onClose={handleClose}
        footer={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDelete}>
              Delete
            </Button>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: 2, ml: 'auto' }}>
              {nameError ? (
                <Typography variant="caption" color="error" sx={{ width: '100%', textAlign: 'right' }}>
                  {nameError}
                </Typography>
              ) : null}
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Press ESC to close • ⌘S to save
              </Typography>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleReset}
                disabled={!hasUnsavedChanges}
              >
                Reset
              </Button>
              <Button variant="outlined" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
                Save Changes
              </Button>
            </Box>
          </Box>
        }
      >
        <PinFormDialogBody
          activeTab={editorTab as PinEditorTab}
          setActiveTab={setEditorTab}
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
          linkedCameraId={linkedCameraId}
          filteredCameras={filteredCameras}
          nameError={nameError}
          setNameError={setNameError}
          onFieldChange={() => {
            setHasUnsavedChanges(true)
            setNameError('')
          }}
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
