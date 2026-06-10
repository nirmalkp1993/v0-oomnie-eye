'use client'

import type { SyntheticEvent } from 'react'
import {
  CameraAlt as CameraIcon,
  Edit as EditIcon,
  Image as ImageIcon,
  Info as InfoIcon,
  Label as LabelIcon,
  LockOutlined as LockOutlinedIcon,
  Palette as PaletteIcon,
  Place as PlaceIcon,
} from '@mui/icons-material'
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Slider,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import {
  PlacemarkLabeledSelect,
  PlacemarkSettingsCard,
  PlacemarkTextFieldWithInfo,
} from '@/src/components/earth/placemark-card'
import type { Camera as CameraType } from '@/types/camera'
import { PinPermissionTab } from './pin-permission-tab'
import type { PinEditorTab } from '@/types/pin'

export type { PinEditorTab } from '@/types/pin'

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ py: 3 }}>
      {value === index ? children : null}
    </Box>
  )
}

export function PinFormDialogBody({
  activeTab,
  setActiveTab,
  name,
  setName,
  description,
  setDescription,
  category,
  setCategory,
  latitude,
  setLatitude,
  longitude,
  setLongitude,
  altitude,
  setAltitude,
  groundingMode,
  setGroundingMode,
  iconType,
  setIconType,
  iconColor,
  setIconColor,
  iconSize,
  setIconSize,
  labelSize,
  setLabelSize,
  searchQuery,
  setSearchQuery,
  linkedCameraId,
  filteredCameras,
  nameError,
  setNameError,
  onFieldChange,
  handleLinkCamera,
  handleUnlinkCamera,
  handleCameraNameClick,
  setIsAddDialogOpen,
}: {
  activeTab: PinEditorTab
  setActiveTab: (tab: PinEditorTab) => void
  name: string
  setName: (v: string) => void
  description: string
  setDescription: (v: string) => void
  category: string
  setCategory: (v: string) => void
  latitude: string
  setLatitude: (v: string) => void
  longitude: string
  setLongitude: (v: string) => void
  altitude: string
  setAltitude: (v: string) => void
  groundingMode: 'relative' | 'absolute' | 'clampToGround'
  setGroundingMode: (v: 'relative' | 'absolute' | 'clampToGround') => void
  iconType: 'pin' | 'camera' | 'marker'
  setIconType: (v: 'pin' | 'camera' | 'marker') => void
  iconColor: string
  setIconColor: (v: string) => void
  iconSize: number
  setIconSize: (v: number) => void
  labelSize: number
  setLabelSize: (v: number) => void
  searchQuery: string
  setSearchQuery: (v: string) => void
  linkedCameraId: string | null
  filteredCameras: CameraType[]
  nameError: string
  setNameError: (v: string) => void
  onFieldChange: () => void
  handleLinkCamera: (camera: CameraType) => void
  handleUnlinkCamera: (cameraId: string) => void
  handleCameraNameClick: (camera: CameraType) => void
  setIsAddDialogOpen: (open: boolean) => void
}) {
  const theme = useTheme()
  const tabIndex = { camera: 0, general: 1, position: 2, style: 3, permission: 4 }[activeTab]

  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    const tabs: PinEditorTab[] = ['camera', 'general', 'position', 'style', 'permission']
    setActiveTab(tabs[newValue] ?? 'camera')
  }

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
        <Tab icon={<CameraIcon />} label="Camera" iconPosition="start" />
        <Tab icon={<InfoIcon />} label="General" iconPosition="start" />
        <Tab icon={<PlaceIcon />} label="Position" iconPosition="start" />
        <Tab icon={<ImageIcon />} label="Style & Media" iconPosition="start" />
        <Tab icon={<LockOutlinedIcon />} label="Permission" iconPosition="start" />
      </Tabs>

      <Box sx={{ minHeight: 400, maxHeight: 480, overflow: 'auto' }}>
        <TabPanel value={tabIndex} index={0}>
          <PlacemarkSettingsCard
            title="Cameras"
            tooltip="Registered devices — same list as Camera management"
            headerIcon={<CameraIcon />}
            accentColor={theme.palette.primary.main}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="contained" size="small" onClick={() => setIsAddDialogOpen(true)}>
                Add camera
              </Button>
            </Box>
            <TextField
              size="small"
              fullWidth
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TableContainer sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Link</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>IP</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Camera ID</TableCell>
                    <TableCell>Port</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCameras.map((camera) => {
                    const isLinked = linkedCameraId === camera.id
                    return (
                      <TableRow
                        key={camera.id}
                        selected={isLinked}
                        sx={{
                          '&.Mui-selected': {
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                          },
                        }}
                      >
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleLinkCamera(camera)}
                            aria-pressed={isLinked}
                            sx={{
                              border: `2px solid ${isLinked ? theme.palette.primary.main : theme.palette.divider}`,
                              bgcolor: isLinked ? 'primary.main' : 'transparent',
                              width: 22,
                              height: 22,
                              p: 0,
                            }}
                          >
                            {isLinked ? (
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: 'primary.contrastText',
                                }}
                              />
                            ) : null}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => handleCameraNameClick(camera)}
                            sx={{ textTransform: 'none', p: 0, minWidth: 0 }}
                          >
                            {camera.name}
                          </Button>
                        </TableCell>
                        <TableCell>{camera.ip}</TableCell>
                        <TableCell>{camera.type}</TableCell>
                        <TableCell>{camera.cameraId}</TableCell>
                        <TableCell>{camera.port}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            color="error"
                            disabled={!isLinked}
                            onClick={() => handleUnlinkCamera(camera.id)}
                          >
                            Unlink
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {filteredCameras.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No cameras available. Click &quot;Add camera&quot; to create one.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </TableContainer>
          </PlacemarkSettingsCard>
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
              <Stack spacing={2}>
                <PlacemarkTextFieldWithInfo
                  label="Name"
                  tooltip="Give your placemark a descriptive name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setNameError('')
                    onFieldChange()
                  }}
                  required
                  error={Boolean(nameError)}
                  helperText={nameError}
                  inputProps={{ maxLength: 100 }}
                  showCharCounter
                  maxLength={100}
                />
                <PlacemarkTextFieldWithInfo
                  label="Description"
                  tooltip="Markdown supported (e.g., **bold**, *italic*, [link](url))"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    onFieldChange()
                  }}
                  multiline
                  rows={6}
                  showCharCounter
                  maxLength={5000}
                />
                <PlacemarkTextFieldWithInfo
                  label="Category"
                  tooltip="Organize placemarks by category"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value)
                    onFieldChange()
                  }}
                />
              </Stack>
            </PlacemarkSettingsCard>

            <PlacemarkSettingsCard
              title="Tags"
              tooltip="Add searchable tags to organize your placemarks"
              headerIcon={<LabelIcon />}
              accentColor={theme.palette.secondary.main}
              fullHeight
            >
              <Typography variant="body2" color="text.secondary">
                Tags can be added after the pin is saved.
              </Typography>
            </PlacemarkSettingsCard>
          </Box>
        </TabPanel>

        <TabPanel value={tabIndex} index={2}>
          <PlacemarkSettingsCard
            title="Geographic Coordinates"
            tooltip="Precise location and altitude settings for this placemark"
            headerIcon={<PlaceIcon />}
            accentColor={theme.palette.info.main}
          >
            <Stack spacing={2} sx={{ maxWidth: 480 }}>
              <PlacemarkTextFieldWithInfo
                label="Latitude"
                value={latitude}
                onChange={(e) => {
                  setLatitude(e.target.value)
                  onFieldChange()
                }}
              />
              <PlacemarkTextFieldWithInfo
                label="Longitude"
                value={longitude}
                onChange={(e) => {
                  setLongitude(e.target.value)
                  onFieldChange()
                }}
              />
              <PlacemarkTextFieldWithInfo
                label="Altitude"
                value={altitude}
                onChange={(e) => {
                  setAltitude(e.target.value)
                  onFieldChange()
                }}
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
                value={groundingMode}
                onChange={(e) => {
                  setGroundingMode(e.target.value as typeof groundingMode)
                  onFieldChange()
                }}
              >
                <MenuItem value="relative">Relative to Ground</MenuItem>
                <MenuItem value="absolute">Absolute</MenuItem>
                <MenuItem value="clampToGround">Clamp to Ground</MenuItem>
              </PlacemarkLabeledSelect>
            </Stack>
          </PlacemarkSettingsCard>
        </TabPanel>

        <TabPanel value={tabIndex} index={3}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 3,
              alignItems: 'start',
            }}
          >
            <PlacemarkSettingsCard
              title="Pin Appearance"
              tooltip="Customize how this placemark appears on the map"
              headerIcon={<PaletteIcon />}
              accentColor={theme.palette.primary.main}
              fullHeight
            >
              <Stack spacing={2}>
                <PlacemarkLabeledSelect
                  label="Icon Type"
                  value={iconType}
                  onChange={(e) => {
                    setIconType(e.target.value as typeof iconType)
                    onFieldChange()
                  }}
                >
                  <MenuItem value="pin">Pin</MenuItem>
                  <MenuItem value="camera">Camera</MenuItem>
                  <MenuItem value="marker">Marker</MenuItem>
                </PlacemarkLabeledSelect>
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 0.5, fontWeight: 600 }}
                  >
                    Icon Color
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                      type="color"
                      size="small"
                      value={iconColor}
                      onChange={(e) => {
                        setIconColor(e.target.value)
                        onFieldChange()
                      }}
                      sx={{ width: 72 }}
                    />
                    <TextField
                      size="small"
                      fullWidth
                      value={iconColor}
                      onChange={(e) => {
                        setIconColor(e.target.value)
                        onFieldChange()
                      }}
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 0.5, fontWeight: 600 }}
                  >
                    Icon Size: {iconSize}px
                  </Typography>
                  <Slider
                    value={iconSize}
                    onChange={(_, v) => {
                      setIconSize(v as number)
                      onFieldChange()
                    }}
                    min={20}
                    max={80}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 0.5, fontWeight: 600 }}
                  >
                    Label Size: {labelSize}px
                  </Typography>
                  <Slider
                    value={labelSize}
                    onChange={(_, v) => {
                      setLabelSize(v as number)
                      onFieldChange()
                    }}
                    min={10}
                    max={24}
                  />
                </Box>
              </Stack>
            </PlacemarkSettingsCard>

            <PlacemarkSettingsCard
              title="Media Gallery"
              tooltip="Add photos and images to this placemark"
              headerIcon={<ImageIcon />}
              accentColor={theme.palette.success.main}
              fullHeight
            >
              <Box
                sx={{
                  p: 4,
                  textAlign: 'center',
                  border: `2px dashed ${theme.palette.divider}`,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                }}
              >
                <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  No media added yet
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Media upload is available after the pin is saved
                </Typography>
              </Box>
            </PlacemarkSettingsCard>
          </Box>
        </TabPanel>

        <TabPanel value={tabIndex} index={4}>
          <PinPermissionTab onFieldChange={onFieldChange} />
        </TabPanel>
      </Box>
    </>
  )
}
