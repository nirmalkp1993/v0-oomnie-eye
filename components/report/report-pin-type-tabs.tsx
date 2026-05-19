'use client'

import type { LucideIcon } from 'lucide-react'
import { Box, Footprints, MapPin, Radio, Video } from 'lucide-react'
import { EnterpriseSettingsTabs } from '@/src/components/enterprise'
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
    <EnterpriseSettingsTabs
      value={value}
      onChange={(v) => onValueChange(v as ReportPinType)}
      ariaLabel="Report pin type tabs"
      tabs={REPORT_PIN_TYPES.map((t) => {
        const Icon = TAB_ICONS[t]
        return {
          value: t,
          label: REPORT_PIN_TAB_LABEL[t],
          icon: <Icon strokeWidth={1.75} aria-hidden />,
        }
      })}
    />
  )
}
