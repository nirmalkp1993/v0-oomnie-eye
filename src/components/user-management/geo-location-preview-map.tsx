'use client'

import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useEffect, useRef, useState } from 'react'

export interface GeoMapPin {
  id: string
  name: string
  latitude: number
  longitude: number
}

export interface GeoMapFocusTarget {
  id: string
  name: string
  latitude: number
  longitude: number
  zoom: number
}

interface GeoLocationPreviewMapProps {
  focusTarget: GeoMapFocusTarget | null
  pins: GeoMapPin[]
  height?: number
}

const DEFAULT_HEIGHT = 360
const PIN_SIZE = 36
const WORLD_VIEW = { lat: 20, lng: 0, zoom: 2 }

function buildPinHtml(name: string, size = PIN_SIZE, emphasized = false): string {
  const bg = emphasized ? '#e53935' : '#1976d2'
  const scale = emphasized ? 'scale(1.08)' : 'scale(1)'
  return `
    <motionless class="geo-access-pin" style="
      display: flex;
      flex-direction: column;
      align-items: center;
      pointer-events: none;
      transform: translate(-50%, -100%) ${scale};
    ">
      <motionless style="
        width: ${size}px;
        height: ${size}px;
        background: ${bg};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.35);
        border: 2px solid white;
      ">
        <svg style="
          transform: rotate(45deg);
          width: ${size * 0.5}px;
          height: ${size * 0.5}px;
          color: white;
        " viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </motionless>
      ${
        name
          ? `<motionless style="
        margin-top: 4px;
        padding: 2px 8px;
        background: rgba(0,0,0,0.78);
        color: white;
        font-size: 12px;
        border-radius: 4px;
        white-space: nowrap;
        max-width: 140px;
        overflow: hidden;
        text-overflow: ellipsis;
      ">${name}</motionless>`
          : ''
      }
    </motionless>
  `.replaceAll('motionless', 'div')
}

export function GeoLocationPreviewMap({ focusTarget, pins, height = DEFAULT_HEIGHT }: GeoLocationPreviewMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [L, setL] = useState<any>(null)

  useEffect(() => {
    import('leaflet').then((leaflet) => {
      import('leaflet/dist/leaflet.css')
      setL(leaflet)
    })
  }, [])

  useEffect(() => {
    if (!L || !mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: [WORLD_VIEW.lat, WORLD_VIEW.lng],
      zoom: WORLD_VIEW.zoom,
      zoomControl: true,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: true,
    })

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
    }).addTo(map)

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19 }
    ).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    mapRef.current = map
    setIsLoaded(true)

    const resizeTimer = window.setTimeout(() => map.invalidateSize(), 200)

    return () => {
      window.clearTimeout(resizeTimer)
      map.remove()
      mapRef.current = null
    }
  }, [L])

  useEffect(() => {
    if (!mapRef.current || !isLoaded) return
    const timer = window.setTimeout(() => mapRef.current?.invalidateSize(), 150)
    return () => window.clearTimeout(timer)
  }, [focusTarget, pins, isLoaded, height])

  useEffect(() => {
    if (!mapRef.current || !L || !isLoaded || !focusTarget) return

    mapRef.current.flyTo([focusTarget.latitude, focusTarget.longitude], focusTarget.zoom, {
      duration: 1.2,
    })
  }, [focusTarget, L, isLoaded])

  useEffect(() => {
    if (!mapRef.current || !L || !isLoaded) return

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    const focusId = focusTarget?.id

    pins.forEach((pin) => {
      const emphasized = pin.id === focusId
      const iconHtml = buildPinHtml(pin.name, emphasized ? PIN_SIZE + 4 : PIN_SIZE, emphasized)
      const iconSize = emphasized ? PIN_SIZE + 4 : PIN_SIZE

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'geo-access-pin-icon',
        iconSize: [iconSize, iconSize + (pin.name ? 28 : 8)],
        iconAnchor: [iconSize / 2, iconSize + (pin.name ? 24 : 8)],
      })

      const marker = L.marker([pin.latitude, pin.longitude], { icon: customIcon, interactive: false }).addTo(
        mapRef.current!
      )
      markersRef.current.push(marker)
    })
  }, [pins, focusTarget?.id, L, isLoaded])

  return (
    <Box
      className="geo-location-preview-map"
      sx={{
        height,
        borderRadius: 2,
        overflow: 'hidden',
        border: (t) => `1px solid ${t.palette.divider}`,
        bgcolor: '#0f172a',
        position: 'relative',
        boxShadow: (t) => `0 4px 14px ${alpha(t.palette.common.black, 0.08)}`,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 2,
          px: 1.25,
          py: 0.75,
          bgcolor: (t) => alpha(t.palette.common.black, 0.55),
          backdropFilter: 'blur(6px)',
        }}
      >
        <Typography variant="caption" color="common.white" fontWeight={600}>
          {focusTarget ? focusTarget.name : 'Search or select a location to preview on the map'}
        </Typography>
      </Box>

      <Box ref={mapContainerRef} sx={{ position: 'absolute', inset: 0, zIndex: 1 }} />

      {!isLoaded ? (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#0f172a',
          }}
        >
          <Typography variant="body2" color="grey.400">
            Loading map…
          </Typography>
        </Box>
      ) : null}

      <style jsx global>{`
        .geo-access-pin-icon {
          background: transparent !important;
          border: none !important;
        }
        .geo-location-preview-map .leaflet-container {
          background: #0f172a !important;
          font-family: inherit;
        }
        .geo-location-preview-map .leaflet-control-zoom a {
          background: rgba(30, 41, 59, 0.92) !important;
          color: #e2e8f0 !important;
          border: 1px solid rgba(71, 85, 105, 0.5) !important;
        }
      `}</style>
    </Box>
  )
}
