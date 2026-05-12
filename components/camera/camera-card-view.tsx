'use client'

import { useCameraStore } from '@/lib/camera-store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Settings, MonitorPlay } from 'lucide-react'
import Image from 'next/image'

export function CameraCardView() {
  const { getFilteredCameras, setSelectedCamera } = useCameraStore()
  const cameras = getFilteredCameras()

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cameras.map((camera) => (
        <Card
          key={camera.id}
          className="group cursor-pointer overflow-hidden border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
          onClick={() => setSelectedCamera(camera)}
        >
          <div className="relative aspect-video overflow-hidden bg-muted">
            {camera.thumbnail ? (
              <Image
                src={camera.thumbnail}
                alt={camera.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <MonitorPlay className="size-12 text-muted-foreground/50" />
              </div>
            )}
            
            {/* Status Badge */}
            <Badge
              className={`absolute top-2 right-2 text-[10px] font-bold uppercase ${
                camera.status === 'live'
                  ? 'bg-live text-white'
                  : camera.status === 'connecting'
                  ? 'bg-warning text-warning-foreground'
                  : 'bg-stopped text-white'
              }`}
            >
              {camera.status === 'live' ? 'LIVE' : camera.status === 'connecting' ? 'CONNECTING' : 'STOPPED'}
            </Badge>
            
            {/* Live indicator */}
            {camera.status === 'live' && (
              <div className="absolute top-2.5 right-[52px] flex items-center gap-1">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-live opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-live"></span>
                </span>
              </div>
            )}

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Camera name overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">{camera.name}</h3>
                  <p className="text-xs text-white/70">{camera.ip}</p>
                </div>
              </div>
            </div>
          </div>
          
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                  <MonitorPlay className="mr-1 size-3" />
                  {camera.type}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedCamera(camera)
                }}
              >
                <Settings className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {cameras.length === 0 && (
        <div className="col-span-full flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
          <div className="text-center">
            <MonitorPlay className="mx-auto size-12 text-muted-foreground/50" />
            <p className="mt-2 text-muted-foreground">No cameras found</p>
            <p className="text-sm text-muted-foreground/70">Add a new camera to get started</p>
          </div>
        </div>
      )}
    </div>
  )
}
