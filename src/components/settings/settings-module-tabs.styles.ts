'use client'

import type { SxProps, Theme } from '@mui/material/styles'

/**
 * Parent-level page tabs — aligned with OomniEye-DigitalTwin-Frontend `SettingsPage`.
 * STANDARD-LAYOUT-012/013: tabs on page background, 4px primary indicator, 1rem labels.
 */
export const settingsParentTabsSx: SxProps<Theme> = {
  borderBottom: 1,
  borderColor: 'divider',
  mb: 2,
  '& .MuiTab-root': {
    minHeight: 35,
    fontSize: '1rem',
    lineHeight: 1.5,
    fontWeight: 500,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    textTransform: 'none',
    color: 'text.primary',
    opacity: 1,
    transition: (theme) =>
      theme.transitions.create(['color', 'background-color'], {
        duration: theme.transitions.duration.shorter,
      }),
    '&:hover': {
      color: 'primary.main',
      bgcolor: 'action.hover',
    },
    '&.Mui-selected': {
      color: 'primary.main',
      fontWeight: 600,
    },
  },
  '& .MuiSvgIcon-root': {
    fontSize: 24,
  },
  '& .MuiTabs-indicator': {
    height: 4,
    backgroundColor: 'primary.main',
  },
}

/**
 * Child / nested tabs — aligned with Frontend `ThemeSettingsPage` (40px, 13px).
 */
export const settingsChildTabsSx: SxProps<Theme> = {
  borderBottom: 1,
  borderColor: 'divider',
  mb: 2,
  '& .MuiTab-root': {
    minHeight: 40,
    fontSize: '0.8125rem',
    lineHeight: 1.43,
    fontWeight: 400,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    textTransform: 'none',
    py: 1,
    color: 'text.secondary',
    '&.Mui-selected': {
      color: 'primary.main',
      fontWeight: 500,
    },
  },
  '& .MuiSvgIcon-root': {
    fontSize: 18,
  },
  '& .MuiTabs-indicator': {
    height: 2,
    backgroundColor: 'primary.main',
  },
}

/**
 * Global Settings dialog tabs — scrollable strip (14px, 64px row).
 */
export const globalSettingsDialogTabsSx: SxProps<Theme> = (theme) => ({
  minHeight: 64,
  borderBottom: `1px solid ${theme.palette.divider}`,
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
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    color: theme.palette.text.primary,
    opacity: 1,
    whiteSpace: 'nowrap',
    '&:hover': {
      color: theme.palette.primary.main,
      bgcolor: theme.palette.action.hover,
    },
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      fontWeight: 600,
      bgcolor:
        theme.palette.mode === 'dark'
          ? 'rgba(144, 202, 249, 0.08)'
          : 'rgba(25, 118, 210, 0.08)',
    },
  },
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    bgcolor: 'primary.main',
  },
})

/** Section heading inside a settings / permissions tab panel */
export const settingsSectionTitleSx: SxProps<Theme> = {
  fontWeight: 600,
  mb: 0.5,
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontSize: '1rem',
  lineHeight: 1.5,
  color: 'text.primary',
}

export const settingsSectionDescriptionSx: SxProps<Theme> = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontSize: '0.875rem',
  lineHeight: 1.43,
  color: 'text.secondary',
  mb: 2,
}
