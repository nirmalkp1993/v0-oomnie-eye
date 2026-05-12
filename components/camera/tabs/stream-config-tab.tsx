'use client'

import { useState } from 'react'
import { useCameraStore } from '@/lib/camera-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Square, 
  Maximize2, 
  Volume2, 
  VolumeX,
  Settings,
  Camera,
  Wifi,
  Signal
} from 'lucide-react'
import Image from 'next/image'

export function StreamConfigTab() {
  const { selectedCamera } = useCameraStore()
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (!selectedCamera) return null

  return (
    <div className="space-y-6">
      {/* Main Stream Viewer */}
      <Card className="overflow-hidden border-border bg-card">
        <CardHeader className="border-b border-border pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Camera className="size-5" />
              360 Stream Viewer
            </CardTitle>
            <div className="flex items-center gap-2">
              {selectedCamera.status === 'live' && (
                <Badge className="bg-live text-white">
                  <span className="mr-1.5 size-2 animate-pulse rounded-full bg-white" />
                  LIVE
                </Badge>
              )}
              <Badge variant="outline" className="border-primary/30 text-primary">
                {selectedCamera.type}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Video Player */}
          <div className="relative aspect-video bg-black">
            {selectedCamera.thumbnail ? (
              <Image
                src={selectedCamera.thumbnail}
                alt={selectedCamera.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <Camera className="mx-auto size-16 text-muted-foreground/30" />
                  <p className="mt-2 text-muted-foreground">No stream available</p>
                </div>
              </div>
            )}

            {/* Stream Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

            {/* Top Info Bar */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
              <div className="flex items-center gap-4 text-white/80">
                <div className="flex items-center gap-1.5">
                  <Signal className="size-4" />
                  <span className="text-sm">1080p</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wifi className="size-4" />
                  <span className="text-sm">30 fps</span>
                </div>
              </div>
              <div className="text-sm text-white/60">
                {new Date().toLocaleTimeString()}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? (
                      <Square className="size-5" />
                    ) : (
                      <Play className="size-5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? (
                      <VolumeX className="size-5" />
                    ) : (
                      <Volume2 className="size-5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <Settings className="size-5" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="text-white hover:bg-white/20"
                >
                  <Maximize2 className="size-5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stream Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Camera className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Camera Name</p>
                <p className="font-semibold text-foreground">{selectedCamera.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Wifi className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">IP Address</p>
                <p className="font-mono font-semibold text-foreground">{selectedCamera.ip}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Signal className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Port</p>
                <p className="font-mono font-semibold text-foreground">{selectedCamera.port}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`flex size-10 items-center justify-center rounded-lg ${
                selectedCamera.status === 'live' ? 'bg-live/10' : 'bg-stopped/10'
              }`}>
                <div className={`size-3 rounded-full ${
                  selectedCamera.status === 'live' ? 'bg-live animate-pulse' : 'bg-stopped'
                }`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className={`font-semibold ${
                  selectedCamera.status === 'live' ? 'text-live' : 'text-stopped'
                }`}>
                  {selectedCamera.status === 'live' ? 'Live' : 'Stopped'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
