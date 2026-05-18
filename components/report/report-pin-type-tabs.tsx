'use client'

import type { LucideIcon } from 'lucide-react'
import { Box, Footprints, MapPin, Radio, Video } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import {
  REPORT_PIN_TYPES,
  REPORT_PIN_TAB_LABEL,
} from '@/lib/report-placemark-store'
import type { ReportPinType } from '@/types/report-placemark'

const TAB_ICONS: Record<ReportPinType, LucideIcon> = {
  places: MapPin,
  camera: Video,
  site_patrol: Footprints,
  assets: Box,
  iots: Radio,
}

interface ReportPinTypeTabsProps {
  value: ReportPinType
  onValueChange: (value: ReportPinType) => void
}

export function ReportPinTypeTabs({ value, onValueChange }: ReportPinTypeTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onValueChange(v as ReportPinType)}
      className="w-full gap-0"
    >
      <div className="w-full border-b border-border bg-muted/50">
        <TabsList
          className={cn(
            'flex h-auto w-full min-w-0 flex-wrap items-stretch justify-start gap-0 rounded-none',
            'border-0 bg-transparent p-0 text-foreground shadow-none',
          )}
        >
          {REPORT_PIN_TYPES.map((t) => {
            const Icon = TAB_ICONS[t]
            return (
              <TabsTrigger
                key={t}
                value={t}
                className={cn(
                  'relative flex flex-1 shrink-0 items-center justify-center gap-2 rounded-none border-0',
                  'border-b-2 border-transparent bg-transparent px-4 py-3 text-sm font-medium shadow-none',
                  'text-foreground/80 hover:text-foreground',
                  'focus-visible:z-10 focus-visible:ring-0 focus-visible:outline-none',
                  'data-[state=active]:shadow-none',
                  'data-[state=active]:border-blue-600 data-[state=active]:!bg-transparent data-[state=active]:!text-blue-600',
                  'dark:data-[state=active]:!text-blue-500',
                  'sm:flex-none sm:justify-start sm:px-6',
                  '[&_svg]:size-[18px] [&_svg]:shrink-0',
                )}
              >
                <Icon className="stroke-[1.75]" aria-hidden />
                {REPORT_PIN_TAB_LABEL[t]}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </div>
    </Tabs>
  )
}
