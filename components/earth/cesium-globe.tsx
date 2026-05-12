'use client'

import { useEffect, useRef, useState } from 'react'
import { usePinStore } from '@/lib/pin-store'
import { MapPin } from 'lucide-react'

// Cesium types for TypeScript
declare global {
  interface Window {
    Cesium: typeof import('cesium')
  }
}

export function CesiumGlobe() {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [cesiumReady, setCesiumReady] = useState(false)

  const {
    pins,
    isAddingPin,
    setIsAddingPin,
    setPendingPinLocation,
    selectedPin,
    setSelectedPin,
    setIsPinViewerOpen,
    setIsPinEditorOpen,
    setEditingPin,
  } = usePinStore()

  // Load Cesium script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Cesium) {
      // Load Cesium CSS
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://cesium.com/downloads/cesiumjs/releases/1.119/Build/Cesium/Widgets/widgets.css'
      document.head.appendChild(link)

      // Load Cesium JS
      const script = document.createElement('script')
      script.src = 'https://cesium.com/downloads/cesiumjs/releases/1.119/Build/Cesium/Cesium.js'
      script.async = true
      script.onload = () => {
        setCesiumReady(true)
      }
      document.head.appendChild(script)

      return () => {
        document.head.removeChild(link)
        document.head.removeChild(script)
      }
    } else if (window.Cesium) {
      setCesiumReady(true)
    }
  }, [])

  // Initialize Cesium Viewer
  useEffect(() => {
    if (!cesiumReady || !containerRef.current || viewerRef.current) return

    const Cesium = window.Cesium

    // Set default access token (you can replace with your own)
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzciLCJpZCI6NTc2NjMsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE2MjI1NDgwMjB9.LGPCkXPR5l0sQQlkI_2GS5c5wz5rHNjEO9hL1pYZ6yU'

    const viewer = new Cesium.Viewer(containerRef.current, {
      terrainProvider: Cesium.createWorldTerrain(),
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      vrButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      scene3DOnly: true,
    })

    // Set initial camera position (New York area as default)
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(-74.0393, 40.6901, 15000000),
    })

    viewerRef.current = viewer
    setIsLoaded(true)

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy()
        viewerRef.current = null
      }
    }
  }, [cesiumReady])

  // Handle click to add pin
  useEffect(() => {
    if (!viewerRef.current || !isLoaded) return

    const viewer = viewerRef.current
    const Cesium = window.Cesium
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

    handler.setInputAction((click: any) => {
      if (isAddingPin) {
        const cartesian = viewer.camera.pickEllipsoid(
          click.position,
          viewer.scene.globe.ellipsoid
        )
        
        if (cartesian) {
          const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
          const latitude = Cesium.Math.toDegrees(cartographic.latitude)
          const longitude = Cesium.Math.toDegrees(cartographic.longitude)
          const altitude = 50 // Default altitude

          setPendingPinLocation({ latitude, longitude, altitude })
        }
      } else {
        // Check if we clicked on a pin
        const pickedObject = viewer.scene.pick(click.position)
        if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.pinData) {
          const pin = pickedObject.id.pinData
          setSelectedPin(pin)
          setIsPinViewerOpen(true)
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    return () => {
      handler.destroy()
    }
  }, [isLoaded, isAddingPin, setPendingPinLocation, setSelectedPin, setIsPinViewerOpen])

  // Update pins on the map
  useEffect(() => {
    if (!viewerRef.current || !isLoaded) return

    const viewer = viewerRef.current
    const Cesium = window.Cesium

    // Remove existing pin entities
    const entitiesToRemove = viewer.entities.values.filter(
      (entity: any) => entity.pinData
    )
    entitiesToRemove.forEach((entity: any) => viewer.entities.remove(entity))

    // Add pins
    pins.forEach((pin) => {
      const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
          pin.longitude,
          pin.latitude,
          pin.altitude
        ),
        billboard: {
          image: createPinImage(pin.iconColor),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          scale: pin.iconSize / 40,
        },
        label: {
          text: pin.name,
          font: `${pin.labelSize}px sans-serif`,
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.TOP,
          pixelOffset: new Cesium.Cartesian2(0, 10),
        },
        pinData: pin,
      })
    })
  }, [pins, isLoaded])

  // Create pin image dynamically
  const createPinImage = (color: string) => {
    const canvas = document.createElement('canvas')
    canvas.width = 48
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      // Draw pin shape
      ctx.beginPath()
      ctx.moveTo(24, 64)
      ctx.bezierCurveTo(24, 64, 4, 40, 4, 24)
      ctx.arc(24, 24, 20, Math.PI, 0, false)
      ctx.bezierCurveTo(44, 40, 24, 64, 24, 64)
      ctx.closePath()
      
      ctx.fillStyle = color
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()
      
      // Draw inner circle
      ctx.beginPath()
      ctx.arc(24, 24, 8, 0, Math.PI * 2)
      ctx.fillStyle = '#ffffff'
      ctx.fill()
    }
    
    return canvas.toDataURL()
  }

  return (
    <div className="relative size-full">
      {/* Cesium Container */}
      <div ref={containerRef} className="size-full" />

      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Loading 3D Globe...</p>
          </div>
        </div>
      )}

      {/* Add Pin Mode Indicator */}
      {isAddingPin && isLoaded && (
        <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-lg border border-primary bg-primary/10 px-4 py-2 backdrop-blur-sm">
          <p className="flex items-center gap-2 text-sm text-primary">
            <MapPin className="size-4" />
            Click anywhere on the map to place a camera pin
          </p>
        </div>
      )}

      {/* Cursor style when adding pin */}
      <style jsx global>{`
        ${isAddingPin ? `
          .cesium-viewer canvas {
            cursor: crosshair !important;
          }
        ` : ''}
        
        .cesium-viewer .cesium-widget-credits {
          display: none !important;
        }
      `}</style>
    </div>
  )
}
