'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import { Box, Button, Typography } from '@mui/material'
import type { CameraThumbnailMarker } from '@/types/camera'

function getContainedImageRect(
  containerW: number,
  containerH: number,
  imageW: number,
  imageH: number,
) {
  if (containerW <= 0 || containerH <= 0 || imageW <= 0 || imageH <= 0) {
    return { displayW: containerW, displayH: containerH, offsetX: 0, offsetY: 0 }
  }
  const imageAspect = imageW / imageH
  const containerAspect = containerW / containerH
  if (imageAspect > containerAspect) {
    const displayW = containerW
    const displayH = containerW / imageAspect
    return { displayW, displayH, offsetX: 0, offsetY: (containerH - displayH) / 2 }
  }
  const displayH = containerH
  const displayW = containerH * imageAspect
  return { displayW, displayH, offsetX: (containerW - displayW) / 2, offsetY: 0 }
}

function clientToMarkerPercent(
  clientX: number,
  clientY: number,
  container: DOMRect,
  naturalW: number,
  naturalH: number,
): CameraThumbnailMarker | null {
  const localX = clientX - container.left
  const localY = clientY - container.top
  const { displayW, displayH, offsetX, offsetY } = getContainedImageRect(
    container.width,
    container.height,
    naturalW,
    naturalH,
  )
  const imgX = localX - offsetX
  const imgY = localY - offsetY
  if (imgX < 0 || imgY < 0 || imgX > displayW || imgY > displayH) return null
  return {
    xPercent: Math.max(0, Math.min(100, (imgX / displayW) * 100)),
    yPercent: Math.max(0, Math.min(100, (imgY / displayH) * 100)),
  }
}

function markerToContainerPercent(
  marker: CameraThumbnailMarker,
  containerW: number,
  containerH: number,
  naturalW: number,
  naturalH: number,
) {
  const { displayW, displayH, offsetX, offsetY } = getContainedImageRect(
    containerW,
    containerH,
    naturalW,
    naturalH,
  )
  const px = offsetX + (marker.xPercent / 100) * displayW
  const py = offsetY + (marker.yPercent / 100) * displayH
  return {
    left: (px / containerW) * 100,
    top: (py / containerH) * 100,
  }
}

export interface CameraThumbnailMarkerEditorProps {
  imageUrl: string
  marker: CameraThumbnailMarker | null | undefined
  onMarkerChange: (marker: CameraThumbnailMarker | null) => void
  minHeight?: number
}

export function CameraThumbnailMarkerEditor({
  imageUrl,
  marker,
  onMarkerChange,
  minHeight = 220,
}: CameraThumbnailMarkerEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 })
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 })
  const [dragging, setDragging] = useState(false)

  const updateContainerSize = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    setContainerSize({ w: el.clientWidth, h: el.clientHeight })
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    updateContainerSize()
    const ro = new ResizeObserver(() => updateContainerSize())
    ro.observe(el)
    return () => ro.disconnect()
  }, [updateContainerSize, imageUrl])

  const placeMarkerFromClient = useCallback(
    (clientX: number, clientY: number) => {
      const el = containerRef.current
      if (!el || naturalSize.w <= 0 || naturalSize.h <= 0) return
      const next = clientToMarkerPercent(
        clientX,
        clientY,
        el.getBoundingClientRect(),
        naturalSize.w,
        naturalSize.h,
      )
      if (next) onMarkerChange(next)
    },
    [naturalSize, onMarkerChange],
  )

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    placeMarkerFromClient(e.clientX, e.clientY)
    setDragging(true)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    placeMarkerFromClient(e.clientX, e.clientY)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragging) return
    setDragging(false)
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* already released */
    }
  }

  const markerStyle =
    marker && containerSize.w > 0 && naturalSize.w > 0
      ? markerToContainerPercent(marker, containerSize.w, containerSize.h, naturalSize.w, naturalSize.h)
      : null

  return (
    <Box>
      <Box
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        sx={{
          position: 'relative',
          minHeight,
          borderRadius: 2,
          overflow: 'hidden',
          border: '2px dashed',
          borderColor: 'divider',
          bgcolor: 'common.black',
          cursor: 'crosshair',
          touchAction: 'none',
          userSelect: 'none',
        }}
      >
        <Box
          component="img"
          src={imageUrl}
          alt=""
          onLoad={(e) => {
            const img = e.currentTarget
            setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
            updateContainerSize()
          }}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
          }}
        />
        {markerStyle ? (
          <Box
            sx={{
              position: 'absolute',
              left: `${markerStyle.left}%`,
              top: `${markerStyle.top}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 2,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              boxShadow: '0 2px 8px rgba(0,0,0,0.45)',
              border: '2px solid',
              borderColor: 'common.white',
            }}
          >
            <VideocamOutlinedIcon sx={{ fontSize: 26 }} />
          </Box>
        ) : null}
      </Box>

      <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1, minWidth: 160 }}>
          Click or drag on the image to place the camera icon.
        </Typography>
        {marker ? (
          <Button size="small" variant="text" color="inherit" onClick={() => onMarkerChange(null)}>
            Clear position
          </Button>
        ) : null}
      </Box>
    </Box>
  )
}

/** Overlay marker on a thumbnail using stored image-relative percentages. */
export function CameraThumbnailMarkerOverlay({
  marker,
  size = 28,
}: {
  marker: CameraThumbnailMarker | null | undefined
  size?: number
}) {
  if (!marker) return null
  return (
    <Box
      sx={{
        position: 'absolute',
        left: `${marker.xPercent}%`,
        top: `${marker.yPercent}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 2,
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 1,
        border: '2px solid',
        borderColor: 'common.white',
        pointerEvents: 'none',
      }}
    >
      <VideocamOutlinedIcon sx={{ fontSize: size * 0.55 }} />
    </Box>
  )
}
