'use client'

import type { SxProps, Theme } from '@mui/material/styles'
import { PROFESSIONAL_LIGHT_TAB_THEME } from './professional-light-tab-theme'

const PL = PROFESSIONAL_LIGHT_TAB_THEME

/**
 * Parent-level page tabs — Professional Light palette.
 */
export const settingsParentTabsSx: SxProps<Theme> = {
  borderBottom: `1px solid ${PL.divider}`,
  mb: 2,
  '& .MuiTab-root': {
    minHeight: 35,
    fontSize: '1rem',
    lineHeight: 1.5,
    fontWeight: 500,
    fontFamily: PL.fontFamily,
    textTransform: 'none',
    color: PL.textPrimary,
    opacity: 1,
    transition: (theme) =>
      theme.transitions.create(['color', 'background-color'], {
        duration: theme.transitions.duration.shorter,
      }),
    '&:hover': {
      color: PL.primaryMain,
      backgroundColor: PL.hoverBg,
    },
    '&.Mui-selected': {
      color: PL.primaryMain,
      fontWeight: 600,
    },
  },
  '& .MuiSvgIcon-root': {
    fontSize: 24,
  },
  '& .MuiTabs-indicator': {
    height: 4,
    backgroundColor: PL.primaryMain,
  },
}

/**
 * Child tabs — Professional Light (permissions module, theme settings, etc.).
 */
export const settingsChildTabsSx: SxProps<Theme> = {
  borderBottom: `1px solid ${PL.divider}`,
  mb: 2,
  transition: 'border-color 0.3s ease',
  '& .MuiTab-root': {
    minHeight: 40,
    fontSize: '0.8125rem',
    fontWeight: 400,
    fontFamily: PL.fontFamily,
    textTransform: 'none',
    py: 1,
    color: `${PL.textPrimary} !important`,
    opacity: '1 !important',
    '& .MuiTab-iconWrapper': {
      marginRight: '8px',
      marginBottom: '0 !important',
      color: 'inherit',
    },
    '& .MuiSvgIcon-root': {
      fontSize: 18,
      color: 'inherit',
    },
    '&:hover': {
      color: `${PL.primaryMain} !important`,
      backgroundColor: PL.hoverBg,
    },
    '&.Mui-selected': {
      color: `${PL.primaryMain} !important`,
      fontWeight: 600,
      backgroundColor: `${PL.selectedBg} !important`,
    },
    '&.Mui-selected:hover': {
      color: `${PL.primaryLight} !important`,
      backgroundColor: `${PL.selectedHoverBg} !important`,
    },
  },
  '& .MuiTabs-indicator': {
    height: 2,
    backgroundColor: PL.primaryMain,
  },
}

/**
 * Global Settings dialog tabs — scrollable strip (14px, 64px row).
 */
export const globalSettingsDialogTabsSx: SxProps<Theme> = {
  minHeight: 64,
  borderBottom: `1px solid ${PL.divider}`,
  '& .MuiTabs-flexContainer': {
    gap: 0,
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    minHeight: 64,
    minWidth: 140,
    maxWidth: 200,
    px: 3,
    py: 2,
    fontWeight: 500,
    fontSize: '14px',
    lineHeight: '20px',
    fontFamily: PL.fontFamily,
    color: `${PL.textPrimary} !important`,
    opacity: '1 !important',
    whiteSpace: 'nowrap',
    '&:hover': {
      color: `${PL.primaryMain} !important`,
      backgroundColor: PL.hoverBg,
    },
    '&.Mui-selected': {
      color: `${PL.primaryMain} !important`,
      fontWeight: 600,
      backgroundColor: `${PL.selectedBg} !important`,
    },
    '&.Mui-selected:hover': {
      color: `${PL.primaryLight} !important`,
      backgroundColor: `${PL.selectedHoverBg} !important`,
    },
  },
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    backgroundColor: PL.primaryMain,
  },
}

/** Section heading inside a settings / permissions tab panel */
export const settingsSectionTitleSx: SxProps<Theme> = {
  fontWeight: 600,
  mb: 0.5,
  fontFamily: PL.fontFamily,
  fontSize: '1rem',
  lineHeight: 1.5,
  color: PL.textPrimary,
}

export const settingsSectionDescriptionSx: SxProps<Theme> = {
  fontFamily: PL.fontFamily,
  fontSize: '0.875rem',
  lineHeight: 1.43,
  color: PL.textSecondary,
  mb: 2,
}
