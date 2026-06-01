'use client'

/**
 * Video player chrome aligned with dt_timemachine_construction_ui PatrolVideoPlayer /
 * Patrol360Player: black stage, top-right volume, seek bar (#2932e5), bottom control strip.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Box,
  CircularProgress,
  IconButton,
  Slider,
  Typography,
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import PanoramaHorizontalIcon from '@mui/icons-material/PanoramaHorizontal'
import ViewCarouselSharpIcon from '@mui/icons-material/ViewCarouselSharp'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import SyncIcon from '@mui/icons-material/Sync'
import { useVideoSource } from '../hooks/useVideoSource'
import { Video360Canvas } from './Video360Canvas'
import { resolveSourceType } from '../utils/resolveSourceType'

export type PatrolPlayerViewMode = '360' | 'flat'

export interface PatrolStyleVideoPlayerProps {
  src?: string
  poster?: string
  defaultViewMode?: PatrolPlayerViewMode
  defaultPlaying?: boolean
  /** Hide seek bar (e.g. live streams). */
  isLive?: boolean
  height?: number | string
  className?: string
  onError?: (error: Error) => void
}

const SEEK_BAR_COLOR = '#2932e5'
const ACTIVE_VIEW_COLOR = '#4CAF50'

export const PatrolStyleVideoPlayer: React.FC<PatrolStyleVideoPlayerProps> = ({
  src,
  poster,
  defaultViewMode = '360',
  defaultPlaying = true,
  isLive = false,
  height = 400,
  className,
  onError,
}) => {
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null)
  const [viewMode, setViewMode] = useState<PatrolPlayerViewMode>(defaultViewMode)
  const [isPlaying, setIsPlaying] = useState(defaultPlaying)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [autoRotate, setAutoRotate] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const playerContainerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const srcTrimmed = src?.trim() ?? ''
  const hasSource = Boolean(srcTrimmed)

  useVideoSource({
    video: videoEl,
    src: srcTrimmed || undefined,
    sourceType: 'auto',
    onError: (e) => {
      setError(e.message)
      onError?.(e)
    },
  })

  useEffect(() => {
    setViewMode(defaultViewMode)
  }, [defaultViewMode, srcTrimmed])

  useEffect(() => {
    const v = videoEl
    if (!v || !hasSource) {
      setIsLoading(!hasSource ? false : true)
      return
    }

    setIsLoading(true)
    setError(null)

    const markReady = () => setIsLoading(false)
    const onMeta = () => {
      setDuration(Number.isFinite(v.duration) ? v.duration : 0)
      markReady()
    }
    const onTime = () => setCurrentTime(v.currentTime)
    const onVidError = () => {
      setIsLoading(false)
      const msg = v.error?.message || 'Video failed to load'
      setError(msg)
      onError?.(new Error(msg))
    }

    if (v.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) markReady()

    v.addEventListener('loadeddata', markReady)
    v.addEventListener('canplay', markReady)
    v.addEventListener('loadedmetadata', onMeta)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('error', onVidError)

    return () => {
      v.removeEventListener('loadeddata', markReady)
      v.removeEventListener('canplay', markReady)
      v.removeEventListener('loadedmetadata', onMeta)
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('error', onVidError)
    }
  }, [videoEl, hasSource, onError])

  useEffect(() => {
    const v = videoEl
    if (!v) return
    v.volume = volume
    v.muted = isMuted
  }, [videoEl, volume, isMuted])

  useEffect(() => {
    const v = videoEl
    if (!v) return
    if (isPlaying) {
      void v.play().catch(() => setIsPlaying(false))
    } else {
      v.pause()
    }
  }, [videoEl, isPlaying])

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p)
  }, [])

  const handleToggleMute = useCallback(() => {
    setIsMuted((m) => !m)
  }, [])

  const handleVolumeChange = useCallback((_: unknown, value: number | number[]) => {
    const v = Array.isArray(value) ? (value[0] ?? 0) : value
    setVolume(v)
    if (v > 0) setIsMuted(false)
  }, [])

  const handleSeek = useCallback((_: unknown, value: number | number[]) => {
    const t = Array.isArray(value) ? (value[0] ?? 0) : value
    setCurrentTime(t)
    if (videoEl) videoEl.currentTime = t
  }, [videoEl])

  const handleToggleFullscreen = useCallback(async () => {
    const el = playerContainerRef.current
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

  const showSeekBar = !isLive && duration > 0 && Number.isFinite(duration)

  if (!hasSource) {
    return (
      <Box
        className={className}
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#000',
          color: '#6B7280',
          borderRadius: 2,
        }}
      >
        <Typography variant="body2">No stream URL configured</Typography>
      </Box>
    )
  }

  const is360 = viewMode === '360'
  const sourceKind = resolveSourceType(srcTrimmed, 'auto')

  return (
    <Box
      ref={playerContainerRef}
      className={className}
      sx={{
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        height,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#000',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        borderRadius: 2,
      }}
    >
      {/* Volume — top right (patrol) */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 16,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'rgba(0, 0, 0, 0.6)',
          borderRadius: 2,
          p: 1,
          maxWidth: 'calc(100% - 32px)',
        }}
        onMouseEnter={() => setShowVolumeSlider(true)}
        onMouseLeave={() => setShowVolumeSlider(false)}
      >
        <IconButton onClick={handleToggleMute} sx={{ color: '#fff' }} title={isMuted ? 'Unmute' : 'Mute'}>
          {isMuted || volume === 0 ? <VolumeOffIcon /> : <VolumeUpIcon />}
        </IconButton>
        {showVolumeSlider ? (
          <Slider
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            min={0}
            max={1}
            step={0.01}
            orientation="vertical"
            sx={{
              height: 100,
              color: '#fff',
              '& .MuiSlider-thumb': { color: '#fff' },
              '& .MuiSlider-track': { color: '#fff' },
              '& .MuiSlider-rail': { color: 'rgba(255, 255, 255, 0.3)' },
            }}
          />
        ) : null}
      </Box>

      {/* Video stage */}
      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          width: '100%',
          minWidth: 0,
          minHeight: 0,
          cursor: is360 ? 'grab' : 'default',
        }}
        onClick={!is360 ? handlePlayPause : undefined}
      >
        <Box
          component="video"
          ref={(el) => setVideoEl(el)}
          playsInline
          crossOrigin={is360 ? 'anonymous' : undefined}
          poster={poster}
          loop={isLive}
          preload="metadata"
          sx={{
            display: is360 ? 'none' : 'block',
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
          }}
        />

        {is360 && videoEl ? (
          <Video360Canvas video={videoEl} active autoRotate={autoRotate} />
        ) : null}

        {isLoading ? (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#fff',
            }}
          >
            <CircularProgress sx={{ color: '#fff' }} />
          </Box>
        ) : null}

        {error ? (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#ff4444',
              textAlign: 'center',
              p: 2,
            }}
          >
            <Typography variant="body2">{error}</Typography>
          </Box>
        ) : null}
      </Box>

      {/* Seek bar */}
      {showSeekBar ? (
        <Box sx={{ px: 2, pt: 1, pb: 0.5, bgcolor: 'rgba(0, 0, 0, 0.8)', flexShrink: 0 }}>
          <Slider
            min={0}
            max={duration}
            value={Math.min(currentTime, duration)}
            step={0.1}
            onChange={handleSeek}
            disabled={isLoading || Boolean(error)}
            sx={{
              mt: 1,
              height: 5,
              color: SEEK_BAR_COLOR,
              '& .MuiSlider-thumb': { width: 12, height: 12 },
              '& .MuiSlider-rail': { opacity: 0.3, backgroundColor: 'white' },
            }}
          />
        </Box>
      ) : null}

      {/* Bottom controls */}
      <Box
        sx={{
          bgcolor: 'rgba(0, 0, 0, 0.8)',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexShrink: 0,
          width: '100%',
          minWidth: 0,
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, flex: 1 }}>
          {is360 ? (
            <IconButton
              onClick={() => setAutoRotate((r) => !r)}
              disabled={isLoading || Boolean(error)}
              sx={{
                color: autoRotate ? ACTIVE_VIEW_COLOR : '#fff',
                flexShrink: 0,
                '&:disabled': { color: 'rgba(255, 255, 255, 0.3)' },
              }}
              title={autoRotate ? 'Pause auto rotation' : 'Start auto rotation'}
            >
              <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                <SyncIcon sx={{ fontSize: '1.5em' }} />
                {autoRotate ? (
                  <PauseIcon
                    sx={{
                      position: 'absolute',
                      fontSize: '0.6em',
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                      borderRadius: '50%',
                      p: 0.2,
                    }}
                  />
                ) : (
                  <PlayArrowIcon
                    sx={{
                      position: 'absolute',
                      fontSize: '0.6em',
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                      borderRadius: '50%',
                      p: 0.2,
                      ml: 0.1,
                    }}
                  />
                )}
              </Box>
            </IconButton>
          ) : null}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              borderLeft: is360 ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
              pl: is360 ? 2 : 0,
            }}
          >
            <IconButton
              onClick={handlePlayPause}
              disabled={isLoading || Boolean(error)}
              sx={{
                color: '#fff',
                '&:disabled': { color: 'rgba(255, 255, 255, 0.3)' },
              }}
            >
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
          </Box>

          {sourceKind !== 'mp4' && (
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, ml: 1 }}>
              {isLive ? 'Live' : viewMode === '360' ? '360°' : 'Flat'}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, flexShrink: 0 }}>
          <IconButton
            onClick={() => setViewMode('360')}
            sx={{ color: viewMode === '360' ? ACTIVE_VIEW_COLOR : '#fff' }}
            title="Normal View (360)"
          >
            <PanoramaHorizontalIcon />
          </IconButton>
          <IconButton
            onClick={() => setViewMode('flat')}
            sx={{ color: viewMode === 'flat' ? ACTIVE_VIEW_COLOR : '#fff' }}
            title="Flat Mode"
          >
            <ViewCarouselSharpIcon />
          </IconButton>
          <IconButton
            onClick={handleToggleFullscreen}
            sx={{ color: '#fff' }}
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}
