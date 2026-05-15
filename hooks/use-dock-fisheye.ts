'use client'

import * as React from 'react'
import { useMotionValue, useSpring, type MotionValue } from 'framer-motion'

/** Sentinel so dock icons rest at scale 1 when pointer is away */
export const DOCK_MOUSE_OFFSCREEN = -1_000_000

export const DEFAULT_DOCK_FISHEYE = {
  influencePx: 108,
  maxScale: 1.58,
  spring: { stiffness: 480, damping: 38, mass: 0.5 },
} as const

/**
 * Cursor-distance magnification (cubic falloff), similar to macOS dock.
 * @param cursorX viewport clientX
 * @param iconCenterX icon center in viewport client coordinates
 */
export function magnifyScale(
  cursorX: number,
  iconCenterX: number,
  influencePx: number,
  maxScale: number,
): number {
  if (cursorX <= DOCK_MOUSE_OFFSCREEN / 10) return 1
  const d = Math.abs(cursorX - iconCenterX)
  if (d >= influencePx) return 1
  const t = 1 - d / influencePx
  const curved = t * t * t
  return 1 + (maxScale - 1) * curved
}

export function useDockFisheyeMouse() {
  const rawX = useMotionValue(DOCK_MOUSE_OFFSCREEN)
  const smoothMouseX = useSpring(rawX, DEFAULT_DOCK_FISHEYE.spring)

  const pauseFisheye = React.useCallback(() => {
    rawX.set(DOCK_MOUSE_OFFSCREEN)
  }, [rawX])

  const resumeFisheyeAt = React.useCallback(
    (clientX: number) => {
      rawX.set(clientX)
    },
    [rawX],
  )

  const bindDock = React.useMemo(
    () => ({
      onPointerEnter: (e: React.PointerEvent) => {
        rawX.set(e.clientX)
      },
      onPointerMove: (e: React.PointerEvent) => {
        rawX.set(e.clientX)
      },
      onPointerLeave: () => {
        rawX.set(DOCK_MOUSE_OFFSCREEN)
      },
    }),
    [rawX],
  )

  return { smoothMouseX, bindDock, pauseFisheye, resumeFisheyeAt }
}

export type DockFisheyeMotionX = MotionValue<number>
