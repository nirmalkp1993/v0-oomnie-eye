'use client'

import { useEffect, useRef, useState } from 'react'
import { usePinStore } from '@/lib/pin-store'
import { useFilteredDemoPins } from '@/hooks/use-dock-pin-filter'
import { mockEarthDockPinToCameraPin } from '@/lib/mock-earth-dock-pin-to-camera-pin'
import type { MockEarthDockPin } from '@/lib/mock-earth-dock-pins'
import { Camera } from 'lucide-react'

// Statue of Liberty coordinates
const STATUE_OF_LIBERTY = {
  lat: 40.6892,
  lng: -74.0445,
}

const DEMO_PIN_COLORS: Record<MockEarthDockPin['type'], string> = {
  place: '#3b82f6',
  camera: '#f59e0b',
  patrol: '#a855f7',
  assets: '#22c55e',
  iot: '#06b6d4',
}

function demoDockPinGlyphSvg(type: MockEarthDockPin['type']): string {
  const s = (body: string) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
  switch (type) {
    case 'place':
      return s('<path d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z"/><circle cx="12" cy="10" r="2.2"/>')
    case 'camera':
      return s('<path d="M4 7h3l2-2h6l2 2h3a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z"/><circle cx="12" cy="13" r="3.2"/>')
    case 'patrol':
      // Route-style path + solid waypoint nodes (aligned with Lucide `Route` / patrol corridor metaphor)
      return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="19" r="3" fill="white"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" fill="none" stroke="white" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"/><circle cx="18" cy="5" r="3" fill="white"/></svg>`
    case 'assets':
      return s('<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/>')
    case 'iot':
      return s('<path d="M5 12.55a11 11 0 0114.08 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><path d="M12 20h.01"/>')
    default:
      return s('<circle cx="12" cy="12" r="3"/>')
  }
}

function buildDemoDockMarkerHtml(pin: MockEarthDockPin, size: number): string {
  const bg = DEMO_PIN_COLORS[pin.type]
  const glyph = demoDockPinGlyphSvg(pin.type)
  const statusDot =
    pin.status === 'active' ? '#4ade80' : pin.status === 'offline' ? '#f87171' : '#fbbf24'
  return `
    <div class="demo-dock-pin pin-marker" style="
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transform: translate(-50%, -100%);
    ">
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        background: ${bg};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.45);
        border: 2px solid rgba(255,255,255,0.95);
      ">
        <span style="
          position: absolute; top: -2px; right: -2px;
          width: 8px; height: 8px; border-radius: 50%;
          background: ${statusDot}; border: 1px solid rgba(0,0,0,0.35);
        "></span>
        <div style="transform: rotate(45deg); width: ${size * 0.52}px; height: ${size * 0.52}px;">
          ${glyph}
        </div>
      </div>
      <div style="
        margin-top: 4px;
        padding: 2px 8px;
        background: rgba(0,0,0,0.78);
        color: white;
        font-size: 12px;
        border-radius: 4px;
        white-space: nowrap;
        max-width: 160px;
        overflow: hidden;
        text-overflow: ellipsis;
      ">${pin.name}</div>
    </div>
  `
}

export function CesiumGlobe() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const userMarkersRef = useRef<any[]>([])
  const demoMarkersRef = useRef<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [L, setL] = useState<any>(null)

  const filteredDemoPins = useFilteredDemoPins()

  const {
    pins,
    isAddingPin,
    setPendingPinLocation,
    setSelectedPin,
    setIsPinViewerOpen,
  } = usePinStore()

  // Dynamically import Leaflet (client-side only)
  useEffect(() => {
    import('leaflet').then((leaflet) => {
      import('leaflet/dist/leaflet.css')
      setL(leaflet.default)
    })
  }, [])

  // Initialize map
  useEffect(() => {
    if (!L || !mapContainerRef.current || mapRef.current) return

    // Create map centered on Statue of Liberty
    const map = L.map(mapContainerRef.current, {
      center: [STATUE_OF_LIBERTY.lat, STATUE_OF_LIBERTY.lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: true,
    })

    // Use Esri World Imagery for satellite view
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
    }).addTo(map)

    // Add labels overlay for better context
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
    }).addTo(map)

    // Add zoom control at bottom right
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map)

    mapRef.current = map
    setIsLoaded(true)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [L])

  // Handle map clicks for pin placement
  useEffect(() => {
    if (!mapRef.current || !L) return

    const handleClick = (e: any) => {
      console.log('[v0] Map clicked, isAddingPin:', isAddingPin)
      if (isAddingPin) {
        const { lat, lng } = e.latlng
        console.log('[v0] Setting pending pin location:', lat, lng)
        setPendingPinLocation({
          latitude: lat,
          longitude: lng,
          altitude: 50,
        })
      }
    }

    mapRef.current.on('click', handleClick)

    return () => {
      if (mapRef.current) {
        mapRef.current.off('click', handleClick)
      }
    }
  }, [isAddingPin, setPendingPinLocation, L])

  // Update cursor when adding pin
  useEffect(() => {
    if (!mapContainerRef.current) return
    mapContainerRef.current.style.cursor = isAddingPin ? 'crosshair' : 'grab'
  }, [isAddingPin])

  // User pins from store (unchanged behavior)
  useEffect(() => {
    if (!mapRef.current || !L || !isLoaded) return

    userMarkersRef.current.forEach((marker) => marker.remove())
    userMarkersRef.current = []

    pins.forEach((pin) => {
      const iconHtml = `
        <div class="pin-marker" style="
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transform: translate(-50%, -100%);
        ">
          <div style="
            width: ${pin.iconSize || 40}px;
            height: ${pin.iconSize || 40}px;
            background: ${pin.iconColor || '#2196F3'};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            border: 2px solid white;
          ">
            <svg style="
              transform: rotate(45deg);
              width: ${(pin.iconSize || 40) * 0.5}px;
              height: ${(pin.iconSize || 40) * 0.5}px;
              color: white;
            " viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              ${pin.iconType === 'camera'
          ? '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>'
          : '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'
        }
            </svg>
          </div>
          <div style="
            margin-top: 4px;
            padding: 2px 8px;
            background: rgba(0,0,0,0.75);
            color: white;
            font-size: ${pin.labelSize || 14}px;
            border-radius: 4px;
            white-space: nowrap;
          ">${pin.name}</div>
        </div>
      `

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-pin-icon',
        iconSize: [pin.iconSize || 40, (pin.iconSize || 40) + 24],
        iconAnchor: [(pin.iconSize || 40) / 2, (pin.iconSize || 40) + 24],
      })

      const marker = L.marker([pin.latitude, pin.longitude], { icon: customIcon })
        .addTo(mapRef.current)
        .on('click', () => {
          setSelectedPin(pin)
          setIsPinViewerOpen(true)
        })

      userMarkersRef.current.push(marker)
    })
  }, [pins, L, isLoaded, setSelectedPin, setIsPinViewerOpen])

  // Demo-only dock pins: separate layer; filter updates without touching user markers or map view
  useEffect(() => {
    if (!mapRef.current || !L || !isLoaded) return

    demoMarkersRef.current.forEach((m) => m.remove())
    demoMarkersRef.current = []

    const demoSize = 38
    filteredDemoPins.forEach((pin) => {
      const iconHtml = buildDemoDockMarkerHtml(pin, demoSize)
      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-pin-icon demo-dock-pin-icon',
        iconSize: [demoSize, demoSize + 24],
        iconAnchor: [demoSize / 2, demoSize + 24],
      })

      const marker = L.marker([pin.latitude, pin.longitude], { icon: customIcon })
        .addTo(mapRef.current)
        .on('click', () => {
          setSelectedPin(mockEarthDockPinToCameraPin(pin))
          setIsPinViewerOpen(true)
        })

      demoMarkersRef.current.push(marker)
    })
  }, [filteredDemoPins, L, isLoaded, setSelectedPin, setIsPinViewerOpen])

  return (
    <div className="absolute inset-0">
      {/* Map container with lower z-index */}
      <div ref={mapContainerRef} className="absolute inset-0" style={{ zIndex: 1 }} />

      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900" style={{ zIndex: 2 }}>
          <div className="flex flex-col items-center gap-4">
            <div className="size-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="text-slate-300">Loading Map...</p>
          </div>
        </div>
      )}

      {/* Pin Placement Indicator */}
      {isAddingPin && (
        <div
          className="absolute bottom-32 left-1/2 z-[1005] -translate-x-1/2 rounded-lg bg-orange-500 px-4 py-2 text-white shadow-lg"
        >
          <div className="flex items-center gap-2">
            <Camera className="size-4" />
            <span className="text-sm font-medium">Click anywhere on the map to place a camera pin</span>
          </div>
        </div>
      )}

      <style jsx global>{`
        .leaflet-container {
          background: #0f172a !important;
          z-index: 1 !important;
        }
        .leaflet-pane {
          z-index: 1 !important;
        }
        .leaflet-top, .leaflet-bottom {
          z-index: 500 !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          margin-right: 12px !important;
          margin-bottom: 12px !important;
        }
        .leaflet-control-zoom a {
          background: rgba(30, 41, 59, 0.9) !important;
          color: #e2e8f0 !important;
          border: 1px solid rgba(71, 85, 105, 0.5) !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
          font-size: 16px !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(51, 65, 85, 0.9) !important;
        }
        .leaflet-control-zoom-in {
          border-radius: 6px 6px 0 0 !important;
        }
        .leaflet-control-zoom-out {
          border-radius: 0 0 6px 6px !important;
        }
        .custom-pin-icon {
          background: transparent !important;
          border: none !important;
        }
        .pin-marker:hover {
          transform: translate(-50%, -100%) scale(1.1);
          transition: transform 0.2s ease;
        }
        .demo-dock-pin-icon {
          transition: opacity 0.16s ease-out;
        }
      `}</style>
    </div>
  )
}
