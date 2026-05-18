'use client'

import { usePinStore } from '@/lib/pin-store'
import { useCameraStore } from '@/lib/camera-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { 
  MapPin, 
  Video, 
  Info, 
  Film,
  X, 
  Settings,
  Trash2,
  Edit,
  Play,
  Pause,
  Volume2,
  Copy,
  Navigation,
  ArrowRight,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PinViewerTab } from '@/types/pin'
import { format } from 'date-fns'

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

  if (!isPinViewerOpen || !selectedPin) return null

  const linkedCameras = cameras.filter((c) => selectedPin.linkedCameraIds.includes(c.id))
  const recordings = getPinRecordings(selectedPin.id)

  const handleClose = () => {
    setIsPinViewerOpen(false)
    setSelectedPin(null)
  }

  const handleEdit = () => {
    setEditingPin(selectedPin)
    setIsPinViewerOpen(false)
    setIsPinEditorOpen(true)
  }

  const handleDelete = () => {
    deletePin(selectedPin.id)
    handleClose()
  }

  const tabs: { value: PinViewerTab; label: string; icon: React.ElementType }[] = [
    { value: 'preview', label: 'Preview', icon: Video },
    { value: 'info', label: 'Info', icon: Info },
    { value: 'recording', label: 'Recording', icon: Film },
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
                <CardTitle className="text-xl text-primary">{selectedPin.name}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Read-only view - Press E to edit
                </p>
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
                <Switch checked={selectedPin.placesAutoOpen} disabled />
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
        <Tabs value={viewerTab} onValueChange={(v) => setViewerTab(v as PinViewerTab)}>
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

          <CardContent className="p-4">
            {/* Preview Tab */}
            <TabsContent value="preview" className="mt-0">
              {linkedCameras.length > 0 ? (
                <div className="space-y-4">
                  {/* Video Player Mock */}
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="size-16 animate-spin rounded-full border-4 border-white/20 border-t-white/80" />
                    </div>
                    
                    {/* Video Controls */}
                    <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <Badge className="bg-destructive text-destructive-foreground">LIVE</Badge>
                      <Badge variant="outline" className="border-white/30 text-white">HLS</Badge>
                      <Badge variant="outline" className="border-white/30 text-white">WebRTC</Badge>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="ghost" size="icon-sm" className="text-white hover:bg-white/20">
                          <Pause className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" className="text-white hover:bg-white/20">
                          <Settings className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" className="text-white hover:bg-white/20">
                          <Volume2 className="size-4" />
                        </Button>
                        <Slider
                          defaultValue={[70]}
                          max={100}
                          step={1}
                          className="w-24"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Viewing: {linkedCameras[0]?.name || 'Unknown camera'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Video className="size-16 text-muted-foreground/30" />
                  <h3 className="mt-4 text-lg font-semibold text-accent">No cameras linked</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Edit this pin to link cameras.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Info Tab */}
            <TabsContent value="info" className="mt-0">
              <div className="grid grid-cols-2 gap-4">
                {/* Basic Information */}
                <Card className="border-primary/30 bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm text-primary">
                      <Edit className="size-4" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{selectedPin.name}</p>
                        <Button variant="ghost" size="icon-sm" className="size-5">
                          <Copy className="size-3 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Category</p>
                      <p className="text-foreground">{selectedPin.category || 'Not set'}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Position & Location */}
                <Card className="border-warning/30 bg-warning/5">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-sm text-warning">
                        <MapPin className="size-4" />
                        Position & Location
                      </CardTitle>
                      <Button variant="ghost" size="sm" className="text-primary text-xs">
                        <Navigation className="mr-1 size-3" />
                        Fly To
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-xs text-muted-foreground">Latitude</p>
                        <Button variant="ghost" size="icon-sm" className="size-4">
                          <Copy className="size-3 text-muted-foreground" />
                        </Button>
                      </div>
                      <p className="text-foreground">{selectedPin.latitude.toFixed(6)}°</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-xs text-muted-foreground">Longitude</p>
                        <Button variant="ghost" size="icon-sm" className="size-4">
                          <Copy className="size-3 text-muted-foreground" />
                        </Button>
                      </div>
                      <p className="text-foreground">{selectedPin.longitude.toFixed(6)}°</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-xs text-muted-foreground">Altitude</p>
                        <Button variant="ghost" size="icon-sm" className="size-4">
                          <Copy className="size-3 text-muted-foreground" />
                        </Button>
                      </div>
                      <p className="text-foreground">{selectedPin.altitude.toFixed(2)} m</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Grounding Mode</p>
                      <p className="text-foreground capitalize">
                        {selectedPin.groundingMode === 'relative' ? 'Relative to Ground' : 
                         selectedPin.groundingMode === 'absolute' ? 'Absolute' : 'Clamp to Ground'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Pin Appearance */}
                <Card className="col-span-2 border-orange-500/30 bg-orange-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm text-orange-500">
                      <Settings className="size-4" />
                      Pin Appearance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Icon Type</p>
                        <p className="text-foreground capitalize">{selectedPin.iconType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Icon Color</p>
                        <div className="flex items-center gap-2">
                          <div
                            className="size-4 rounded border border-border"
                            style={{ backgroundColor: selectedPin.iconColor }}
                          />
                          <p className="text-foreground">{selectedPin.iconColor}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Icon Size</p>
                        <p className="text-foreground">{selectedPin.iconSize}px</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Label Size</p>
                        <p className="text-foreground">{selectedPin.labelSize}px</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Recording Tab */}
            <TabsContent value="recording" className="mt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Film className="size-4" />
                    Video Recordings
                    <Badge variant="secondary">{recordings.length}</Badge>
                  </h3>
                  <Button variant="link" className="text-primary text-xs">
                    More recordings
                    <ArrowRight className="ml-1 size-3" />
                  </Button>
                </div>

                {recordings.length > 0 ? (
                  <div className="space-y-4">
                    {/* Latest Recording */}
                    <div className="relative aspect-video overflow-hidden rounded-lg">
                      <img
                        src={recordings[0].thumbnailUrl}
                        alt={recordings[0].title}
                        className="size-full object-cover"
                      />
                      <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">
                        Latest recording
                      </Badge>
                      <div className="absolute right-3 top-3 flex items-center gap-2">
                        <Badge variant="secondary">{recordings[0].duration}</Badge>
                        {recordings[0].status === 'completed' ? (
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle className="mr-1 size-3" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge className="bg-destructive text-destructive-foreground">
                            <XCircle className="mr-1 size-3" />
                            Failed
                          </Badge>
                        )}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button size="icon" className="size-12 rounded-full bg-white/20 hover:bg-white/30">
                          <Play className="size-6 text-white" />
                        </Button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <h4 className="font-medium text-white">{recordings[0].title}</h4>
                        <p className="text-sm text-white/70">
                          {format(recordings[0].recordedAt, 'MMM dd yyyy - hh:mm a')}
                        </p>
                      </div>
                    </div>

                    {/* Other Recordings */}
                    <div className="grid grid-cols-4 gap-2">
                      {recordings.slice(1, 5).map((recording) => (
                        <div key={recording.id} className="relative overflow-hidden rounded-lg">
                          <img
                            src={recording.thumbnailUrl}
                            alt={recording.title}
                            className="aspect-video w-full object-cover"
                          />
                          <div className="absolute left-1 top-1 flex items-center gap-1">
                            <Badge variant="secondary" className="text-[10px] px-1 py-0">
                              {recording.duration}
                            </Badge>
                            {recording.status === 'completed' ? (
                              <Badge className="bg-green-500 text-white text-[10px] px-1 py-0">
                                <CheckCircle className="mr-0.5 size-2" />
                                Completed
                              </Badge>
                            ) : (
                              <Badge className="bg-destructive text-destructive-foreground text-[10px] px-1 py-0">
                                <XCircle className="mr-0.5 size-2" />
                                Failed
                              </Badge>
                            )}
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Button size="icon" className="size-8 rounded-full bg-white/20 hover:bg-white/30">
                              <Play className="size-4 text-white" />
                            </Button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <h4 className="text-xs font-medium text-white truncate">{recording.title}</h4>
                            <p className="text-[10px] text-white/70">
                              {format(recording.recordedAt, 'MMM dd yyyy - hh:mm a')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Film className="size-16 text-muted-foreground/30" />
                    <h3 className="mt-4 text-lg font-semibold text-accent">No recordings found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Recordings will appear here once available.
                    </p>
                  </div>
                )}
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
            <span className="text-xs text-muted-foreground">
              Press ESC to close - E to save
            </span>
            <Button variant="outline" onClick={handleClose} className="border-border">
              CANCEL
            </Button>
            <Button onClick={handleEdit} className="bg-primary text-primary-foreground">
              <Edit className="mr-2 size-4" />
              EDIT
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
