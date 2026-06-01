'use client'

import { useRef, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import RouterOutlinedIcon from '@mui/icons-material/RouterOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useCameraStore } from '@/lib/camera-store'
import { EarthDialogShell } from '@/src/components/modals/earth-dialog-shell'
import {
  PlacemarkLabeledSelect,
  PlacemarkSettingsCard,
  PlacemarkTextFieldWithInfo,
} from '@/src/components/earth/placemark-card'
import { EARTH_DIALOG_SECTION_ACCENTS } from '@/src/components/modals/earth-dialog-constants'
import { CameraDialogHeaderIcon } from './camera-dialog-header-icon'
import { CameraThumbnailMarkerEditor } from './camera-thumbnail-marker-editor'
import type { Camera as CameraType, CameraThumbnailMarker } from '@/types/camera'

const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const ACCEPT_IMAGE = 'image/jpeg,image/png,image/webp,image/gif'

const API_BASE_PRESETS = [
  '/osc/commands/execute',
  '/onvif/device_service',
  '/api/v1/commands',
  '/cgi-bin/hi3510/param.cgi',
]

const initialFormState = {
  name: '',
  location: '',
  ip: '',
  type: 'RTSP' as CameraType['type'],
  cameraId: '',
  port: '554',
  apiBaseUrl: '',
  telnetUsername: '',
  telnetPassword: '',
  cameraPassword: '',
  mediaMtxUrl: '',
  thumbnail: '',
  thumbnailMarker: null as CameraThumbnailMarker | null,
}

export function AddCameraDialog() {
  const theme = useTheme()
  const { isAddDialogOpen, setIsAddDialogOpen, addCamera } = useCameraStore()
  const [formData, setFormData] = useState(initialFormState)
  const [showTelnetPassword, setShowTelnetPassword] = useState(false)
  const [showCameraPassword, setShowCameraPassword] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const hasImage = Boolean(formData.thumbnail?.length)
  const datalistId = 'add-camera-api-presets'

  const handleClose = () => {
    setIsAddDialogOpen(false)
    setFormData(initialFormState)
    setImageError(null)
    setShowTelnetPassword(false)
    setShowCameraPassword(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addCamera({
      name: formData.name,
      location: formData.location || undefined,
      ip: formData.ip,
      type: formData.type,
      cameraId: formData.cameraId,
      port: parseInt(formData.port, 10) || 554,
      apiBaseUrl: formData.apiBaseUrl,
      telnetUsername: formData.telnetUsername,
      telnetPassword: formData.telnetPassword,
      cameraPassword: formData.cameraPassword,
      mediaMtxUrl: formData.mediaMtxUrl || undefined,
      thumbnail: formData.thumbnail || undefined,
      thumbnailMarker: formData.thumbnailMarker ?? undefined,
    })
    setFormData(initialFormState)
    setImageError(null)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setImageError('Please choose a JPEG, PNG, WebP, or GIF file.')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('File is too large. Maximum size is 8 MB.')
      return
    }
    setImageError(null)
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        setFormData((prev) => ({ ...prev, thumbnail: result, thumbnailMarker: null }))
      }
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, thumbnail: '', thumbnailMarker: null }))
    setImageError(null)
  }

  if (!isAddDialogOpen) return null

  const footer = (
    <>
      <Button type="button" variant="outlined" startIcon={<CloseIcon />} onClick={handleClose}>
        Cancel
      </Button>
      <Button type="submit" form="add-camera-form" variant="contained" startIcon={<CheckIcon />}>
        Save
      </Button>
    </>
  )

  return (
    <EarthDialogShell
      open
      onClose={handleClose}
      title="Add Camera"
      description="Register a new surveillance camera in the system"
      headerIcon={<CameraDialogHeaderIcon variant="edit" />}
      maxWidth="4xl"
      showOpacityControl
      footer={footer}
    >
      <Box
        component="form"
        id="add-camera-form"
        onSubmit={handleSubmit}
        sx={{
          px: 3,
          py: 2,
          pb: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          width: '100%',
          minWidth: 0,
          boxSizing: 'border-box',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            gap: 3,
            alignItems: 'start',
          }}
        >
          <PlacemarkSettingsCard
            title="Camera identity"
            tooltip="Basic identifiers used across management views, exports, and integrations"
            headerIcon={<EditOutlinedIcon />}
            accentColor={EARTH_DIALOG_SECTION_ACCENTS.primary}
            fullHeight
          >
            <Stack spacing={2}>
              <PlacemarkTextFieldWithInfo
                label="Camera name"
                tooltip="Display name shown in lists and the earth map"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                required
                autoComplete="off"
              />
              <PlacemarkTextFieldWithInfo
                label="Camera ID"
                tooltip="Unique device identifier from the camera or your inventory"
                value={formData.cameraId}
                onChange={(e) => setFormData((p) => ({ ...p, cameraId: e.target.value }))}
                required
                autoComplete="off"
              />
              <PlacemarkLabeledSelect
                label="Type"
                tooltip="Connection protocol for this camera"
                value={formData.type}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    type: e.target.value as CameraType['type'],
                  }))
                }
              >
                <MenuItem value="RTSP">RTSP</MenuItem>
                <MenuItem value="ONVIF">ONVIF</MenuItem>
                <MenuItem value="USB">USB</MenuItem>
                <MenuItem value="HTTP">HTTP</MenuItem>
              </PlacemarkLabeledSelect>
            </Stack>
          </PlacemarkSettingsCard>

          <PlacemarkSettingsCard
            title="Location"
            tooltip="Physical or logical placement of this camera"
            headerIcon={<PlaceOutlinedIcon />}
            accentColor={EARTH_DIALOG_SECTION_ACCENTS.success}
            fullHeight
          >
            <Stack spacing={2}>
              <PlacemarkTextFieldWithInfo
                label="Camera location"
                tooltip="e.g. Building A, Floor 2, North entrance"
                value={formData.location}
                onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                autoComplete="off"
              />
            </Stack>
          </PlacemarkSettingsCard>
        </Box>

        <PlacemarkSettingsCard
          title="Network and API"
          tooltip="Connection endpoint for streaming and control commands. Port 554 is typical for RTSP"
          headerIcon={<RouterOutlinedIcon />}
          accentColor={EARTH_DIALOG_SECTION_ACCENTS.info}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
              maxWidth: { md: '100%' },
            }}
          >
            <PlacemarkTextFieldWithInfo
              label="IP"
              value={formData.ip}
              onChange={(e) => setFormData((p) => ({ ...p, ip: e.target.value }))}
              required
              autoComplete="off"
            />
            <PlacemarkTextFieldWithInfo
              label="Port"
              value={formData.port}
              onChange={(e) => setFormData((p) => ({ ...p, port: e.target.value }))}
              required
              inputMode="numeric"
              autoComplete="off"
            />
            <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
              <PlacemarkTextFieldWithInfo
                label="API base URL"
                tooltip="Path used for ONVIF, OSC, or vendor HTTP APIs"
                value={formData.apiBaseUrl}
                onChange={(e) => setFormData((p) => ({ ...p, apiBaseUrl: e.target.value }))}
                required
                autoComplete="off"
                inputProps={{ list: datalistId }}
                sx={{ '& input': { fontFamily: 'Roboto Mono, monospace', fontSize: '0.875rem' } }}
              />
              <datalist id={datalistId}>
                {API_BASE_PRESETS.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </Box>
          </Box>
        </PlacemarkSettingsCard>

        <PlacemarkSettingsCard
          title="Access credentials"
          tooltip="Credentials for telnet maintenance and the camera web or API login"
          headerIcon={<LockOutlinedIcon />}
          accentColor={EARTH_DIALOG_SECTION_ACCENTS.secondary}
        >
          <Stack spacing={2} sx={{ maxWidth: { md: 480 } }}>
            <PlacemarkTextFieldWithInfo
              label="Telnet username"
              value={formData.telnetUsername}
              onChange={(e) => setFormData((p) => ({ ...p, telnetUsername: e.target.value }))}
              required
              autoComplete="username"
            />
            <PlacemarkTextFieldWithInfo
              label="Telnet password"
              type={showTelnetPassword ? 'text' : 'password'}
              value={formData.telnetPassword}
              onChange={(e) => setFormData((p) => ({ ...p, telnetPassword: e.target.value }))}
              required
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowTelnetPassword((s) => !s)}
                      aria-label={showTelnetPassword ? 'Hide password' : 'Show password'}
                      edge="end"
                    >
                      {showTelnetPassword ? (
                        <VisibilityOffOutlinedIcon fontSize="small" />
                      ) : (
                        <VisibilityOutlinedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <PlacemarkTextFieldWithInfo
              label="Camera password"
              type={showCameraPassword ? 'text' : 'password'}
              value={formData.cameraPassword}
              onChange={(e) => setFormData((p) => ({ ...p, cameraPassword: e.target.value }))}
              required
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowCameraPassword((s) => !s)}
                      aria-label={showCameraPassword ? 'Hide password' : 'Show password'}
                      edge="end"
                    >
                      {showCameraPassword ? (
                        <VisibilityOffOutlinedIcon fontSize="small" />
                      ) : (
                        <VisibilityOutlinedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </PlacemarkSettingsCard>

        <PlacemarkSettingsCard
          title="Camera image"
          tooltip="Reference still shown in camera lists, cards, and placemark quick views"
          headerIcon={<ImageOutlinedIcon />}
          accentColor={theme.palette.success.main}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload a reference still, then click on the image to mark where this camera is located.
          </Typography>

          {hasImage ? (
            <Box sx={{ mb: 2 }}>
              <CameraThumbnailMarkerEditor
                imageUrl={formData.thumbnail}
                marker={formData.thumbnailMarker}
                onMarkerChange={(thumbnailMarker) =>
                  setFormData((p) => ({ ...p, thumbnailMarker }))
                }
                minHeight={220}
              />
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                minHeight: 200,
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                border: '2px dashed',
                borderColor: 'divider',
                bgcolor: 'action.hover',
                px: 2,
                py: 4,
                textAlign: 'center',
                mb: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No image uploaded yet.
              </Typography>
            </Box>
          )}

          <PlacemarkTextFieldWithInfo
            label="Image URL"
            tooltip="Optional direct link if you are not uploading a file"
            value={formData.thumbnail.startsWith('data:') ? '' : formData.thumbnail}
            onChange={(e) =>
              setFormData((p) => ({
                ...p,
                thumbnail: e.target.value,
                thumbnailMarker: null,
              }))
            }
            autoComplete="off"
            placeholder="https://…"
          />

          {imageError ? (
            <Typography variant="body2" color="error" sx={{ mt: 1.5 }} role="alert">
              {imageError}
            </Typography>
          ) : null}

          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            <input ref={fileRef} type="file" accept={ACCEPT_IMAGE} hidden onChange={handleFile} />
            <Button
              type="button"
              variant="contained"
              size="small"
              startIcon={<CloudUploadOutlinedIcon />}
              onClick={() => fileRef.current?.click()}
            >
              Upload image
            </Button>
            <Button
              type="button"
              variant="outlined"
              size="small"
              disabled={!hasImage}
              startIcon={<DeleteOutlineOutlinedIcon />}
              onClick={removeImage}
            >
              Remove image
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
            JPEG, PNG, WebP, or GIF up to 8 MB.
          </Typography>
        </PlacemarkSettingsCard>
      </Box>
    </EarthDialogShell>
  )
}
