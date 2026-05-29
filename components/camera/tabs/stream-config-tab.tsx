'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useCameraStore } from '@/lib/camera-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Typography,
} from '@mui/material'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import { cn } from '@/lib/utils'
import {
  Play,
  Square,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Settings,
  Camera as CameraIcon,
  Wifi,
  Signal,
  ChevronDown,
  Info,
} from 'lucide-react'
import type { Camera } from '@/types/camera'

/** Progressive MP4 sample used when `mediaMtxUrl` is absent (mock cameras). */
const DEMO_STREAM_SRC =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

function streamSource(camera: Camera): string {
  const u = camera.mediaMtxUrl?.trim()
  if (u && /^https?:\/\//i.test(u)) return u
  return DEMO_STREAM_SRC
}

function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function StreamConfigTab() {
  const { selectedCamera } = useCameraStore()
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(true)
  const [timeLabel, setTimeLabel] = useState('0:00 / 0:00')

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const preferredSrc = useMemo(
    () => (selectedCamera ? streamSource(selectedCamera) : ''),
    [selectedCamera],
  )
  const [activeSrc, setActiveSrc] = useState(preferredSrc)

  useEffect(() => {
    setActiveSrc(preferredSrc)
  }, [preferredSrc])

  const updateTimeLabel = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    setTimeLabel(`${formatClock(v.currentTime)} / ${formatClock(v.duration || 0)}`)
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (isPlaying) {
      void v.play().catch(() => setIsPlaying(false))
    } else {
      v.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    const v = videoRef.current
    if (v) v.muted = isMuted
  }, [isMuted])

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current
    if (!el) return
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch {
      /* ignore */
    }
  }, [])

  if (!selectedCamera) return null

  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      <Card
        elevation={0}
        variant="outlined"
        sx={{
          width: '100%',
          flex: 1,
          borderRadius: 2,
          boxShadow: (theme) => theme.shadows[1],
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardHeader
          title={
            <Typography variant="subtitle1" sx={{ color: 'primary.main', fontWeight: 600 }}>
              360 Stream Viewer
            </Typography>
          }
          subheader={
            <Typography variant="body2" color="text.secondary">
              Live preview and playback for this camera stream.
            </Typography>
          }
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {selectedCamera.status === 'live' && (
                <Badge className="bg-live text-white">
                  <span className="mr-1.5 size-2 animate-pulse rounded-full bg-white" />
                  LIVE
                </Badge>
              )}
              <Badge variant="outline" className="border-border text-muted-foreground">
                {selectedCamera.type}
              </Badge>
              <IconButton aria-label="Fullscreen" size="small" edge="end" onClick={toggleFullscreen}>
                <FullscreenIcon />
              </IconButton>
            </Box>
          }
          sx={{
            pb: 0,
            '& .MuiCardHeader-action': { alignSelf: 'center', mr: 0.5 },
          }}
        />
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', pt: 1, pb: 2, px: { xs: 2, sm: 3 } }}>
          <div
            ref={containerRef}
            className={cn(
              'relative aspect-video w-full max-w-full overflow-hidden bg-black',
              'max-h-[calc(100dvh-12rem)]',
            )}
          >
            <video
              ref={videoRef}
              className="absolute inset-0 size-full object-cover"
              src={activeSrc}
              poster={selectedCamera.thumbnail}
              playsInline
              loop
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={updateTimeLabel}
              onLoadedMetadata={updateTimeLabel}
              onError={() => {
                if (activeSrc !== DEMO_STREAM_SRC) setActiveSrc(DEMO_STREAM_SRC)
              }}
              onVolumeChange={() => {
                const v = videoRef.current
                if (v) setIsMuted(v.muted)
              }}
            />

            <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/70 via-transparent to-black/40" />

            {/* Collapsible stream info — top-left */}
            <Collapsible
              open={infoOpen}
              onOpenChange={setInfoOpen}
              className="absolute left-3 top-3 z-20 w-[min(100%-1.5rem,20rem)] max-w-[calc(100%-1.5rem)]"
            >
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 border-border bg-card/95 text-foreground shadow-sm backdrop-blur-sm hover:bg-card hover:text-foreground"
                >
                  <Info className="mr-1.5 size-3.5 opacity-90" />
                  Camera info
                  <ChevronDown
                    className={cn(
                      'ml-1 size-4 shrink-0 opacity-80 transition-transform duration-200',
                      infoOpen && 'rotate-180',
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
                <div className="mt-2 space-y-2 rounded-lg border border-white/12 bg-black/45 p-3 text-white shadow-lg backdrop-blur-md">
                  <StreamInfoRow
                    icon={<CameraIcon className="size-4 text-primary" />}
                    label="Camera Name"
                    value={selectedCamera.name}
                    iconWrapClassName="bg-primary/15"
                  />
                  <StreamInfoRow
                    icon={<Wifi className="size-4 text-primary" />}
                    label="IP Address"
                    value={selectedCamera.ip}
                    mono
                    iconWrapClassName="bg-primary/15"
                  />
                  <StreamInfoRow
                    icon={<Signal className="size-4 text-primary" />}
                    label="Port"
                    value={String(selectedCamera.port)}
                    mono
                    iconWrapClassName="bg-primary/15"
                  />
                  <div className="flex items-center gap-3 border-t border-white/10 pt-2">
                    <div
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-lg',
                        selectedCamera.status === 'live' ? 'bg-live/20' : 'bg-stopped/20',
                      )}
                    >
                      <div
                        className={cn(
                          'size-2.5 rounded-full',
                          selectedCamera.status === 'live'
                            ? 'bg-live animate-pulse'
                            : 'bg-stopped',
                        )}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-white/60">Status</p>
                      <p
                        className={cn(
                          'truncate font-semibold',
                          selectedCamera.status === 'live' ? 'text-live' : 'text-stopped',
                        )}
                      >
                        {selectedCamera.status === 'live' ? 'Live' : 'Stopped'}
                      </p>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Top-right: playback clock */}
            <div className="absolute right-3 top-3 z-20 rounded-md border border-white/15 bg-black/50 px-2.5 py-1 font-mono text-xs text-white/85 tabular-nums backdrop-blur-sm">
              {timeLabel}
            </div>

            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-white hover:bg-white/20"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Square className="size-5" />
                    ) : (
                      <Play className="size-5" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-white hover:bg-white/20"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? (
                      <VolumeX className="size-5" />
                    ) : (
                      <Volume2 className="size-5" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    aria-label="Stream settings"
                  >
                    <Settings className="size-5" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? (
                    <Minimize2 className="size-5" />
                  ) : (
                    <Maximize2 className="size-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Box>
  )
}

function StreamInfoRow({
  icon,
  label,
  value,
  mono,
  iconWrapClassName,
}: {
  icon: ReactNode
  label: string
  value: string
  mono?: boolean
  iconWrapClassName?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-lg',
          iconWrapClassName,
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-white/60">{label}</p>
        <p
          className={cn(
            'truncate font-semibold text-white',
            mono && 'font-mono text-sm',
          )}
        >
          {value}
        </p>
      </div>
    </div>
  )
}
