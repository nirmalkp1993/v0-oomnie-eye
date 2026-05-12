'use client'

import { useCameraStore } from '@/lib/camera-store'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Settings, Play, Square } from 'lucide-react'

export function CameraListView() {
  const { 
    getFilteredCameras, 
    setSelectedCamera, 
    setCameraToDelete, 
    setIsDeleteDialogOpen,
    updateCamera
  } = useCameraStore()
  
  const cameras = getFilteredCameras()

  const handleDelete = (camera: typeof cameras[0], e: React.MouseEvent) => {
    e.stopPropagation()
    setCameraToDelete(camera)
    setIsDeleteDialogOpen(true)
  }

  const toggleStatus = (camera: typeof cameras[0], e: React.MouseEvent) => {
    e.stopPropagation()
    updateCamera(camera.id, { 
      status: camera.status === 'live' ? 'stopped' : 'live' 
    })
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border">
            <TableHead className="text-primary font-semibold">Name</TableHead>
            <TableHead className="text-primary font-semibold">IP</TableHead>
            <TableHead className="text-primary font-semibold">Type</TableHead>
            <TableHead className="text-primary font-semibold">Camera ID</TableHead>
            <TableHead className="text-primary font-semibold">Port</TableHead>
            <TableHead className="text-primary font-semibold">API Base URL</TableHead>
            <TableHead className="text-primary font-semibold">Telnet Username</TableHead>
            <TableHead className="text-primary font-semibold">Status</TableHead>
            <TableHead className="text-primary font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cameras.map((camera) => (
            <TableRow
              key={camera.id}
              className="cursor-pointer border-border hover:bg-primary/5"
              onClick={() => setSelectedCamera(camera)}
            >
              <TableCell className="font-medium text-foreground">{camera.name}</TableCell>
              <TableCell className="text-muted-foreground">{camera.ip}</TableCell>
              <TableCell>
                <Badge variant="outline" className="border-primary/30 text-primary">
                  {camera.type}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{camera.cameraId}</TableCell>
              <TableCell className="text-muted-foreground">{camera.port}</TableCell>
              <TableCell className="text-muted-foreground font-mono text-xs max-w-[200px] truncate">
                {camera.apiBaseUrl}
              </TableCell>
              <TableCell className="text-muted-foreground">{camera.telnetUsername}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={
                    camera.status === 'live'
                      ? 'bg-live/20 text-live border-live/30'
                      : camera.status === 'connecting'
                      ? 'bg-warning/20 text-warning border-warning/30'
                      : 'bg-stopped/20 text-stopped border-stopped/30'
                  }
                >
                  {camera.status === 'live' ? 'LIVE' : camera.status === 'connecting' ? 'CONNECTING' : 'STOPPED'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => toggleStatus(camera, e)}
                    className="text-muted-foreground hover:text-primary"
                  >
                    {camera.status === 'live' ? (
                      <Square className="size-4" />
                    ) : (
                      <Play className="size-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedCamera(camera)
                    }}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Settings className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => handleDelete(camera, e)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {cameras.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                No cameras found. Add a new camera to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
