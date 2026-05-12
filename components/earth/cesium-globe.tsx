'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { usePinStore } from '@/lib/pin-store'
import { MapPin } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Custom pin icon
const createPinIcon = (color: string) => {
  const svg = `
    <svg width="32" height="48" viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.16 0 0 7.16 0 16C0 28 16 48 16 48C16 48 32 28 32 16C32 7.16 24.84 0 16 0Z" fill="${color}"/>
      <circle cx="16" cy="16" r="8" fill="white"/>
    </svg>
  `
  return L.divIcon({
    html: svg,
    className: 'custom-pin-icon',
    iconSize: [32, 48],
    iconAnchor: [16, 48],
    popupAnchor: [0, -48],
  })
}

export function CesiumGlobe() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const [isLoaded, setIsLoaded] = useState(false)

  const {
    pins,
    isAddingPin,
    setIsAddingPin,
    setPendingPinLocation,
    setSelectedPin,
    setIsPinViewerOpen,
    setIsPinEditorOpen,
    setEditingPin,
  } = usePinStore()

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Create map
    const map = L.map(mapContainerRef.current, {
      center: [40.6901, -74.0393], // New York
      zoom: 4,
      zoomControl: true,
    })

    // Add tile layer - Using OpenStreetMap with darker style
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map)

    mapRef.current = map
    setIsLoaded(true)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Handle map click for adding pins
  useEffect(() => {
    if (!mapRef.current) return

    const map = mapRef.current

    const handleClick = (e: L.LeafletMouseEvent) => {
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
    if (!mapRef.current || !isLoaded) return

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

      if (marker) {
        // Update existing marker position
        marker.setLatLng([pin.latitude, pin.longitude])
        marker.setIcon(createPinIcon(pin.iconColor))
      } else {
        // Create new marker
        marker = L.marker([pin.latitude, pin.longitude], {
          icon: createPinIcon(pin.iconColor),
        })

        // Add tooltip with pin name
        marker.bindTooltip(pin.name, {
          permanent: true,
          direction: 'bottom',
          offset: [0, 10],
          className: 'pin-label-tooltip',
        })

        // Handle click
        marker.on('click', () => {
          setSelectedPin(pin)
          setIsPinViewerOpen(true)
        })

        marker.addTo(map)
        markersRef.current.set(pin.id, marker)
      }
    })
  }, [pins, isLoaded, setSelectedPin, setIsPinViewerOpen])

  return (
    <div className="relative size-full">
      {/* Map Container */}
      <div ref={mapContainerRef} className="size-full" />

      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Loading Map...</p>
          </div>
        </div>
      )}

      {/* Add Pin Mode Indicator */}
      {isAddingPin && isLoaded && (
        <div className="absolute bottom-4 left-1/2 z-[1000] -translate-x-1/2 rounded-lg border border-primary bg-primary/10 px-4 py-2 backdrop-blur-sm">
          <p className="flex items-center gap-2 text-sm text-primary">
            <MapPin className="size-4" />
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
        
        .pin-label-tooltip {
          background: rgba(0, 0, 0, 0.8) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 4px !important;
          color: white !important;
          font-size: 12px !important;
          padding: 4px 8px !important;
        }
        
        .pin-label-tooltip::before {
          border-bottom-color: rgba(0, 0, 0, 0.8) !important;
        }

        .leaflet-container {
          background: #1a1a2e !important;
        }
      `}</style>
    </div>
  )
}
