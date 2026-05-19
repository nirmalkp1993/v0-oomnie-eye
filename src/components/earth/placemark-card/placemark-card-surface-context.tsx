'use client'

import { createContext, useContext, type ReactNode } from 'react'

const PlacemarkCardSurfaceContext = createContext<number | null>(null)

export function PlacemarkCardSurfaceProvider({
  opacity,
  children,
}: {
  opacity: number
  children: ReactNode
}) {
  return (
    <PlacemarkCardSurfaceContext.Provider value={opacity}>
      {children}
    </PlacemarkCardSurfaceContext.Provider>
  )
}

export function usePlacemarkCardSurfaceOpacity(): number | null {
  return useContext(PlacemarkCardSurfaceContext)
}
