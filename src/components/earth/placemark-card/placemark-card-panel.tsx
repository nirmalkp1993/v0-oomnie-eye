'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { Box, Paper, ThemeProvider } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { muiPlacemarkClusterTheme } from '@/src/components/theme/mui-placemark-cluster-theme'
import {
  PLACEMARK_CARD_BG_OPACITY_DEFAULT,
} from './placemark-card-constants'
import {
  PlacemarkCardHeader,
  type PlacemarkCardHeaderMode,
} from './placemark-card-header'
import { PlacemarkCardSurfaceProvider } from './placemark-card-surface-context'

export function PlacemarkCardPanel({
  title,
  mode,
  width = 900,
  showUnsavedChip,
  placesAutoOpen,
  onPlacesAutoOpenChange,
  onClose,
  footer,
  children,
  subtitle,
  placesAutoOpenDisabled,
}: {
  title: string
  mode: PlacemarkCardHeaderMode
  width?: number | string
  showUnsavedChip?: boolean
  placesAutoOpen: boolean
  onPlacesAutoOpenChange: (checked: boolean) => void
  onClose: () => void
  footer: ReactNode
  children: ReactNode
  subtitle?: string
  placesAutoOpenDisabled?: boolean
}) {
  const [cardBackgroundOpacity, setCardBackgroundOpacity] = useState(
    PLACEMARK_CARD_BG_OPACITY_DEFAULT,
  )

  return (
    <ThemeProvider theme={muiPlacemarkClusterTheme}>
      <PlacemarkCardPanelInner
        title={title}
        mode={mode}
        width={width}
        showUnsavedChip={showUnsavedChip}
        placesAutoOpen={placesAutoOpen}
        onPlacesAutoOpenChange={onPlacesAutoOpenChange}
        onClose={onClose}
        footer={footer}
        subtitle={subtitle}
        placesAutoOpenDisabled={placesAutoOpenDisabled}
        cardBackgroundOpacity={cardBackgroundOpacity}
        onOpacityChange={setCardBackgroundOpacity}
        onOpacityCommit={setCardBackgroundOpacity}
      >
        {children}
      </PlacemarkCardPanelInner>
    </ThemeProvider>
  )
}

function PlacemarkCardPanelInner({
  title,
  mode,
  width,
  showUnsavedChip,
  placesAutoOpen,
  onPlacesAutoOpenChange,
  onClose,
  footer,
  children,
  subtitle,
  placesAutoOpenDisabled,
  cardBackgroundOpacity,
  onOpacityChange,
  onOpacityCommit,
}: {
  title: string
  mode: PlacemarkCardHeaderMode
  width?: number | string
  showUnsavedChip?: boolean
  placesAutoOpen: boolean
  onPlacesAutoOpenChange: (checked: boolean) => void
  onClose: () => void
  footer: ReactNode
  children: ReactNode
  subtitle?: string
  placesAutoOpenDisabled?: boolean
  cardBackgroundOpacity: number
  onOpacityChange: (value: number) => void
  onOpacityCommit: (value: number) => void
}) {
  const theme = useTheme()

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'absolute',
        right: theme.spacing(2),
        top: theme.spacing(2),
        zIndex: 20,
        width: { xs: 'calc(100% - 32px)', md: width },
        maxWidth: 'md',
        pointerEvents: 'auto',
        bgcolor: alpha(theme.palette.background.paper, cardBackgroundOpacity / 100),
        backgroundImage: 'none',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 32px)',
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <Box sx={{ px: 3, pt: 2, flexShrink: 0 }}>
        <PlacemarkCardHeader
          title={title}
          mode={mode}
          cardBackgroundOpacity={cardBackgroundOpacity}
          onOpacityChange={onOpacityChange}
          onOpacityCommit={onOpacityCommit}
          placesAutoOpen={placesAutoOpen}
          onPlacesAutoOpenChange={onPlacesAutoOpenChange}
          onClose={onClose}
          showUnsavedChip={showUnsavedChip}
          subtitle={subtitle}
          placesAutoOpenDisabled={placesAutoOpenDisabled}
        />
      </Box>
      <PlacemarkCardSurfaceProvider opacity={cardBackgroundOpacity}>
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: 3 }}>{children}</Box>
      </PlacemarkCardSurfaceProvider>
      <Box
        sx={{
          flexShrink: 0,
          px: 3,
          py: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        {footer}
      </Box>
    </Paper>
  )
}
