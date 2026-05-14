'use client'

import * as React from 'react'
import type { MockEarthDockPin } from '@/lib/mock-earth-dock-pins'
import { MOCK_EARTH_DOCK_PINS } from '@/lib/mock-earth-dock-pins'
import { useEarthDockFilterStore } from '@/lib/earth-dock-filter-store'
import type { MockEarthDockPinType } from '@/lib/mock-earth-dock-pins'

export function useEarthDockFilter() {
  const activeFilter = useEarthDockFilterStore((s) => s.activeFilter)
  const toggleFilter = useEarthDockFilterStore((s) => s.toggleFilter)
  return { activeFilter, toggleFilter }
}

/** Memoized visible demo pins for the map layer */
export function useFilteredDemoPins(pins: MockEarthDockPin[] = MOCK_EARTH_DOCK_PINS) {
  const activeFilter = useEarthDockFilterStore((s) => s.activeFilter)
  return React.useMemo(() => {
    if (activeFilter === null) return pins
    return pins.filter((p) => p.type === activeFilter)
  }, [pins, activeFilter])
}

export type { MockEarthDockPinType } from '@/lib/mock-earth-dock-pins'
