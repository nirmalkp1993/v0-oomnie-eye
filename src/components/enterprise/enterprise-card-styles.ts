'use client'

import type { SxProps, Theme } from '@mui/material/styles'
import type { SystemStyleObject } from '@mui/system'
import {
  CARD_BORDER_RADIUS_PX,
  CARD_DIMENSIONS,
} from '@/src/components/earth/placemark-card/placemark-card-constants'

export { CARD_DIMENSIONS }

/** SettingsCard / PlacemarkSettingsCard surface — used for explorer tiles and panels */
export function getEnterpriseSettingsCardSx(theme: Theme): SystemStyleObject<Theme> {
  return {
  border: 'none',
  borderRadius: `${CARD_BORDER_RADIUS_PX}px`,
  position: 'relative',
  overflow: 'hidden',
  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
  boxShadow:
    theme.palette.mode === 'dark'
      ? '0 2px 8px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.2)'
      : '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    boxShadow:
      theme.palette.mode === 'dark'
        ? '0 4px 16px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)'
        : '0 4px 16px rgba(0,0,0,0.16), 0 2px 4px rgba(0,0,0,0.08)',
  },
  }
}

export const enterpriseSettingsCardSx: SxProps<Theme> = getEnterpriseSettingsCardSx

/** Compact grid tile — same palette/shadow as SettingsCard */
export function getEnterpriseExplorerTileSx(theme: Theme): SystemStyleObject<Theme> {
  return {
  border: 'none',
  borderRadius: `${CARD_BORDER_RADIUS_PX}px`,
  position: 'relative',
  overflow: 'hidden',
  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
  boxShadow:
    theme.palette.mode === 'dark'
      ? '0 2px 8px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.2)'
      : '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  minHeight: 0,
  '&:hover': {
    boxShadow:
      theme.palette.mode === 'dark'
        ? '0 4px 16px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)'
        : '0 4px 16px rgba(0,0,0,0.16), 0 2px 4px rgba(0,0,0,0.08)',
    outline: `1px solid ${theme.palette.primary.main}`,
    outlineOffset: 0,
  },
  }
}

export const enterpriseExplorerTileSx: SxProps<Theme> = getEnterpriseExplorerTileSx
