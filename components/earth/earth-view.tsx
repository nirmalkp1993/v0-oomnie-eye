'use client'

import { CesiumGlobe } from './cesium-globe'
import { EarthToolbar } from './earth-toolbar'
import { AddPinDialog } from './add-pin-dialog'
import { AddCameraPlacemarkDialog } from './add-camera-placemark-dialog'
import { PinEditorDialog } from './pin-editor-dialog'
import { PinViewerDialog } from './pin-viewer-dialog'
import { AddCameraDialog } from '@/components/camera/add-camera-dialog'
import { EarthMacDock } from '@/components/earth/earth-mac-dock'

export function EarthView() {
  return (
    <div className="relative size-full overflow-hidden">
      {/* Map Background */}
      <CesiumGlobe />

      {/* macOS-style dock: demo pin filters + fish-eye hover */}
      <EarthMacDock />

      {/* Left Toolbar - Always visible */}
      <EarthToolbar />

      {/* Dialogs */}
      <AddCameraPlacemarkDialog />
      <AddPinDialog />
      <PinEditorDialog />
      <PinViewerDialog />
      <AddCameraDialog />
    </div>
  )
}
