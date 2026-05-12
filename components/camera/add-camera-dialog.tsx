'use client'

import { useState } from 'react'
import { useCameraStore } from '@/lib/camera-store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Upload, Camera, ArrowLeft } from 'lucide-react'
import type { Camera as CameraType } from '@/types/camera'

const initialFormState = {
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
  thumbnail: '',
}

export function AddCameraDialog() {
  const { isAddDialogOpen, setIsAddDialogOpen, addCamera } = useCameraStore()
  const [formData, setFormData] = useState(initialFormState)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addCamera({
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
      thumbnail: formData.thumbnail,
    })
    setFormData(initialFormState)
  }

  const handleClose = () => {
    setIsAddDialogOpen(false)
    setFormData(initialFormState)
  }

  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogContent className="max-w-xl border-border bg-card">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-muted-foreground"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Camera className="size-5 text-primary" />
              Add Camera
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Add a new camera to the surveillance system
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Camera Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-accent">
                Camera Name<span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., CAM-01"
                required
                className="border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            {/* Camera Image */}
            <div className="space-y-2">
              <Label className="text-accent">
                Camera Image
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="Image URL"
                  className="border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary"
                />
                <Button type="button" variant="outline" size="icon" className="shrink-0 border-border">
                  <Upload className="size-4" />
                </Button>
              </div>
            </div>

            {/* IP */}
            <div className="space-y-2">
              <Label htmlFor="ip" className="text-accent">
                IP<span className="text-destructive">*</span>
              </Label>
              <Input
                id="ip"
                value={formData.ip}
                onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                placeholder="192.168.1.100"
                required
                className="border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-accent">
                Type<span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as CameraType['type'] })}
              >
                <SelectTrigger className="border-border bg-input text-foreground">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="border-border bg-card">
                  <SelectItem value="RTSP">RTSP</SelectItem>
                  <SelectItem value="ONVIF">ONVIF</SelectItem>
                  <SelectItem value="USB">USB</SelectItem>
                  <SelectItem value="HTTP">HTTP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* API Base URL */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="apiBaseUrl" className="text-accent">
                API Base URL<span className="text-destructive">*</span>
              </Label>
              <Input
                id="apiBaseUrl"
                value={formData.apiBaseUrl}
                onChange={(e) => setFormData({ ...formData, apiBaseUrl: e.target.value })}
                placeholder="/osc/commands/execute"
                required
                className="border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            {/* Port */}
            <div className="space-y-2">
              <Label htmlFor="port" className="text-accent">
                Port<span className="text-destructive">*</span>
              </Label>
              <Input
                id="port"
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                placeholder="554"
                required
                className="border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            {/* Camera ID */}
            <div className="space-y-2">
              <Label htmlFor="cameraId" className="text-accent">
                Camera ID<span className="text-destructive">*</span>
              </Label>
              <Input
                id="cameraId"
                value={formData.cameraId}
                onChange={(e) => setFormData({ ...formData, cameraId: e.target.value })}
                placeholder="admin"
                required
                className="border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            {/* Telnet Username */}
            <div className="space-y-2">
              <Label htmlFor="telnetUsername" className="text-accent">
                Telnet Username<span className="text-destructive">*</span>
              </Label>
              <Input
                id="telnetUsername"
                value={formData.telnetUsername}
                onChange={(e) => setFormData({ ...formData, telnetUsername: e.target.value })}
                placeholder="root"
                required
                className="border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            {/* Telnet Password */}
            <div className="space-y-2">
              <Label htmlFor="telnetPassword" className="text-accent">
                Telnet Password<span className="text-destructive">*</span>
              </Label>
              <Input
                id="telnetPassword"
                type="password"
                value={formData.telnetPassword}
                onChange={(e) => setFormData({ ...formData, telnetPassword: e.target.value })}
                placeholder="••••••••"
                required
                className="border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            {/* Camera Password */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="cameraPassword" className="text-accent">
                Camera Password<span className="text-destructive">*</span>
              </Label>
              <Input
                id="cameraPassword"
                type="password"
                value={formData.cameraPassword}
                onChange={(e) => setFormData({ ...formData, cameraPassword: e.target.value })}
                placeholder="••••••••"
                required
                className="border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-border text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
