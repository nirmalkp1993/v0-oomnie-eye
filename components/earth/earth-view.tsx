'use client'

import { CesiumGlobe } from './cesium-globe'

export function EarthView() {
  return (
    <div className="relative size-full">
      <CesiumGlobe />
    </div>
  )
}
