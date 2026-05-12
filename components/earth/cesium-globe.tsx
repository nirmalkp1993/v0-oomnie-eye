'use client'

import { useEffect, useRef, useState } from 'react'

// Statue of Liberty coordinates
const STATUE_OF_LIBERTY = {
  lat: 40.6892,
  lng: -74.0445,
}

export function CesiumGlobe() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Dynamically import Leaflet (client-side only)
  useEffect(() => {
    import('leaflet').then((leaflet) => {
      import('leaflet/dist/leaflet.css')
      
      if (!mapContainerRef.current || mapRef.current) return

      const L = leaflet.default

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

      mapRef.current = map
      setIsLoaded(true)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <div className="relative size-full">
      <div ref={mapContainerRef} className="size-full" />

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
          <div className="flex flex-col items-center gap-4">
            <div className="size-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="text-slate-300">Loading Map...</p>
          </div>
        </div>
      )}

      <style jsx global>{`
        .leaflet-container {
          background: #0f172a !important;
        }
      `}</style>
    </div>
  )
}
