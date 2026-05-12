'use client'

import { useState, useEffect } from 'react'
import { usePinStore } from '@/lib/pin-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { MapPin, Edit, Settings, X, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AddPinDialog() {
  const {
    pendingPinLocation,
    setPendingPinLocation,
    addPin,
    setIsAddingPin,
  } = usePinStore()

  const [description, setDescription] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [altitude, setAltitude] = useState('50')
  const [groundingMode, setGroundingMode] = useState<'relative' | 'absolute' | 'clampToGround'>('relative')
  const [placesAutoOpen, setPlacesAutoOpen] = useState(true)

  useEffect(() => {
    if (pendingPinLocation) {
      setLatitude(pendingPinLocation.latitude.toFixed(10))
      setLongitude(pendingPinLocation.longitude.toFixed(10))
      setAltitude(pendingPinLocation.altitude.toString())
    }
  }, [pendingPinLocation])

  if (!pendingPinLocation) return null

  const handleClose = () => {
    setPendingPinLocation(null)
    setIsAddingPin(false)
  }

  const handleCreate = () => {
    const pinName = `Pin ${Date.now().toString().slice(-4)}`
    addPin({
      name: pinName,
      description,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      altitude: parseFloat(altitude),
      groundingMode,
      iconType: 'pin',
      iconColor: '#2196F3',
      iconSize: 40,
      labelSize: 14,
      linkedCameraIds: [],
      placesAutoOpen,
    })
    handleClose()
  }

  return (
    <div className="absolute right-4 top-4 z-20 w-[500px]">
      <Card className="border-border bg-card shadow-xl">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary">
                <MapPin className="size-5 text-primary-foreground" />
              </div>
              <CardTitle className="text-xl text-primary">Add Camera</CardTitle>
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
                  onCheckedChange={setPlacesAutoOpen}
                />
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <Settings className="size-4 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="size-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Placemark Details */}
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm text-primary">
                  <Edit className="size-4" />
                  Placemark Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description..."
                    className="mt-1 min-h-[100px] resize-none border-border bg-input"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Position */}
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm text-primary">
                  <MapPin className="size-4" />
                  Position
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Latitude</Label>
                  <Input
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="mt-1 border-border bg-input"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Longitude</Label>
                  <Input
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="mt-1 border-border bg-input"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Altitude</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      value={altitude}
                      onChange={(e) => setAltitude(e.target.value)}
                      className="border-border bg-input"
                    />
                    <span className="text-sm text-muted-foreground">m</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Grounding</Label>
                  <Select value={groundingMode} onValueChange={(v) => setGroundingMode(v as typeof groundingMode)}>
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
              </CardContent>
            </Card>
          </div>
        </CardContent>

        <div className="flex items-center justify-end gap-2 border-t border-border p-4">
          <span className="mr-auto text-xs text-muted-foreground">
            Press ESC to close - S to save
          </span>
          <Button variant="outline" onClick={handleClose} className="border-border">
            CANCEL
          </Button>
          <Button onClick={handleCreate} className="bg-primary text-primary-foreground">
            <Save className="mr-2 size-4" />
            CREATE PLACEMARK
          </Button>
        </div>
      </Card>
    </div>
  )
}
