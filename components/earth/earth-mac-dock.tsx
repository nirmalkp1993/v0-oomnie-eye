'use client'

import * as React from 'react'
import { Reorder, motion } from 'framer-motion'
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

type DockItemDef = (typeof DOCK_ITEMS)[number]

const STORAGE_KEY = 'earth-mac-dock-order-v1'

const LAYOUT_SPRING = { type: 'spring' as const, stiffness: 520, damping: 38, mass: 0.52 }

function loadOrderedItems(): DockItemDef[] {
  const fallback = [...DOCK_ITEMS]
  const byType = new Map(DOCK_ITEMS.map((d) => [d.type, d] as const))
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const types = JSON.parse(raw) as unknown
    if (!Array.isArray(types) || types.length !== DOCK_ITEMS.length) return fallback
    const next: DockItemDef[] = []
    for (const t of types) {
      const def = byType.get(t as MockEarthDockPinType)
      if (!def) return fallback
      next.push(def)
    }
    return next
  } catch {
    return fallback
  }
}

/**
 * macOS-style dock overlay for Earth: glass pill, fish-eye magnification, draggable icon reorder
 * (Framer `Reorder` + layout springs, persisted order in localStorage).
 */
export function EarthMacDock() {
  const { activeFilter, toggleFilter } = useEarthDockFilter()
  const { smoothMouseX, bindDock, pauseFisheye, resumeFisheyeAt } = useDockFisheyeMouse()
  const [items, setItems] = React.useState<DockItemDef[]>(DOCK_ITEMS)

  React.useEffect(() => {
    setItems(loadOrderedItems())
  }, [])

  const centersRef = React.useRef<number[]>([0, 0, 0, 0, 0])
  const slotRefs = React.useRef<(HTMLDivElement | null)[]>([null, null, null, null, null])
  const lastPointerXRef = React.useRef(0)

  const persistOrder = React.useCallback((next: DockItemDef[]) => {
    setItems(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next.map((i) => i.type)))
    } catch {
      /* ignore quota / private mode */
    }
  }, [])

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
  }, [items, measureCenters])

  React.useEffect(() => {
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
        lastPointerXRef.current = e.clientX
        bindDock.onPointerEnter(e)
        requestAnimationFrame(measureCenters)
      },
      onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
        lastPointerXRef.current = e.clientX
        bindDock.onPointerMove(e)
        scheduleMeasureCenters()
      },
      onPointerLeave: bindDock.onPointerLeave,
    }),
    [bindDock, measureCenters, scheduleMeasureCenters],
  )

  return (
    <TooltipProvider delayDuration={300}>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1100] flex justify-center pb-5 pt-10">
        <Reorder.Group
          axis="x"
          values={items}
          onReorder={persistOrder}
          as="div"
          role="toolbar"
          aria-label="Earth pin filters — drag icons to reorder"
          className={cn(
            'pointer-events-auto flex items-end gap-1 rounded-full border border-white/12 px-3 py-2',
            'shadow-[0_12px_40px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.06)_inset]',
            'bg-gradient-to-b from-white/14 to-white/[0.06] backdrop-blur-xl',
          )}
          transition={{ layout: LAYOUT_SPRING }}
          onPointerEnter={handleDockPointer.onPointerEnter}
          onPointerMove={handleDockPointer.onPointerMove}
          onPointerLeave={handleDockPointer.onPointerLeave}
        >
          {items.map((item, index) => {
            const Icon = item.Icon
            const isActive = activeFilter === item.type
            return (
              <Reorder.Item
                key={item.type}
                value={item}
                as="div"
                layout="position"
                className={cn(
                  'relative touch-none select-none list-none',
                  'cursor-grab active:cursor-grabbing',
                )}
                whileDrag={{
                  scale: 1.08,
                  zIndex: 30,
                  boxShadow: '0 18px 44px rgba(0,0,0,0.55)',
                  transition: { type: 'spring', stiffness: 440, damping: 28 },
                }}
                transition={{ layout: LAYOUT_SPRING }}
                onDragStart={() => {
                  pauseFisheye()
                }}
                onDragEnd={() => {
                  resumeFisheyeAt(lastPointerXRef.current)
                  requestAnimationFrame(measureCenters)
                }}
              >
                <DockFisheyeSlot smoothMouseX={smoothMouseX} centersRef={centersRef} iconIndex={index}>
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
                            onTap={() => toggleFilter(item.type)}
                            className={cn(
                              'relative flex size-12 items-center justify-center rounded-xl text-white/90',
                              'bg-white/5 transition-colors hover:bg-white/12',
                              isActive && 'bg-sky-500/25 text-sky-100 ring-1 ring-sky-400/50',
                            )}
                          >
                            <Icon className="pointer-events-none size-6 shrink-0" strokeWidth={1.75} />
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
                        isActive
                          ? 'scale-100 bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.85)]'
                          : 'scale-75 bg-white/25 opacity-60',
                      )}
                      aria-hidden
                    />
                  </div>
                </DockFisheyeSlot>
              </Reorder.Item>
            )
          })}
        </Reorder.Group>
      </div>
    </TooltipProvider>
  )
}
