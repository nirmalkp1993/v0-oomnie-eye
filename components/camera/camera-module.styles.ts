'use client'

import type { SxProps, Theme } from '@mui/material/styles'
import {
  PL_CARD_SPACING,
  PL_CONTAINER_PADDING,
  PROFESSIONAL_LIGHT,
} from '@/src/components/theme/professional-light-theme'

const PL = PROFESSIONAL_LIGHT

/** Camera list table — Professional Light palette */
export const CAMERA_TABLE = {
  accent: PL.palette.primary.main,
  headerBg: PL.palette.background.default,
  border: PL.chrome.border,
  rowHeight: 36,
  folderOpen: PL.palette.primary.main,
  folderClosed: PL.chrome.textSecondary,
  hoverBg: 'rgba(0, 0, 0, 0.04)',
  headerHoverBg: 'rgba(25, 118, 210, 0.06)',
  depthEvenBg: 'rgba(242, 242, 242, 0.3)',
  depthOddBg: 'rgba(255, 152, 0, 0.05)',
  selectedBg: 'rgba(25, 118, 210, 0.08)',
  selectedHoverBg: 'rgba(25, 118, 210, 0.12)',
  activeRowBg: 'rgba(255, 152, 0, 0.12)',
  activeRowHoverBg: 'rgba(255, 152, 0, 0.18)',
} as const

export const cameraHeaderTypographySx = {
  fontFamily: PL.typography.fontFamily,
  fontWeight: PL.typography.fontWeightMedium,
  fontSize: '14px',
  color: PL.palette.primary.main,
  letterSpacing: '0.1px',
} as const

export const cameraBodyPrimaryTypographySx = {
  fontFamily: PL.typography.fontFamily,
  fontSize: '14px',
  fontWeight: PL.typography.fontWeightLight,
  color: PL.palette.text.primary,
} as const

export const cameraBodySecondaryTypographySx = {
  fontFamily: PL.typography.fontFamily,
  fontSize: '13px',
  fontWeight: PL.typography.fontWeightLight,
  color: PL.palette.text.secondary,
} as const

export const cameraTableSx: SxProps<Theme> = {
  minWidth: 900,
  '& .MuiTableCell-root': {
    py: 0.5,
    px: 2,
    whiteSpace: 'nowrap',
    height: `${CAMERA_TABLE.rowHeight}px`,
  },
}

export const cameraTableHeadSx: SxProps<Theme> = {
  bgcolor: CAMERA_TABLE.headerBg,
  borderBottom: `1px solid ${CAMERA_TABLE.border}`,
  position: 'sticky',
  top: 0,
  zIndex: 100,
  '& .MuiTableRow-root': {
    height: `${CAMERA_TABLE.rowHeight}px`,
  },
  '& .MuiTableCell-root': {
    height: `${CAMERA_TABLE.rowHeight}px`,
    py: 0.75,
    position: 'relative',
    zIndex: 100,
    borderBottom: `1px solid ${CAMERA_TABLE.border}`,
  },
}

export const cameraTableBodySx: SxProps<Theme> = {
  '& .MuiTableRow-root': {
    position: 'relative',
    zIndex: 1,
  },
}

export const cameraTableCellSx: SxProps<Theme> = {
  borderBottom: `1px solid ${CAMERA_TABLE.border}`,
}

export const CAMERA_TOOLBAR = {
  shellBg: PL.palette.background.default,
  shellBorder: PL.chrome.border,
  toggleBg: '#f2f2f2',
  textMuted: PL.palette.text.secondary,
  textDark: PL.palette.text.primary,
  accentHoverBg: 'rgba(25, 118, 210, 0.04)',
  depthDotActive: PL.palette.titleText.main,
  primaryBtn: PL.palette.primary.main,
  primaryBtnHover: PL.palette.primary.dark,
  white: PL.palette.background.paper,
} as const

export const cameraPrimaryButtonSx: SxProps<Theme> = {
  minHeight: 36,
  textTransform: 'uppercase',
  fontFamily: PL.typography.fontFamily,
  fontSize: '0.875rem',
  fontWeight: PL.typography.fontWeightRegular,
  lineHeight: 1.75,
  bgcolor: CAMERA_TOOLBAR.primaryBtn,
  color: PL.palette.primary.contrastText,
  borderRadius: 1,
  px: 2,
  boxShadow: 'none',
  '&:hover': {
    bgcolor: CAMERA_TOOLBAR.primaryBtnHover,
    boxShadow: 'none',
  },
}

export const cameraToolbarIconButtonSx: SxProps<Theme> = {
  width: 36,
  height: 36,
  color: PL.chrome.iconInactive,
  borderRadius: 1,
  '&:hover': {
    bgcolor: CAMERA_TOOLBAR.accentHoverBg,
    color: PL.chrome.iconActive,
  },
}

export function cameraBodyRowSx(options?: {
  depth?: number
  selected?: boolean
  active?: boolean
}): SxProps<Theme> {
  const depth = options?.depth ?? 0
  const selected = options?.selected ?? false
  const active = options?.active ?? false

  return {
    height: CAMERA_TABLE.rowHeight,
    cursor: 'pointer',
    transition: `all ${PL.transitions.duration.shorter}ms ${PL.transitions.easing.easeInOut}`,
    ...(!selected &&
      !active &&
      depth > 0 && {
        bgcolor: depth % 2 === 0 ? CAMERA_TABLE.depthEvenBg : CAMERA_TABLE.depthOddBg,
      }),
    ...(active && {
      bgcolor: `${CAMERA_TABLE.activeRowBg} !important`,
      borderLeft: `3px solid ${PL.palette.titleText.main}`,
      '&:hover': {
        bgcolor: `${CAMERA_TABLE.activeRowHoverBg} !important`,
      },
    }),
    ...(selected && {
      bgcolor: CAMERA_TABLE.selectedBg,
      borderLeft: `3px solid ${CAMERA_TABLE.accent}`,
      '&:hover': {
        bgcolor: CAMERA_TABLE.selectedHoverBg,
      },
    }),
    '&:hover': {
      bgcolor: selected || active ? undefined : CAMERA_TABLE.hoverBg,
      transform: 'translateX(2px)',
    },
  }
}

/** Grid tile radius — matches Frontend CameraListGridCard (borderRadius: 2.5) */
export const CAMERA_GRID_BORDER_RADIUS = 2.5

export const CAMERA_GRID = {
  cardWidth: 218,
  cardHeight: 317,
  thumbSize: 200,
  borderRadius: CAMERA_GRID_BORDER_RADIUS,
  thumbBg: PL.palette.background.default,
  textPrimary: PL.palette.text.primary,
  textMuted: PL.palette.text.secondary,
} as const

export function cameraGridDepthBorderColor(depth: number): string {
  if (depth === 1) return PL.palette.primary.main
  if (depth === 2) return PL.palette.titleText.main
  if (depth === 3) return PL.chrome.textSecondary
  return PL.chrome.border
}

export function cameraGridCardSx(options?: {
  depth?: number
  selected?: boolean
  active?: boolean
}): SxProps<Theme> {
  const depth = options?.depth ?? 0
  const selected = options?.selected ?? false
  const active = options?.active ?? false

  return {
    position: 'relative',
    width: CAMERA_GRID.cardWidth,
    height: CAMERA_GRID.cardHeight,
    cursor: 'pointer',
    border: `1px solid ${CAMERA_TABLE.border}`,
    borderRadius: CAMERA_GRID.borderRadius,
    bgcolor: CAMERA_TOOLBAR.white,
    color: CAMERA_GRID.textPrimary,
    overflow: 'hidden',
    transition: `all ${PL.transitions.duration.standard}ms ${PL.transitions.easing.easeInOut}`,
    ...(depth > 0 &&
      !selected &&
      !active && {
        borderLeft: `4px solid ${cameraGridDepthBorderColor(depth)}`,
      }),
    ...(selected && {
      bgcolor: CAMERA_TABLE.selectedBg,
      border: `2px solid ${CAMERA_TABLE.accent}`,
    }),
    ...(active && {
      bgcolor: CAMERA_TABLE.activeRowBg,
      border: `2px solid ${PL.palette.titleText.main}`,
    }),
    '&:hover': {
      boxShadow: '0 4px 16px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)',
      outline: `1px solid ${PL.palette.primary.main}`,
      outlineOffset: 0,
    },
  }
}

export const cameraGridContainerSx: SxProps<Theme> = {
  flex: 1,
  minHeight: 0,
  overflow: 'auto',
  px: PL_CONTAINER_PADDING,
  py: PL_CARD_SPACING,
}

export const cameraGridWrapSx: SxProps<Theme> = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: PL_CARD_SPACING,
  alignContent: 'flex-start',
}

export function cameraGridItemSx(depth: number): SxProps<Theme> {
  return {
    pl: depth > 0 ? depth * PL_CARD_SPACING : 0,
  }
}

export const cameraGridThumbSx: SxProps<Theme> = {
  width: CAMERA_GRID.thumbSize,
  height: CAMERA_GRID.thumbSize,
  bgcolor: CAMERA_GRID.thumbBg,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
}

export const cameraGridNameSx: SxProps<Theme> = {
  fontFamily: PL.typography.fontFamily,
  fontSize: '0.875rem',
  fontWeight: PL.typography.fontWeightMedium,
  color: CAMERA_GRID.textPrimary,
  lineHeight: 1.43,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

export const cameraGridMetaSx: SxProps<Theme> = {
  fontFamily: PL.typography.fontFamily,
  fontSize: '0.75rem',
  fontWeight: PL.typography.fontWeightRegular,
  color: CAMERA_GRID.textMuted,
  lineHeight: 1.66,
}

export const cameraBreadcrumbsSx: SxProps<Theme> = {
  px: PL_CONTAINER_PADDING,
  py: PL_CARD_SPACING,
  fontFamily: PL.typography.fontFamily,
  fontSize: '0.875rem',
  fontWeight: PL.typography.fontWeightLight,
  '& .MuiBreadcrumbs-separator': {
    color: PL.palette.text.secondary,
  },
}

export const cameraBreadcrumbLinkSx: SxProps<Theme> = {
  fontFamily: PL.typography.fontFamily,
  fontSize: '0.875rem',
  fontWeight: PL.typography.fontWeightRegular,
  color: PL.palette.primary.main,
  textDecoration: 'none',
  cursor: 'pointer',
  '&:hover': { textDecoration: 'underline' },
}

export const cameraBreadcrumbCurrentSx: SxProps<Theme> = {
  fontFamily: PL.typography.fontFamily,
  fontSize: '0.875rem',
  fontWeight: PL.typography.fontWeightMedium,
  color: PL.palette.text.primary,
}

/** Camera detail modal content padding */
export const cameraModalContentSx: SxProps<Theme> = {
  px: PL_CONTAINER_PADDING,
  pt: 0,
  pb: PL_CARD_SPACING,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
}

/** Status chip in camera detail modal */
export const cameraStatusChipSx: SxProps<Theme> = {
  fontWeight: PL.typography.fontWeightRegular,
  fontSize: '0.75rem',
  lineHeight: 1.66,
  textTransform: 'uppercase',
}
