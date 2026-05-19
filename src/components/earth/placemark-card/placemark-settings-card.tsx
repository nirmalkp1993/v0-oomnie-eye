'use client'

import type { ReactNode } from 'react'
import { Box, Card, CardContent, Typography } from '@mui/material'
import { alpha, useTheme, type SxProps, type Theme } from '@mui/material/styles'
import { PlacemarkInfoTooltip } from './placemark-info-tooltip'
import { usePlacemarkCardSurfaceOpacity } from './placemark-card-surface-context'
import { CARD_DIMENSIONS } from './placemark-card-constants'

export interface PlacemarkSettingsCardProps {
  title: string
  tooltip?: string | ReactNode
  children: ReactNode
  headerIcon?: ReactNode
  accentColor?: string
  fullHeight?: boolean
  action?: React.ReactNode
  sx?: SxProps<Theme>
}

/** Visual parity with OomniEye SettingsCard used inside PlacemarkCard */
export function PlacemarkSettingsCard({
  title,
  tooltip,
  children,
  headerIcon,
  accentColor,
  fullHeight = false,
  action,
  sx,
}: PlacemarkSettingsCardProps) {
  const theme = useTheme()
  const surfaceOpacity = usePlacemarkCardSurfaceOpacity()
  const accent = accentColor ?? theme.palette.primary.main

  const surfaceSx: SxProps<Theme> =
    surfaceOpacity != null
      ? {
          bgcolor: alpha(theme.palette.background.paper, surfaceOpacity / 100),
        }
      : {}

  return (
    <Card
      elevation={0}
      sx={{
        border: 'none',
        borderRadius: CARD_DIMENSIONS.borderRadius,
        position: 'relative',
        overflow: 'hidden',
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
        height: fullHeight ? '100%' : 'auto',
        minHeight: CARD_DIMENSIONS.minHeight,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 2px 8px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.2)'
            : '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: 'fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '@keyframes fadeInUp': {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        '&:hover': {
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 4px 16px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)'
              : '0 4px 16px rgba(0,0,0,0.16), 0 2px 4px rgba(0,0,0,0.08)',
        },
        '&::before': accentColor
          ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(180deg, ${accent}50 0%, ${accent}00 100%)`,
              pointerEvents: 'none',
              zIndex: 0,
            }
          : {},
        ...surfaceSx,
        ...sx,
      }}
    >
      <CardContent
        sx={{
          p: CARD_DIMENSIONS.padding,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
          '&:last-child': { pb: 2 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
          }}
        >
          {headerIcon ? (
            <Box
              sx={{
                width: 72,
                height: 72,
                minWidth: 72,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                background: accentColor
                  ? `linear-gradient(135deg, ${accent}30 0%, ${accent}20 100%)`
                  : theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)'
                    : 'linear-gradient(135deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.03) 100%)',
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? '0 2px 8px rgba(0,0,0,0.4)'
                    : '0 2px 8px rgba(0,0,0,0.1)',
                '& > svg': {
                  fontSize: 40,
                  color: accentColor || theme.palette.primary.main,
                },
              }}
            >
              {headerIcon}
            </Box>
          ) : null}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  fontWeight: 400,
                  fontSize: headerIcon ? '1.25rem' : '1rem',
                  color: theme.typography.h6.color,
                  lineHeight: theme.typography.h6.lineHeight,
                }}
              >
                {title}
              </Typography>
              {tooltip ? <PlacemarkInfoTooltip title={tooltip} placement="top" /> : null}
            </Box>
            {action ? <Box>{action}</Box> : null}
          </Box>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</Box>
      </CardContent>
    </Card>
  )
}
