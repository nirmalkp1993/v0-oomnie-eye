'use client'

import { create } from 'zustand'
import type { MockEarthDockPinType } from '@/lib/mock-earth-dock-pins'

/** `null` = show all demo pins; otherwise filter to that type */
export type EarthDockActiveFilter = MockEarthDockPinType | null

interface EarthDockFilterStore {
  activeFilter: EarthDockActiveFilter
  /** Click active icon again → all pins */
  toggleFilter: (type: MockEarthDockPinType) => void
}

export const useEarthDockFilterStore = create<EarthDockFilterStore>((set, get) => ({
  activeFilter: null,
  toggleFilter: (type) => {
    const cur = get().activeFilter
    set({ activeFilter: cur === type ? null : type })
  },
}))
