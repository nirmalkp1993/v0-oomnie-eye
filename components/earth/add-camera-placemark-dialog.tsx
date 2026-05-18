'use client'

import { useCallback, useEffect, useState } from 'react'
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
import {
  MapPin,
  Pencil,
  X,
  Save,
  Settings,
  Droplets,
  Info,
} from 'lucide-react'

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
    <div className="absolute right-4 top-4 z-20 w-[760px]">
      <Card className="border-border bg-card shadow-xl">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
                <MapPin className="size-5 text-primary-foreground" />
              </div>
              <CardTitle className="text-xl text-orange-500">Add Camera</CardTitle>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Droplets className="size-4 text-muted-foreground" />
                <Slider defaultValue={[50]} max={100} step={1} className="w-24" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Places auto-open</span>
                <Switch checked={placesAutoOpen} onCheckedChange={setPlacesAutoOpen} />
              </div>
              <Button variant="ghost" size="icon" type="button">
                <Settings className="size-4 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" type="button" onClick={resetPinPlacement}>
                <X className="size-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4 p-4 md:grid-cols-2">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-orange-500">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                  <Pencil className="size-4 text-primary-foreground" />
                </div>
                Placemark Details
                <Info className="size-3.5 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label className="flex items-center gap-1 text-sm text-muted-foreground">
                Description
                <Info className="size-3 text-muted-foreground" />
              </Label>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Enter description..."
                className="mt-2 min-h-[220px] resize-none border-border bg-input"
              />
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-orange-500">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                  <MapPin className="size-4 text-primary-foreground" />
                </div>
                Position
                <Info className="size-3.5 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="flex items-center gap-1 text-sm text-muted-foreground">
                  Latitude
                  <Info className="size-3 text-muted-foreground" />
                </Label>
                <Input
                  value={latitude}
                  onChange={(event) => setLatitude(event.target.value)}
                  className="mt-1 border-border bg-input"
                />
              </div>
              <div>
                <Label className="flex items-center gap-1 text-sm text-muted-foreground">
                  Longitude
                  <Info className="size-3 text-muted-foreground" />
                </Label>
                <Input
                  value={longitude}
                  onChange={(event) => setLongitude(event.target.value)}
                  className="mt-1 border-border bg-input"
                />
              </div>
              <div>
                <Label className="flex items-center gap-1 text-sm text-muted-foreground">
                  Altitude
                  <Info className="size-3 text-muted-foreground" />
                </Label>
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    value={altitude}
                    onChange={(event) => setAltitude(event.target.value)}
                    className="border-border bg-input"
                  />
                  <span className="text-sm text-muted-foreground">m</span>
                </div>
              </div>
              <div>
                <Label className="flex items-center gap-1 text-sm text-muted-foreground">
                  Grounding
                  <Info className="size-3 text-muted-foreground" />
                </Label>
                <Select
                  value={groundingMode}
                  onValueChange={(value) => setGroundingMode(value as typeof groundingMode)}
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
            </CardContent>
          </Card>
        </CardContent>

        <div className="flex items-center justify-between gap-2 border-t border-border p-4">
          <span className="text-xs text-muted-foreground">
            Press ESC to close • ⌘S to save
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={resetPinPlacement} className="border-border">
              CANCEL
            </Button>
            <Button onClick={handleCreatePlacemark} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Save className="mr-2 size-4" />
              CREATE PLACEMARK
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
