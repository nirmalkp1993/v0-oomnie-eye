'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Camera, Route, Package, Cpu } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { MockEarthDockPinType } from '@/lib/mock-earth-dock-pins'
import { useEarthDockFilter } from '@/hooks/use-dock-pin-filter'
import { useDockFisheyeMouse } from '@/hooks/use-dock-fisheye'
import { DockFisheyeSlot } from '@/components/earth/dock-fisheye-slot'

const DOCK_ITEMS: {
  type: MockEarthDockPinType
  label: string
  Icon: typeof MapPin
}[] = [
  { type: 'place', label: 'Place', Icon: MapPin },
  { type: 'camera', label: 'Camera', Icon: Camera },
  { type: 'patrol', label: 'Patrol', Icon: Route },
  { type: 'assets', label: 'Assets', Icon: Package },
  { type: 'iot', label: 'IoTs', Icon: Cpu },
]

/**
 * macOS-style dock overlay for Earth: glass pill, fish-eye magnification (Framer Motion + cursor distance),
 * filter toggles for demo pins (see `useEarthDockFilter` / Leaflet demo layer).
 */
export function EarthMacDock() {
  const { activeFilter, toggleFilter } = useEarthDockFilter()
  const { smoothMouseX, bindDock } = useDockFisheyeMouse()
  const centersRef = React.useRef<number[]>([0, 0, 0, 0, 0])
  const slotRefs = React.useRef<(HTMLDivElement | null)[]>([null, null, null, null, null])

  const measureCenters = React.useCallback(() => {
    slotRefs.current.forEach((el, i) => {
      if (el) {
        const r = el.getBoundingClientRect()
        centersRef.current[i] = r.left + r.width / 2
      }
    })
  }, [])

  const measureRafRef = React.useRef<number | null>(null)
  const scheduleMeasureCenters = React.useCallback(() => {
    if (measureRafRef.current != null) return
    measureRafRef.current = window.requestAnimationFrame(() => {
      measureRafRef.current = null
      measureCenters()
    })
  }, [measureCenters])

  React.useLayoutEffect(() => {
    measureCenters()
    const onResize = () => measureCenters()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      if (measureRafRef.current != null) {
        window.cancelAnimationFrame(measureRafRef.current)
        measureRafRef.current = null
      }
    }
  }, [measureCenters])

  const handleDockPointer = React.useMemo(
    () => ({
      onPointerEnter: (e: React.PointerEvent<HTMLDivElement>) => {
        bindDock.onPointerEnter(e)
        requestAnimationFrame(measureCenters)
      },
      onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
        bindDock.onPointerMove(e)
        scheduleMeasureCenters()
      },
      onPointerLeave: bindDock.onPointerLeave,
    }),
    [bindDock, measureCenters, scheduleMeasureCenters],
  )

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1100] flex justify-center pb-5 pt-10"
      >
        <div
          role="toolbar"
          aria-label="Earth pin filters"
          className="pointer-events-auto"
          onPointerEnter={handleDockPointer.onPointerEnter}
          onPointerMove={handleDockPointer.onPointerMove}
          onPointerLeave={handleDockPointer.onPointerLeave}
        >
          <motion.div
            className={cn(
              'flex items-end gap-1 rounded-full border border-white/12 px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.06)_inset]',
              'bg-gradient-to-b from-white/14 to-white/[0.06] backdrop-blur-xl',
            )}
          >
            {DOCK_ITEMS.map((item, index) => {
              const Icon = item.Icon
              const isActive = activeFilter === item.type
              return (
                <DockFisheyeSlot
                  key={item.type}
                  smoothMouseX={smoothMouseX}
                  centersRef={centersRef}
                  iconIndex={index}
                >
                  <div className="flex flex-col items-center gap-1 px-1.5">
                    <div
                      ref={(el) => {
                        slotRefs.current[index] = el
                      }}
                      className="flex flex-col items-center"
                    >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.9 }}
                          transition={{ type: 'spring', stiffness: 520, damping: 28 }}
                          onClick={() => toggleFilter(item.type)}
                          className={cn(
                            'relative flex size-12 items-center justify-center rounded-xl text-white/90',
                            'bg-white/5 transition-colors hover:bg-white/12',
                            isActive && 'bg-sky-500/25 text-sky-100 ring-1 ring-sky-400/50',
                          )}
                        >
                          <Icon className="size-6 shrink-0" strokeWidth={1.75} />
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="border-border/80 bg-popover text-popover-foreground">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                    </div>
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full transition-all duration-200',
                        isActive ? 'scale-100 bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.85)]' : 'scale-75 bg-white/25 opacity-60',
                      )}
                      aria-hidden
                    />
                  </div>
                </DockFisheyeSlot>
              )
            })}
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  )
}
