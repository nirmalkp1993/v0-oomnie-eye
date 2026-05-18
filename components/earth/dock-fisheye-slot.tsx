'use client'

import * as React from 'react'
import { motion, useTransform, type MotionValue } from 'framer-motion'
import { magnifyScale, DEFAULT_DOCK_FISHEYE } from '@/hooks/use-dock-fisheye'

type Props = {
  smoothMouseX: MotionValue<number>
  /** Shared ref of icon center X positions in viewport space; updated by parent on pointer move */
  centersRef: React.MutableRefObject<number[]>
  iconIndex: number
  children: React.ReactNode
}

/**
 * Per-slot fish-eye scale driven by smoothed cursor X and measured icon centers.
 */
export function DockFisheyeSlot({ smoothMouseX, centersRef, iconIndex, children }: Props) {
  const { influencePx, maxScale } = DEFAULT_DOCK_FISHEYE
  const scale = useTransform(smoothMouseX, (mx) =>
    magnifyScale(mx, centersRef.current[iconIndex] ?? 0, influencePx, maxScale),
  )

  return (
    <motion.div
      style={{ scale }}
      className="flex flex-col items-center justify-end will-change-transform [transform-origin:50%_100%]"
    >
      {children}
    </motion.div>
  )
}
