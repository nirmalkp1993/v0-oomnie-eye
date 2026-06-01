'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
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
import {
  PlacemarkLabeledSelect,
  PlacemarkSettingsCard,
  PlacemarkTextFieldWithInfo,
} from '@/src/components/earth/placemark-card'
import { EARTH_DIALOG_SECTION_ACCENTS } from '@/src/components/modals/earth-dialog-constants'
import { CameraThumbnailMarkerEditor } from '../camera-thumbnail-marker-editor'
import type { Camera as CameraType, CameraThumbnailMarker } from '@/types/camera'

const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const ACCEPT_IMAGE = 'image/jpeg,image/png,image/webp,image/gif'

const API_BASE_PRESETS = [
  '/osc/commands/execute',
  '/onvif/device_service',
  '/api/v1/commands',
  '/cgi-bin/hi3510/param.cgi',
]

function cameraToForm(c: CameraType) {
  return {
    name: c.name,
    ip: c.ip,
    type: c.type,
    cameraId: c.cameraId,
    port: c.port.toString(),
    apiBaseUrl: c.apiBaseUrl,
    telnetUsername: c.telnetUsername,
    telnetPassword: c.telnetPassword,
    cameraPassword: c.cameraPassword,
    mediaMtxUrl: c.mediaMtxUrl || '',
    uniqueIdentifier: c.uniqueIdentifier || '',
    thumbnail: c.thumbnail || '',
    thumbnailMarker: c.thumbnailMarker ?? null,
  }
}

function markersEqual(
  a: CameraThumbnailMarker | null,
  b: CameraThumbnailMarker | null | undefined,
): boolean {
  if (!a && !b) return true
  if (!a || !b) return false
  return a.xPercent === b.xPercent && a.yPercent === b.yPercent
}

type FormState = ReturnType<typeof cameraToForm>

const EMPTY_FORM: FormState = {
  name: '',
  ip: '',
  type: 'RTSP',
  cameraId: '',
  port: '554',
  apiBaseUrl: '',
  telnetUsername: '',
  telnetPassword: '',
  cameraPassword: '',
  mediaMtxUrl: '',
  uniqueIdentifier: '',
  thumbnail: '',
  thumbnailMarker: null,
}

function formMatchesCamera(form: FormState, camera: CameraType): boolean {
  const saved = cameraToForm(camera)
  return (
    (Object.keys(form) as (keyof FormState)[])
      .filter((k) => k !== 'thumbnailMarker')
      .every((k) => form[k] === saved[k]) &&
    markersEqual(form.thumbnailMarker, saved.thumbnailMarker)
  )
}

export function CameraDetailsTab() {
  const theme = useTheme()
  const { selectedCamera, updateCamera } = useCameraStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<FormState>(() =>
    selectedCamera ? cameraToForm(selectedCamera) : EMPTY_FORM,
  )
  const [showTelnetPassword, setShowTelnetPassword] = useState(false)
  const [showCameraPassword, setShowCameraPassword] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedCamera) {
      setFormData(cameraToForm(selectedCamera))
      setImageError(null)
    }
  }, [selectedCamera])

  const isDirtyResolved = useMemo(() => {
    if (!selectedCamera) return false
    return !formMatchesCamera(formData, selectedCamera)
  }, [formData, selectedCamera])

  const hasImage = Boolean(formData.thumbnail?.length)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCamera || !isDirtyResolved) return
    updateCamera(selectedCamera.id, {
      name: formData.name,
      ip: formData.ip,
      type: formData.type,
      cameraId: formData.cameraId,
      port: parseInt(formData.port, 10) || 554,
      apiBaseUrl: formData.apiBaseUrl,
      telnetUsername: formData.telnetUsername,
      telnetPassword: formData.telnetPassword,
      cameraPassword: formData.cameraPassword,
      mediaMtxUrl: formData.mediaMtxUrl,
      uniqueIdentifier: formData.uniqueIdentifier,
      thumbnail: formData.thumbnail,
      thumbnailMarker: formData.thumbnailMarker ?? undefined,
    })
  }

  const handleReset = () => {
    if (!selectedCamera) return
    setFormData(cameraToForm(selectedCamera))
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

  if (!selectedCamera) return null

  const datalistId = `camera-api-presets-${selectedCamera.id}`

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        width: '100%',
        minWidth: 0,
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
              autoComplete="off"
            />
            <PlacemarkTextFieldWithInfo
              label="Camera ID"
              tooltip="Unique device identifier from the camera or your inventory"
              value={formData.cameraId}
              onChange={(e) => setFormData((p) => ({ ...p, cameraId: e.target.value }))}
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
          title="Network and API"
          tooltip="Connection endpoint for streaming and control commands. Port 554 is typical for RTSP"
          headerIcon={<RouterOutlinedIcon />}
          accentColor={EARTH_DIALOG_SECTION_ACCENTS.info}
          fullHeight
        >
          <Stack spacing={2}>
            <PlacemarkTextFieldWithInfo
              label="IP"
              value={formData.ip}
              onChange={(e) => setFormData((p) => ({ ...p, ip: e.target.value }))}
              autoComplete="off"
            />
            <PlacemarkTextFieldWithInfo
              label="Port"
              value={formData.port}
              onChange={(e) => setFormData((p) => ({ ...p, port: e.target.value }))}
              inputMode="numeric"
              autoComplete="off"
            />
            <PlacemarkTextFieldWithInfo
              label="API base URL"
              tooltip="Path used for ONVIF, OSC, or vendor HTTP APIs"
              value={formData.apiBaseUrl}
              onChange={(e) => setFormData((p) => ({ ...p, apiBaseUrl: e.target.value }))}
              autoComplete="off"
              inputProps={{ list: datalistId }}
              sx={{ '& input': { fontFamily: 'Roboto Mono, monospace', fontSize: '0.875rem' } }}
            />
            <datalist id={datalistId}>
              {API_BASE_PRESETS.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </Stack>
        </PlacemarkSettingsCard>
      </Box>

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
            autoComplete="username"
          />
          <PlacemarkTextFieldWithInfo
            label="Telnet password"
            type={showTelnetPassword ? 'text' : 'password'}
            value={formData.telnetPassword}
            onChange={(e) => setFormData((p) => ({ ...p, telnetPassword: e.target.value }))}
            autoComplete="current-password"
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
            autoComplete="current-password"
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
        title="Advanced — streaming and identifiers"
        tooltip="Optional MediaMTX publish URL and external unique identifier"
        headerIcon={<RouterOutlinedIcon />}
        accentColor={EARTH_DIALOG_SECTION_ACCENTS.warning}
      >
        <Stack spacing={2} sx={{ maxWidth: { md: 560 } }}>
          <PlacemarkTextFieldWithInfo
            label="MediaMTX URL"
            value={formData.mediaMtxUrl}
            onChange={(e) => setFormData((p) => ({ ...p, mediaMtxUrl: e.target.value }))}
            autoComplete="off"
            sx={{ '& input': { fontFamily: 'Roboto Mono, monospace', fontSize: '0.875rem' } }}
          />
          <PlacemarkTextFieldWithInfo
            label="Unique identifier"
            value={formData.uniqueIdentifier}
            onChange={(e) => setFormData((p) => ({ ...p, uniqueIdentifier: e.target.value }))}
            autoComplete="off"
            sx={{ '& input': { fontFamily: 'Roboto Mono, monospace', fontSize: '0.875rem' } }}
          />
        </Stack>
      </PlacemarkSettingsCard>

      <PlacemarkSettingsCard
        title="Camera image"
        tooltip="Reference still shown in camera lists, cards, and placemark quick views. Square or 4:3 images work best"
        headerIcon={<ImageOutlinedIcon />}
        accentColor={theme.palette.success.main}
      >
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Upload a reference still, then click on the image to mark where this camera is located.
        </Typography>

        {hasImage ? (
          <CameraThumbnailMarkerEditor
            imageUrl={formData.thumbnail}
            marker={formData.thumbnailMarker}
            onMarkerChange={(thumbnailMarker) =>
              setFormData((p) => ({ ...p, thumbnailMarker }))
            }
            minHeight={240}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              minHeight: 220,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
              border: '2px dashed',
              borderColor: 'divider',
              bgcolor: 'action.hover',
              px: 2,
              py: 5,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No image uploaded yet.
            </Typography>
          </Box>
        )}

        {imageError ? (
          <Typography variant="body2" color="error" sx={{ mt: 1.5 }} role="alert">
            {imageError}
          </Typography>
        ) : null}

        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT_IMAGE}
            hidden
            onChange={handleFile}
          />
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

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          gap: 1.5,
          pt: 1,
        }}
      >
        <Button type="button" variant="outlined" disabled={!isDirtyResolved} onClick={handleReset}>
          Reset changes
        </Button>
        <Button type="submit" variant="contained" disabled={!isDirtyResolved}>
          Save changes
        </Button>
      </Box>
    </Box>
  )
}
