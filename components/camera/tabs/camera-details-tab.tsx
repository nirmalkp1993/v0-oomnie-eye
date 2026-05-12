'use client'

import { useState, useEffect } from 'react'
import { useCameraStore } from '@/lib/camera-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, Camera } from 'lucide-react'
import type { Camera as CameraType } from '@/types/camera'
import Image from 'next/image'

export function CameraDetailsTab() {
  const { selectedCamera, updateCamera } = useCameraStore()
  const [formData, setFormData] = useState({
    name: '',
    ip: '',
    type: 'RTSP' as CameraType['type'],
    cameraId: '',
    port: '',
    apiBaseUrl: '',
    telnetUsername: '',
    telnetPassword: '',
    cameraPassword: '',
    mediaMtxUrl: '',
    uniqueIdentifier: '',
    thumbnail: '',
  })

  useEffect(() => {
    if (selectedCamera) {
      setFormData({
        name: selectedCamera.name,
        ip: selectedCamera.ip,
        type: selectedCamera.type,
        cameraId: selectedCamera.cameraId,
        port: selectedCamera.port.toString(),
        apiBaseUrl: selectedCamera.apiBaseUrl,
        telnetUsername: selectedCamera.telnetUsername,
        telnetPassword: selectedCamera.telnetPassword,
        cameraPassword: selectedCamera.cameraPassword,
        mediaMtxUrl: selectedCamera.mediaMtxUrl || '',
        uniqueIdentifier: selectedCamera.uniqueIdentifier || '',
        thumbnail: selectedCamera.thumbnail || '',
      })
    }
  }, [selectedCamera])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedCamera) {
      updateCamera(selectedCamera.id, {
        name: formData.name,
        ip: formData.ip,
        type: formData.type,
        cameraId: formData.cameraId,
        port: parseInt(formData.port) || 554,
        apiBaseUrl: formData.apiBaseUrl,
        telnetUsername: formData.telnetUsername,
        telnetPassword: formData.telnetPassword,
        cameraPassword: formData.cameraPassword,
        mediaMtxUrl: formData.mediaMtxUrl,
        uniqueIdentifier: formData.uniqueIdentifier,
        thumbnail: formData.thumbnail,
      })
    }
  }

  if (!selectedCamera) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Form */}
        <Card className="flex-1 border-border bg-card">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Camera Name */}
              <div className="space-y-2">
                <Label className="text-accent">Camera Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-border bg-input text-foreground focus:border-primary"
                />
              </div>

              {/* Camera ID */}
              <div className="space-y-2">
                <Label className="text-accent">Camera ID*</Label>
                <Input
                  value={formData.cameraId}
                  onChange={(e) => setFormData({ ...formData, cameraId: e.target.value })}
                  placeholder="Camera ID*"
                  className="border-border bg-input text-foreground focus:border-primary"
                />
              </div>

              {/* Camera Password */}
              <div className="space-y-2">
                <Label className="text-accent">Camera Password*</Label>
                <Input
                  type="password"
                  value={formData.cameraPassword}
                  onChange={(e) => setFormData({ ...formData, cameraPassword: e.target.value })}
                  placeholder="Camera Password*"
                  className="border-border bg-input text-foreground focus:border-primary"
                />
              </div>

              {/* MediaMTX URL */}
              <div className="space-y-2">
                <Label className="text-accent">MediaMTX URL</Label>
                <Input
                  value={formData.mediaMtxUrl}
                  onChange={(e) => setFormData({ ...formData, mediaMtxUrl: e.target.value })}
                  placeholder="https://www.google.com/html/123.mp4"
                  className="border-border bg-input text-foreground font-mono text-sm focus:border-primary"
                />
              </div>

              {/* Unique Identifier */}
              <div className="space-y-2">
                <Label className="text-accent">Unique Identifier</Label>
                <Input
                  value={formData.uniqueIdentifier}
                  onChange={(e) => setFormData({ ...formData, uniqueIdentifier: e.target.value })}
                  placeholder="stream_8298482j"
                  className="border-border bg-input text-foreground font-mono text-sm focus:border-primary"
                />
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label className="text-accent">Type*</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as CameraType['type'] })}
                >
                  <SelectTrigger className="border-border bg-input text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card">
                    <SelectItem value="RTSP">RTSP</SelectItem>
                    <SelectItem value="ONVIF">ONVIF</SelectItem>
                    <SelectItem value="USB">USB</SelectItem>
                    <SelectItem value="HTTP">HTTP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* IP */}
              <div className="space-y-2">
                <Label className="text-accent">IP</Label>
                <Input
                  value={formData.ip}
                  onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                  className="border-border bg-input text-foreground focus:border-primary"
                />
              </div>

              {/* API Base URL */}
              <div className="space-y-2">
                <Label className="text-accent">API Base URL*</Label>
                <Input
                  value={formData.apiBaseUrl}
                  onChange={(e) => setFormData({ ...formData, apiBaseUrl: e.target.value })}
                  className="border-border bg-input text-foreground font-mono text-sm focus:border-primary"
                />
              </div>

              {/* Telnet Username */}
              <div className="space-y-2">
                <Label className="text-accent">Telnet Username*</Label>
                <Input
                  value={formData.telnetUsername}
                  onChange={(e) => setFormData({ ...formData, telnetUsername: e.target.value })}
                  placeholder="Telnet username*"
                  className="border-border bg-input text-foreground focus:border-primary"
                />
              </div>

              {/* Telnet Password */}
              <div className="space-y-2">
                <Label className="text-accent">Telnet Password*</Label>
                <Input
                  type="password"
                  value={formData.telnetPassword}
                  onChange={(e) => setFormData({ ...formData, telnetPassword: e.target.value })}
                  placeholder="Telnet Password*"
                  className="border-border bg-input text-foreground focus:border-primary"
                />
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  variant="outline"
                  className="min-w-32 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Image Preview */}
        <Card className="w-full border-border bg-card lg:w-64">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="relative mb-4 size-48 overflow-hidden rounded-lg border border-border bg-muted">
              {formData.thumbnail ? (
                <Image
                  src={formData.thumbnail}
                  alt="Camera preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Camera className="size-16 text-muted-foreground/50" />
                </div>
              )}
            </div>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Camera Image Preview
            </p>
            <Button
              variant="outline"
              className="gap-2 border-border text-muted-foreground hover:text-foreground"
            >
              <Upload className="size-4" />
              Reupload image
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
