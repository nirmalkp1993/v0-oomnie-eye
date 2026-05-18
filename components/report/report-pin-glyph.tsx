'use client'

import { Box, Footprints, MapPin, Radio, Video, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const PIN_ICON_MAP: Record<string, LucideIcon> = {
  places: MapPin,
  map_pin: MapPin,
  pin: MapPin,
  camera: Video,
  site_patrol: Footprints,
  patrol: Footprints,
  assets: Box,
  box: Box,
  iots: Radio,
  iot: Radio,
}

export function ReportPinGlyph({ iconKey, className }: { iconKey: string; className?: string }) {
  const C = PIN_ICON_MAP[iconKey.toLowerCase()] ?? MapPin
  return <C className={cn('size-4 shrink-0', className)} aria-hidden />
}
