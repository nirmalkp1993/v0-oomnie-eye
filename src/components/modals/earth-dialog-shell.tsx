'use client'

import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Dialog,
  IconButton,
  ThemeProvider,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { useState, type ReactNode } from 'react'
import {
  PLACEMARK_CARD_BG_OPACITY_DEFAULT,
} from '@/src/components/earth/placemark-card/placemark-card-constants'
import { PlacemarkCardSurfaceProvider } from '@/src/components/earth/placemark-card/placemark-card-surface-context'
import { PlacemarkOpacitySlider } from '@/src/components/earth/placemark-card/placemark-opacity-slider'
import { muiPlacemarkClusterTheme } from '@/src/components/theme/mui-placemark-cluster-theme'
import { CARD_BORDER_RADIUS_PX } from '@/src/components/earth/placemark-card/placemark-card-constants'
import {
  PL_CARD_SPACING,
  PL_CONTAINER_PADDING,
} from '@/src/components/theme/professional-light-theme'
import { earthDialogMaxWidthPx, type EarthDialogMaxWidth } from './earth-dialog-constants'

export interface EarthDialogShellProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  headerIcon?: ReactNode
  maxWidth?: EarthDialogMaxWidth
  footer?: ReactNode
  children: ReactNode
  /** Hide the default top-right close control (earth panel uses header close) */
  showCloseButton?: boolean
  /** Show placemark-style background opacity control in the header */
  showOpacityControl?: boolean
}

function EarthDialogShellInner({
  onClose,
  title,
  description,
  headerIcon,
  maxWidth = '4xl',
  footer,
  children,
  showCloseButton = true,
  showOpacityControl = true,
}: Omit<EarthDialogShellProps, 'open'>) {
  const theme = useTheme()
  const widthPx = earthDialogMaxWidthPx[maxWidth]
  const [cardBackgroundOpacity, setCardBackgroundOpacity] = useState(PLACEMARK_CARD_BG_OPACITY_DEFAULT)

  return (
    <Dialog
      open
      onClose={(_, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') onClose()
      }}
      maxWidth={false}
      scroll="paper"
      slotProps={{
        backdrop: { sx: { bgcolor: alpha(theme.palette.common.black, 0.5) } },
      }}
      PaperProps={{
        sx: {
          width: { xs: 'calc(100% - 32px)', sm: widthPx },
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: '90vh',
          m: 2,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: alpha(theme.palette.background.paper, cardBackgroundOpacity / 100),
          backgroundImage: 'none',
          borderRadius: `${CARD_BORDER_RADIUS_PX}px`,
          fontFamily: theme.typography.fontFamily,
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          flexShrink: 0,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          rowGap: 1.25,
          columnGap: 2,
          px: PL_CONTAINER_PADDING,
          py: PL_CARD_SPACING,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flex: '1 1 200px', minWidth: 0 }}>
          {headerIcon ? (
            <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', pt: 0.25 }}>{headerIcon}</Box>
          ) : null}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5" component="h2" noWrap>
              {title}
            </Typography>
            {description ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, display: 'block', lineHeight: 1.4, whiteSpace: 'normal' }}
              >
                {description}
              </Typography>
            ) : null}
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'nowrap',
            gap: { xs: 0.5, sm: 1 },
            flex: { xs: '1 1 100%', sm: '0 1 auto' },
            minWidth: 0,
            ml: { xs: 0, sm: 'auto' },
            justifyContent: 'flex-end',
            width: { xs: '100%', sm: 'auto' },
            pr: showCloseButton ? 4 : 0,
          }}
        >
          {showOpacityControl ? (
            <PlacemarkOpacitySlider
              value={cardBackgroundOpacity}
              onChange={setCardBackgroundOpacity}
              onChangeCommitted={setCardBackgroundOpacity}
              ariaLabel="Dialog background opacity"
            />
          ) : null}
          {showCloseButton ? (
            <IconButton
              aria-label="Close dialog"
              onClick={onClose}
              size="small"
              sx={{
                position: { xs: 'static', sm: 'absolute' },
                right: { sm: 12 },
                top: { sm: 12 },
                flexShrink: 0,
                color: 'text.secondary',
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          ) : null}
        </Box>
      </Box>

      <PlacemarkCardSurfaceProvider opacity={cardBackgroundOpacity}>
        <Box sx={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'auto' }}>{children}</Box>
      </PlacemarkCardSurfaceProvider>

      {footer ? (
        <Box
          sx={{
            flexShrink: 0,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 1,
            px: PL_CONTAINER_PADDING,
            py: PL_CARD_SPACING,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          {footer}
        </Box>
      ) : null}
    </Dialog>
  )
}

export function EarthDialogShell({ open, ...props }: EarthDialogShellProps) {
  if (!open) return null

  return (
    <ThemeProvider theme={muiPlacemarkClusterTheme}>
      <EarthDialogShellInner {...props} />
    </ThemeProvider>
  )
}
