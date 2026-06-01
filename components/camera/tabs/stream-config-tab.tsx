'use client'

import { useEffect, useMemo, useState } from 'react'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import { Box, Chip } from '@mui/material'
import { useCameraStore } from '@/lib/camera-store'
import { PlacemarkSettingsCard } from '@/src/components/earth/placemark-card/placemark-settings-card'
import { EARTH_DIALOG_SECTION_ACCENTS } from '@/src/components/modals/earth-dialog-constants'
import { PatrolStyleVideoPlayer } from '@/src/features/video-player'
import type { Camera } from '@/types/camera'

const DEMO_STREAM_SRC =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

function streamSource(camera: Camera): string {
  const u = camera.mediaMtxUrl?.trim()
  if (u && /^https?:\/\//i.test(u)) return u
  return DEMO_STREAM_SRC
}

export function StreamConfigTab() {
  const { selectedCamera } = useCameraStore()
  const [fallbackSrc, setFallbackSrc] = useState<string | null>(null)

  const preferredSrc = useMemo(
    () => (selectedCamera ? streamSource(selectedCamera) : ''),
    [selectedCamera],
  )

  useEffect(() => {
    setFallbackSrc(null)
  }, [selectedCamera?.id, preferredSrc])

  const playbackSrc = fallbackSrc ?? preferredSrc

  if (!selectedCamera) return null

  const isDemoFallback = playbackSrc === DEMO_STREAM_SRC && preferredSrc !== DEMO_STREAM_SRC

  return (
    <PlacemarkSettingsCard
      title="360 Stream Viewer"
      tooltip="Live preview and playback for this camera stream"
      headerIcon={<VideocamOutlinedIcon />}
      accentColor={EARTH_DIALOG_SECTION_ACCENTS.primary}
      action={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {selectedCamera.status === 'live' ? (
            <Chip label="LIVE" size="small" color="success" sx={{ fontWeight: 700 }} />
          ) : null}
          <Chip label={selectedCamera.type} size="small" variant="outlined" />
        </Box>
      }
    >
      <PatrolStyleVideoPlayer
        key={`${selectedCamera.id}-${playbackSrc}`}
        src={playbackSrc}
        poster={selectedCamera.thumbnail}
        defaultViewMode="360"
        defaultPlaying
        isLive={selectedCamera.status === 'live' && !isDemoFallback}
        height={{ xs: 320, sm: 400 }}
        onError={() => {
          if (preferredSrc !== DEMO_STREAM_SRC) setFallbackSrc(DEMO_STREAM_SRC)
        }}
      />
    </PlacemarkSettingsCard>
  )
}
