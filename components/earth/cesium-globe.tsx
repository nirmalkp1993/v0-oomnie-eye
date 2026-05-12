'use client'

import { useEffect, useRef, useState } from 'react'
import { usePinStore } from '@/lib/pin-store'
import { MapPin, Camera } from 'lucide-react'

// Statue of Liberty coordinates
const STATUE_OF_LIBERTY = {
  lat: 40.6892,
  lng: -74.0445,
}

export function CesiumGlobe() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [L, setL] = useState<any>(null)

  const { 
    pins, 
    isAddingPin, 
    setPendingPinLocation, 
    setSelectedPin,
    setIsPinViewerOpen,
    setIsPinEditorOpen,
    setEditingPin 
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
      if (isAddingPin) {
        const { lat, lng } = e.latlng
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

  // Render pin markers
  useEffect(() => {
    if (!mapRef.current || !L || !isLoaded) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add markers for each pin
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

      markersRef.current.push(marker)
    })
  }, [pins, L, isLoaded, setSelectedPin, setIsPinViewerOpen])

  return (
    <div className="relative size-full">
      <div ref={mapContainerRef} className="absolute inset-0 z-0 size-full" />

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
          <div className="flex flex-col items-center gap-4">
            <div className="size-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="text-slate-300">Loading Map...</p>
          </div>
        </div>
      )}

      {/* Pin Placement Indicator */}
      {isAddingPin && (
        <div className="fixed bottom-20 left-1/2 z-[9998] -translate-x-1/2 rounded-lg bg-orange-500 px-4 py-2 text-white shadow-lg">
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
          z-index: 10 !important;
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
      `}</style>
    </div>
  )
}
