'use client'

import { useState, useEffect } from 'react'
import { usePinStore } from '@/lib/pin-store'
import { useCameraStore } from '@/lib/camera-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { 
  MapPin, 
  Camera, 
  Info, 
  Image as ImageIcon,
  X, 
  Save, 
  Settings,
  Trash2,
  RefreshCw,
  Search,
  LayoutGrid,
  LayoutList,
  Plus,
  Edit,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PinEditorTab } from '@/types/pin'
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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [nameError, setNameError] = useState('')

  useEffect(() => {
    if (editingPin) {
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
    }
  }, [editingPin])

  if (!isPinEditorOpen || !editingPin) return null

  const linkedCameras = cameras.filter((c) => editingPin.linkedCameraIds.includes(c.id))
  const availableCameras = cameras.filter((c) => !editingPin.linkedCameraIds.includes(c.id))
  const filteredCameras = availableCameras.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.ip.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleClose = () => {
    setIsPinEditorOpen(false)
    setEditingPin(null)
    setNameError('')
  }

  const handleSave = () => {
    if (checkPinNameExists(name, editingPin.id)) {
      setNameError(`A pin named "${name}" already exists in this. Choose a different name.`)
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
  }

  const handleReset = () => {
    if (editingPin) {
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
    }
  }

  const handleDelete = () => {
    deletePin(editingPin.id)
    handleClose()
  }

  const handleFieldChange = () => {
    setHasUnsavedChanges(true)
    setNameError('')
  }

  const handleLinkCamera = (camera: CameraType) => {
    linkCameraToPin(editingPin.id, camera.id)
  }

  const handleUnlinkCamera = (cameraId: string) => {
    unlinkCameraFromPin(editingPin.id, cameraId)
  }

  const tabs: { value: PinEditorTab; label: string; icon: React.ElementType }[] = [
    { value: 'camera', label: 'Camera', icon: Camera },
    { value: 'general', label: 'General', icon: Info },
    { value: 'position', label: 'Position', icon: MapPin },
    { value: 'style', label: 'Style & Media', icon: ImageIcon },
  ]

  return (
    <div className="absolute right-4 top-4 z-20 w-[600px]">
      <Card className="border-border bg-card shadow-xl">
        {/* Header */}
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary">
                <MapPin className="size-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl text-primary">Edit {editingPin.name}</CardTitle>
                {hasUnsavedChanges && (
                  <Badge className="mt-1 bg-warning text-warning-foreground">
                    Unsaved Changes
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Slider
                  defaultValue={[50]}
                  max={100}
                  step={1}
                  className="w-24"
                />
                <span className="text-xs text-muted-foreground">Places auto-open</span>
                <Switch
                  checked={placesAutoOpen}
                  onCheckedChange={(checked) => {
                    setPlacesAutoOpen(checked)
                    handleFieldChange()
                  }}
                />
              </div>
              <Button variant="ghost" size="icon">
                <Settings className="size-4 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="size-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Tabs */}
        <Tabs value={editorTab} onValueChange={(v) => setEditorTab(v as PinEditorTab)}>
          <div className="border-b border-border">
            <TabsList className="h-auto w-full justify-start gap-0 rounded-none bg-transparent p-0">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="relative rounded-none border-b-2 border-transparent px-4 py-3 text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
                  >
                    <Icon className="mr-2 size-4" />
                    {tab.label}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

          <CardContent className="max-h-[400px] overflow-y-auto p-4">
            {/* Camera Tab */}
            <TabsContent value="camera" className="mt-0">
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm text-primary">
                      <Camera className="size-4" />
                      Cameras
                    </CardTitle>
                    <Button 
                      size="sm" 
                      className="bg-primary text-primary-foreground"
                      onClick={() => setIsAddDialogOpen(true)}
                    >
                      ADD CAMERA
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Search and View Toggle */}
                  <div className="mb-4 flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search"
                        className="border-border bg-input"
                      />
                    </div>
                    <div className="flex items-center gap-1 rounded border border-border p-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className={cn(viewMode === 'list' && 'bg-muted')}
                        onClick={() => setViewMode('list')}
                      >
                        <LayoutList className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className={cn(viewMode === 'grid' && 'bg-muted')}
                        onClick={() => setViewMode('grid')}
                      >
                        <LayoutGrid className="size-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Cameras Table */}
                  <div className="rounded border border-border bg-card">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                          <TableHead className="text-xs text-muted-foreground">Link</TableHead>
                          <TableHead className="text-xs text-muted-foreground">Name</TableHead>
                          <TableHead className="text-xs text-muted-foreground">IP</TableHead>
                          <TableHead className="text-xs text-muted-foreground">Type</TableHead>
                          <TableHead className="text-xs text-muted-foreground">Camera ID</TableHead>
                          <TableHead className="text-xs text-muted-foreground">Port</TableHead>
                          <TableHead className="text-xs text-muted-foreground">API base URL</TableHead>
                          <TableHead className="text-xs text-muted-foreground">Telnet username</TableHead>
                          <TableHead className="text-xs text-muted-foreground">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Linked cameras first */}
                        {linkedCameras.map((camera) => (
                          <TableRow key={camera.id} className="border-border bg-primary/5">
                            <TableCell>
                              <div className="flex size-5 items-center justify-center rounded-full border-2 border-primary bg-primary">
                                <div className="size-2 rounded-full bg-white" />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium text-foreground">{camera.name}</TableCell>
                            <TableCell className="text-muted-foreground">{camera.ip}</TableCell>
                            <TableCell className="text-muted-foreground">{camera.type}</TableCell>
                            <TableCell className="text-muted-foreground">{camera.cameraId}</TableCell>
                            <TableCell className="text-muted-foreground">{camera.port}</TableCell>
                            <TableCell className="text-muted-foreground text-xs">{camera.apiBaseUrl}</TableCell>
                            <TableCell className="text-muted-foreground">{camera.telnetUsername}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon-sm" className="text-primary">
                                  <Edit className="size-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon-sm" 
                                  className="text-destructive"
                                  onClick={() => handleUnlinkCamera(camera.id)}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {/* Available cameras */}
                        {filteredCameras.map((camera) => (
                          <TableRow key={camera.id} className="border-border">
                            <TableCell>
                              <button
                                onClick={() => handleLinkCamera(camera)}
                                className="flex size-5 items-center justify-center rounded-full border-2 border-muted-foreground hover:border-primary"
                              />
                            </TableCell>
                            <TableCell className="font-medium text-foreground">{camera.name}</TableCell>
                            <TableCell className="text-muted-foreground">{camera.ip}</TableCell>
                            <TableCell className="text-muted-foreground">{camera.type}</TableCell>
                            <TableCell className="text-muted-foreground">{camera.cameraId}</TableCell>
                            <TableCell className="text-muted-foreground">{camera.port}</TableCell>
                            <TableCell className="text-muted-foreground text-xs">{camera.apiBaseUrl}</TableCell>
                            <TableCell className="text-muted-foreground">{camera.telnetUsername}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon-sm" className="text-primary">
                                  <Edit className="size-4" />
                                </Button>
                                <Button variant="ghost" size="icon-sm" className="text-destructive">
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* General Tab */}
            <TabsContent value="general" className="mt-0 space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Name</Label>
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    handleFieldChange()
                  }}
                  className="mt-1 border-border bg-input"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Description</Label>
                <Input
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    handleFieldChange()
                  }}
                  className="mt-1 border-border bg-input"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Category</Label>
                <Input
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value)
                    handleFieldChange()
                  }}
                  placeholder="Not set"
                  className="mt-1 border-border bg-input"
                />
              </div>
            </TabsContent>

            {/* Position Tab */}
            <TabsContent value="position" className="mt-0 space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Latitude</Label>
                <Input
                  value={latitude}
                  onChange={(e) => {
                    setLatitude(e.target.value)
                    handleFieldChange()
                  }}
                  className="mt-1 border-border bg-input"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Longitude</Label>
                <Input
                  value={longitude}
                  onChange={(e) => {
                    setLongitude(e.target.value)
                    handleFieldChange()
                  }}
                  className="mt-1 border-border bg-input"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Altitude</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    value={altitude}
                    onChange={(e) => {
                      setAltitude(e.target.value)
                      handleFieldChange()
                    }}
                    className="border-border bg-input"
                  />
                  <span className="text-sm text-muted-foreground">m</span>
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Grounding</Label>
                <Select 
                  value={groundingMode} 
                  onValueChange={(v) => {
                    setGroundingMode(v as typeof groundingMode)
                    handleFieldChange()
                  }}
                >
                  <SelectTrigger className="mt-1 border-border bg-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card">
                    <SelectItem value="relative">Relative to Ground</SelectItem>
                    <SelectItem value="absolute">Absolute</SelectItem>
                    <SelectItem value="clampToGround">Clamp to Ground</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Style Tab */}
            <TabsContent value="style" className="mt-0 space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Icon Type</Label>
                <Select 
                  value={iconType} 
                  onValueChange={(v) => {
                    setIconType(v as typeof iconType)
                    handleFieldChange()
                  }}
                >
                  <SelectTrigger className="mt-1 border-border bg-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card">
                    <SelectItem value="pin">Pin</SelectItem>
                    <SelectItem value="camera">Camera</SelectItem>
                    <SelectItem value="marker">Marker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Icon Color</Label>
                <div className="mt-1 flex items-center gap-2">
                  <div
                    className="size-8 rounded border border-border"
                    style={{ backgroundColor: iconColor }}
                  />
                  <Input
                    value={iconColor}
                    onChange={(e) => {
                      setIconColor(e.target.value)
                      handleFieldChange()
                    }}
                    className="border-border bg-input"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Icon Size</Label>
                <Input
                  value={iconSize.toString()}
                  onChange={(e) => {
                    setIconSize(parseInt(e.target.value) || 40)
                    handleFieldChange()
                  }}
                  className="mt-1 border-border bg-input"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Label Size</Label>
                <Input
                  value={labelSize.toString()}
                  onChange={(e) => {
                    setLabelSize(parseInt(e.target.value) || 14)
                    handleFieldChange()
                  }}
                  className="mt-1 border-border bg-input"
                />
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border p-4">
          <Button 
            variant="outline" 
            onClick={handleDelete}
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="mr-2 size-4" />
            DELETE
          </Button>

          <div className="flex items-center gap-2">
            {nameError && (
              <span className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="size-3" />
                {nameError}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              Press ESC to close - S to save
            </span>
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="border-primary text-primary"
            >
              <RefreshCw className="mr-2 size-4" />
              RESET
            </Button>
            <Button variant="outline" onClick={handleClose} className="border-border">
              CANCEL
            </Button>
            <Button onClick={handleSave} className="bg-primary text-primary-foreground">
              <Save className="mr-2 size-4" />
              SAVE CHANGES
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
