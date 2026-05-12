'use client'

import { CesiumGlobe } from './cesium-globe'
import { EarthToolbar } from './earth-toolbar'
import { AddPinDialog } from './add-pin-dialog'
import { AddCameraPlacemarkDialog } from './add-camera-placemark-dialog'
import { PinEditorDialog } from './pin-editor-dialog'
import { PinViewerDialog } from './pin-viewer-dialog'
import { AddCameraDialog } from '@/components/camera/add-camera-dialog'

export function EarthView() {
  return (
    <div className="relative size-full overflow-hidden">
      {/* Map Background */}
      <CesiumGlobe />

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
