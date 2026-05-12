'use client'

import { useEffect, useRef, useState } from 'react'
import { usePinStore } from '@/lib/pin-store'
import { MapPin } from 'lucide-react'

// Statue of Liberty coordinates
const STATUE_OF_LIBERTY = {
  lat: 40.6892,
  lng: -74.0445,
}

export function CesiumGlobe() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())
  const [isLoaded, setIsLoaded] = useState(false)
  const [L, setL] = useState<any>(null)

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
      // Import CSS
      import('leaflet/dist/leaflet.css')
      setL(leaflet.default)
    })
  }, [])

  // Create pin icon function
  const createPinIcon = (color: string, name: string) => {
    if (!L) return null
    const svg = `
      <svg width="32" height="48" viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.16 0 0 7.16 0 16C0 28 16 48 16 48C16 48 32 28 32 16C32 7.16 24.84 0 16 0Z" fill="${color}"/>
        <circle cx="16" cy="16" r="8" fill="white"/>
        <circle cx="16" cy="16" r="4" fill="${color}"/>
      </svg>
    `
    return L.divIcon({
      html: `<div class="pin-wrapper">${svg}<span class="pin-name">${name}</span></div>`,
      className: 'custom-pin-icon',
      iconSize: [32, 48],
      iconAnchor: [16, 48],
      popupAnchor: [0, -48],
    })
  }

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !L) return

    // Create map centered on Statue of Liberty
    const map = L.map(mapContainerRef.current, {
      center: [STATUE_OF_LIBERTY.lat, STATUE_OF_LIBERTY.lng],
      zoom: 15,
      zoomControl: true,
      attributionControl: false,
    })

    // Use Esri World Imagery for satellite view
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
    }).addTo(map)

    // Add labels overlay for better context
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
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

  // Handle map click for adding pins
  useEffect(() => {
    if (!mapRef.current) return

    const map = mapRef.current

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

    map.on('click', handleClick)

    return () => {
      map.off('click', handleClick)
    }
  }, [isAddingPin, setPendingPinLocation])

  // Update cursor style when adding pin
  useEffect(() => {
    if (!mapContainerRef.current) return
    
    if (isAddingPin) {
      mapContainerRef.current.style.cursor = 'crosshair'
    } else {
      mapContainerRef.current.style.cursor = ''
    }
  }, [isAddingPin])

  // Update pins on the map
  useEffect(() => {
    if (!mapRef.current || !isLoaded || !L) return

    const map = mapRef.current

    // Remove markers that no longer exist
    markersRef.current.forEach((marker, pinId) => {
      if (!pins.find(p => p.id === pinId)) {
        marker.remove()
        markersRef.current.delete(pinId)
      }
    })

    // Add or update markers
    pins.forEach((pin) => {
      let marker = markersRef.current.get(pin.id)
      const icon = createPinIcon(pin.iconColor, pin.name)

      if (marker) {
        // Update existing marker position
        marker.setLatLng([pin.latitude, pin.longitude])
        if (icon) marker.setIcon(icon)
      } else if (icon) {
        // Create new marker
        marker = L.marker([pin.latitude, pin.longitude], { icon })

        // Handle click
        marker.on('click', () => {
          setSelectedPin(pin)
          setIsPinViewerOpen(true)
        })

        marker.addTo(map)
        markersRef.current.set(pin.id, marker)
      }
    })
  }, [pins, isLoaded, L, setSelectedPin, setIsPinViewerOpen])

  return (
    <div className="relative size-full">
      {/* Map Container */}
      <div ref={mapContainerRef} className="size-full" />

      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
          <div className="flex flex-col items-center gap-4">
            <div className="size-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="text-slate-300">Loading Earth View...</p>
          </div>
        </div>
      )}

      {/* Add Pin Mode Indicator */}
      {isAddingPin && isLoaded && (
        <div className="absolute bottom-6 left-1/2 z-[1000] -translate-x-1/2 rounded-lg border border-blue-500/50 bg-slate-900/90 px-5 py-3 shadow-xl backdrop-blur-sm">
          <p className="flex items-center gap-2 text-sm font-medium text-blue-400">
            <MapPin className="size-5" />
            Click anywhere on the map to place a camera pin
          </p>
        </div>
      )}

      {/* Custom styles */}
      <style jsx global>{`
        .custom-pin-icon {
          background: transparent !important;
          border: none !important;
        }
        
        .pin-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .pin-name {
          position: absolute;
          top: 52px;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 4px;
          color: white;
          font-size: 12px;
          font-weight: 500;
          padding: 4px 8px;
          pointer-events: none;
        }

        .leaflet-container {
          background: #0f172a !important;
          font-family: inherit;
        }
        
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3) !important;
        }
        
        .leaflet-control-zoom a {
          background: rgba(30, 41, 59, 0.95) !important;
          color: #94a3b8 !important;
          border: 1px solid rgba(71, 85, 105, 0.5) !important;
        }
        
        .leaflet-control-zoom a:hover {
          background: rgba(51, 65, 85, 0.95) !important;
          color: white !important;
        }

        .leaflet-marker-icon {
          transition: transform 0.2s ease;
        }
        
        .leaflet-marker-icon:hover {
          transform: scale(1.1);
          z-index: 1000 !important;
        }
      `}</style>
    </div>
  )
}
