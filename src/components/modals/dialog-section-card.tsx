'use client'

import { Box, useTheme } from '@mui/material'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { PlacemarkSettingsCard } from '@/src/components/earth/placemark-card/placemark-settings-card'

/** In-dialog section card — same surface as earth PlacemarkSettingsCard */
export function DialogSectionCard({
  title,
  headerIcon,
  tooltip,
  children,
  accentColor,
  fullHeight = false,
}: {
  title: string
  headerIcon?: ReactNode
  tooltip?: string
  children: ReactNode
  accentColor?: string
  fullHeight?: boolean
}) {
  return (
    <Box
      sx={{
        mb: fullHeight ? 0 : 2,
        height: fullHeight ? '100%' : 'auto',
        display: fullHeight ? 'flex' : 'block',
        flexDirection: 'column',
      }}
    >
      <PlacemarkSettingsCard
        title={title}
        headerIcon={headerIcon}
        tooltip={tooltip}
        accentColor={accentColor}
        fullHeight={fullHeight}
      >
        {children}
      </PlacemarkSettingsCard>
    </Box>
  )
}

/** Standard earth-themed section card for AppDialog modals (icon, accent, tooltips) */
export function EarthDialogSectionCard({
  title,
  icon: Icon,
  tooltip,
  children,
  className,
  accentColor,
  fullHeight = false,
}: {
  title: string
  icon: LucideIcon
  tooltip?: string
  children: ReactNode
  className?: string
  accentColor?: string
  fullHeight?: boolean
}) {
  const theme = useTheme()

  return (
    <DialogSectionCard
      title={title}
      tooltip={tooltip}
      accentColor={accentColor ?? theme.palette.primary.main}
      headerIcon={<Icon className="size-10" strokeWidth={1.75} />}
      fullHeight={fullHeight}
    >
      <Box className={className}>{children}</Box>
    </DialogSectionCard>
  )
}
