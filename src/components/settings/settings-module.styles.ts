'use client'

import type { SxProps, Theme } from '@mui/material/styles'

/** Primary UI font — matches OomniEye-DigitalTwin-Frontend enterprise / settings pages */
export const SETTINGS_FONT_FAMILY = '"Roboto", "Helvetica", "Arial", sans-serif'

export const settingsBodyPrimarySx: SxProps<Theme> = {
  fontFamily: SETTINGS_FONT_FAMILY,
  fontSize: '0.875rem',
  lineHeight: 1.43,
  color: 'text.primary',
}

export const settingsBodySecondarySx: SxProps<Theme> = {
  fontFamily: SETTINGS_FONT_FAMILY,
  fontSize: '0.875rem',
  lineHeight: 1.43,
  color: 'text.secondary',
}

export const settingsCaptionLabelSx: SxProps<Theme> = {
  fontFamily: SETTINGS_FONT_FAMILY,
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  fontSize: '0.75rem',
  color: 'text.secondary',
}

/** Outlined fields / selects in settings & permissions panels */
export const filterSelectSx: SxProps<Theme> = {
  minWidth: { xs: '100%', sm: 140 },
  flex: { xs: '1 1 140px', md: '0 1 auto' },
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    fontFamily: SETTINGS_FONT_FAMILY,
    fontSize: '0.875rem',
  },
  '& .MuiInputLabel-root': {
    fontFamily: SETTINGS_FONT_FAMILY,
    fontSize: '0.875rem',
  },
}

export const settingsSearchFieldSx: SxProps<Theme> = {
  minWidth: 200,
  flex: '1 1 220px',
  maxWidth: 360,
  ml: { md: 'auto' },
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    fontFamily: SETTINGS_FONT_FAMILY,
    fontSize: '0.875rem',
  },
}

export const settingsOutlinedButtonSx: SxProps<Theme> = {
  textTransform: 'none',
  fontWeight: 500,
  borderRadius: 2,
  borderColor: 'divider',
  color: 'text.primary',
  fontFamily: SETTINGS_FONT_FAMILY,
  fontSize: '0.875rem',
  whiteSpace: 'nowrap',
}

export const settingsContainedButtonSx: SxProps<Theme> = {
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: 2,
  boxShadow: 'none',
  fontFamily: SETTINGS_FONT_FAMILY,
  fontSize: '0.875rem',
}

export const settingsPaperSx: SxProps<Theme> = {
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 2,
  overflow: 'hidden',
  bgcolor: 'background.paper',
}

export const settingsStickyPanelSx: SxProps<Theme> = {
  ...settingsPaperSx,
  p: 2,
  width: { xs: '100%', lg: 280 },
  flexShrink: 0,
  alignSelf: 'flex-start',
  position: { lg: 'sticky' },
  top: 16,
}

export const rolePillSx: SxProps<Theme> = {
  height: 24,
  fontSize: '0.75rem',
  fontFamily: SETTINGS_FONT_FAMILY,
  bgcolor: 'action.hover',
  color: 'text.primary',
  border: '1px solid',
  borderColor: 'divider',
}

/** Permission matrix table headers */
export const matrixHeaderCellSx: SxProps<Theme> = {
  py: 1.25,
  px: 1,
  fontWeight: 700,
  fontSize: '0.6875rem',
  letterSpacing: '0.04em',
  fontFamily: SETTINGS_FONT_FAMILY,
  color: 'text.secondary',
  borderBottom: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
  textTransform: 'capitalize',
  whiteSpace: 'nowrap',
}

export const matrixModuleCellSx: SxProps<Theme> = {
  py: 1.5,
  px: 2,
  borderBottom: '1px solid',
  borderColor: 'divider',
  verticalAlign: 'top',
  minWidth: 220,
  maxWidth: 280,
  position: 'sticky',
  left: 0,
  zIndex: 1,
  bgcolor: 'background.paper',
}

export const matrixActionCellSx: SxProps<Theme> = {
  py: 1,
  px: 0.5,
  borderBottom: '1px solid',
  borderColor: 'divider',
  textAlign: 'center',
  width: 52,
  minWidth: 52,
}

/** Effective permissions / groups list tables */
export const tableHeaderCellSx: SxProps<Theme> = {
  py: 1.5,
  fontWeight: 700,
  fontSize: '0.7rem',
  letterSpacing: '0.06em',
  fontFamily: SETTINGS_FONT_FAMILY,
  color: 'text.secondary',
  borderBottom: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
  textTransform: 'uppercase',
}

export const tableBodyCellSx: SxProps<Theme> = {
  py: 2,
  borderBottom: '1px solid',
  borderColor: 'divider',
  verticalAlign: 'top',
  fontFamily: SETTINGS_FONT_FAMILY,
  fontSize: '0.875rem',
}

export const summaryCardSx: SxProps<Theme> = {
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 2,
  p: 1.5,
  bgcolor: 'background.paper',
}
