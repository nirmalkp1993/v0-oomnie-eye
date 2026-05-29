'use client'

import type { SxProps, Theme } from '@mui/material/styles'

/** Visual tokens from dt_timemachine_construction_ui My Drawings list table */
export const MY_DRAWINGS_TABLE = {
  accent: '#2932E5',
  headerBg: '#FAFAFA',
  border: '#E5E7EB',
  rowHeight: 36,
  folderOpen: '#2932E5',
  folderClosed: '#4A5565',
  hoverBg: 'rgba(0, 0, 0, 0.04)',
  headerHoverBg: 'rgba(41, 50, 229, 0.06)',
  depthEvenBg: 'rgba(242, 242, 242, 0.3)',
  depthOddBg: 'rgba(255, 224, 208, 0.05)',
  selectedBg: 'rgba(41, 50, 229, 0.08)',
  selectedHoverBg: 'rgba(41, 50, 229, 0.12)',
  activeRowBg: '#FFE0D0',
  activeRowHoverBg: '#FFD0B8',
} as const

export const myDrawingsHeaderTypographySx = {
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 600,
  fontSize: '14px',
  color: MY_DRAWINGS_TABLE.accent,
  letterSpacing: '0.1px',
} as const

export const myDrawingsBodyPrimaryTypographySx = {
  fontFamily: 'Roboto, sans-serif',
  fontSize: '14px',
} as const

export const myDrawingsBodySecondaryTypographySx = {
  fontFamily: 'Roboto, sans-serif',
  fontSize: '13px',
  color: 'text.secondary',
} as const

export const myDrawingsTableSx: SxProps<Theme> = {
  minWidth: 900,
  '& .MuiTableCell-root': {
    py: 0.5,
    px: 2,
    whiteSpace: 'nowrap',
    height: `${MY_DRAWINGS_TABLE.rowHeight}px`,
  },
}

export const myDrawingsTableHeadSx: SxProps<Theme> = {
  bgcolor: MY_DRAWINGS_TABLE.headerBg,
  borderBottom: `1px solid ${MY_DRAWINGS_TABLE.border}`,
  position: 'sticky',
  top: 0,
  zIndex: 100,
  '& .MuiTableRow-root': {
    height: `${MY_DRAWINGS_TABLE.rowHeight}px`,
  },
  '& .MuiTableCell-root': {
    height: `${MY_DRAWINGS_TABLE.rowHeight}px`,
    py: 0.75,
    position: 'relative',
    zIndex: 100,
    borderBottom: `1px solid ${MY_DRAWINGS_TABLE.border}`,
  },
}

export const myDrawingsTableBodySx: SxProps<Theme> = {
  '& .MuiTableRow-root': {
    position: 'relative',
    zIndex: 1,
  },
}

export const myDrawingsTableCellSx: SxProps<Theme> = {
  borderBottom: `1px solid ${MY_DRAWINGS_TABLE.border}`,
}

/** Toolbar + control chrome from My Drawings (GoogleDriveFileList) */
export const MY_DRAWINGS_TOOLBAR = {
  shellBg: '#F9FAFB',
  shellBorder: '#E5E7EB',
  toggleBg: '#F2F2F2',
  textMuted: '#4A5565',
  textDark: '#212121',
  accentHoverBg: 'rgba(41, 50, 229, 0.04)',
  depthDotActive: '#FF8555',
  primaryBtn: '#2932E5',
  primaryBtnHover: '#1f28b8',
  white: '#FFFFFF',
} as const

export const myDrawingsToolbarShellSx: SxProps<Theme> = {
  bgcolor: MY_DRAWINGS_TOOLBAR.shellBg,
  borderBottom: `1px solid ${MY_DRAWINGS_TOOLBAR.shellBorder}`,
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
}

export const myDrawingsToolbarRowSx: SxProps<Theme> = {
  px: 2,
  py: 0.75,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 1,
  minHeight: `${MY_DRAWINGS_TABLE.rowHeight}px`,
}

export const myDrawingsSearchFieldSx: SxProps<Theme> = {
  width: 200,
  '& .MuiOutlinedInput-root': {
    height: 36,
    fontFamily: 'Roboto, sans-serif',
    fontSize: '14px',
    bgcolor: MY_DRAWINGS_TOOLBAR.white,
    padding: 0,
    borderRadius: '10px !important',
  },
  '& .MuiInputAdornment-root': {
    marginLeft: '8px',
  },
}

export const myDrawingsViewToggleSx: SxProps<Theme> = {
  bgcolor: MY_DRAWINGS_TOOLBAR.toggleBg,
  '& .MuiToggleButton-root': {
    border: `1px solid ${MY_DRAWINGS_TABLE.border}`,
    color: MY_DRAWINGS_TOOLBAR.textMuted,
    padding: '6px 12px',
    borderRadius: '10px !important',
    '&.Mui-selected': {
      bgcolor: MY_DRAWINGS_TABLE.accent,
      color: MY_DRAWINGS_TOOLBAR.white,
      '&:hover': { bgcolor: '#1E25B8' },
      borderRadius: '10px !important',
    },
    '&:hover': { bgcolor: MY_DRAWINGS_TABLE.border },
  },
}

export const myDrawingsToolbarIconButtonSx: SxProps<Theme> = {
  width: 36,
  height: 36,
  color: MY_DRAWINGS_TOOLBAR.textDark,
  '&:hover': { bgcolor: MY_DRAWINGS_TOOLBAR.accentHoverBg },
}

export const myDrawingsToolbarOutlineButtonSx: SxProps<Theme> = {
  minHeight: 36,
  height: 36,
  textTransform: 'none',
  fontFamily: 'Roboto, sans-serif',
  fontSize: '14px',
  fontWeight: 500,
  color: MY_DRAWINGS_TOOLBAR.textMuted,
  borderColor: MY_DRAWINGS_TABLE.border,
  borderRadius: '10px',
  px: 1.5,
  bgcolor: MY_DRAWINGS_TOOLBAR.white,
  '&:hover': {
    bgcolor: MY_DRAWINGS_TOOLBAR.toggleBg,
    borderColor: MY_DRAWINGS_TABLE.accent,
  },
}

export const myDrawingsPrimaryButtonSx: SxProps<Theme> = {
  minHeight: 36,
  textTransform: 'none',
  fontFamily: 'Roboto, sans-serif',
  fontSize: '14px',
  fontWeight: 600,
  bgcolor: MY_DRAWINGS_TABLE.accent,
  color: MY_DRAWINGS_TOOLBAR.white,
  borderRadius: '10px !important',
  px: 2,
  boxShadow: 'none',
  '&:hover': {
    bgcolor: MY_DRAWINGS_TOOLBAR.primaryBtnHover,
    boxShadow: 'none',
  },
}

export const myDrawingsFilterBadgeSx: SxProps<Theme> = {
  height: 18,
  minWidth: 18,
  fontSize: '10px',
  fontWeight: 600,
  bgcolor: MY_DRAWINGS_TABLE.accent,
}

export function myDrawingsBodyRowSx(options?: {
  depth?: number
  selected?: boolean
  active?: boolean
}): SxProps<Theme> {
  const depth = options?.depth ?? 0
  const selected = options?.selected ?? false
  const active = options?.active ?? false

  return {
    height: MY_DRAWINGS_TABLE.rowHeight,
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    ...(!selected &&
      !active &&
      depth > 0 && {
        bgcolor: depth % 2 === 0 ? MY_DRAWINGS_TABLE.depthEvenBg : MY_DRAWINGS_TABLE.depthOddBg,
      }),
    ...(active && {
      bgcolor: `${MY_DRAWINGS_TABLE.activeRowBg} !important`,
      borderLeft: `3px solid ${MY_DRAWINGS_TABLE.accent}`,
      '&:hover': {
        bgcolor: `${MY_DRAWINGS_TABLE.activeRowHoverBg} !important`,
      },
    }),
    ...(selected && {
      bgcolor: MY_DRAWINGS_TABLE.selectedBg,
      borderLeft: `3px solid ${MY_DRAWINGS_TABLE.accent}`,
      '&:hover': {
        bgcolor: MY_DRAWINGS_TABLE.selectedHoverBg,
      },
    }),
    '&:hover': {
      bgcolor: selected || active ? undefined : MY_DRAWINGS_TABLE.hoverBg,
      transform: 'translateX(2px)',
    },
  }
}

/** My Drawings grid view card tokens (GoogleDriveFileList grid mode) */
export const MY_DRAWINGS_GRID = {
  cardWidth: 218,
  cardHeight: 317,
  thumbSize: 200,
  borderRadius: '14px',
  thumbBg: '#F2F2F2',
  textPrimary: '#212121',
  textMuted: '#4A5565',
} as const

export function myDrawingsGridDepthBorderColor(depth: number): string {
  if (depth === 1) return MY_DRAWINGS_TABLE.accent
  if (depth === 2) return MY_DRAWINGS_TOOLBAR.depthDotActive
  if (depth === 3) return MY_DRAWINGS_TABLE.folderClosed
  return MY_DRAWINGS_TABLE.border
}

export function myDrawingsGridCardSx(options?: {
  depth?: number
  selected?: boolean
  active?: boolean
}): SxProps<Theme> {
  const depth = options?.depth ?? 0
  const selected = options?.selected ?? false
  const active = options?.active ?? false

  return {
    position: 'relative',
    width: MY_DRAWINGS_GRID.cardWidth,
    height: MY_DRAWINGS_GRID.cardHeight,
    cursor: 'pointer',
    border: `1px solid ${MY_DRAWINGS_TABLE.border}`,
    borderRadius: MY_DRAWINGS_GRID.borderRadius,
    bgcolor: MY_DRAWINGS_TOOLBAR.white,
    color: MY_DRAWINGS_GRID.textPrimary,
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ...(depth > 0 &&
      !selected &&
      !active && {
        borderLeft: `4px solid ${myDrawingsGridDepthBorderColor(depth)}`,
      }),
    ...(selected && {
      bgcolor: MY_DRAWINGS_TABLE.selectedBg,
      border: `2px solid ${MY_DRAWINGS_TABLE.accent}`,
    }),
    ...(active && {
      bgcolor: MY_DRAWINGS_TABLE.activeRowBg,
      border: `2px solid ${MY_DRAWINGS_TOOLBAR.depthDotActive}`,
    }),
    '&:hover': {
      boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
      transform: 'translateY(-4px) scale(1.02)',
    },
  }
}

export const myDrawingsGridThumbSx: SxProps<Theme> = {
  width: MY_DRAWINGS_GRID.thumbSize,
  height: MY_DRAWINGS_GRID.thumbSize,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  bgcolor: MY_DRAWINGS_GRID.thumbBg,
  borderRadius: 1,
  transition: 'all 0.2s ease-in-out',
  overflow: 'hidden',
}

export const myDrawingsGridNameSx = {
  fontFamily: 'Roboto, sans-serif',
  fontSize: '13px',
  fontWeight: 600,
  textAlign: 'center' as const,
  width: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap' as const,
  color: MY_DRAWINGS_GRID.textPrimary,
}

export const myDrawingsGridMetaSx = {
  fontFamily: 'Roboto, sans-serif',
  color: MY_DRAWINGS_GRID.textMuted,
  fontSize: '11px',
}

export const myDrawingsGridDepthChipSx: SxProps<Theme> = {
  position: 'absolute',
  top: 8,
  left: 8,
  bgcolor: MY_DRAWINGS_TABLE.activeRowBg,
  color: MY_DRAWINGS_TOOLBAR.depthDotActive,
  fontWeight: 600,
  fontSize: '10px',
  height: 20,
  zIndex: 2,
  '& .MuiChip-icon': { color: MY_DRAWINGS_TOOLBAR.depthDotActive },
}

export function myDrawingsGridFolderExpandBtnSx(hasLevelBadge: boolean): SxProps<Theme> {
  return {
    position: 'absolute',
    top: hasLevelBadge ? 34 : 8,
    left: 8,
    bgcolor: MY_DRAWINGS_TOOLBAR.white,
    zIndex: 2,
    transition: 'all 0.2s ease-in-out',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    '&:hover': {
      bgcolor: MY_DRAWINGS_GRID.thumbBg,
      transform: 'scale(1.15)',
      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
    },
  }
}

export const myDrawingsBreadcrumbsSx: SxProps<Theme> = {
  flex: 1,
  overflow: 'hidden',
  '& .MuiBreadcrumbs-ol': {
    flexWrap: 'nowrap',
    alignItems: 'center',
  },
  '& .MuiBreadcrumbs-li': {
    display: 'inline-flex',
    alignItems: 'center',
    minWidth: 0,
  },
  '& .MuiBreadcrumbs-separator': {
    color: MY_DRAWINGS_GRID.textMuted,
    fontSize: '18px',
    mx: 1,
  },
}

export const myDrawingsBreadcrumbLinkSx: SxProps<Theme> = {
  cursor: 'pointer',
  color: MY_DRAWINGS_GRID.textMuted,
  fontFamily: 'Roboto, sans-serif',
  fontSize: '16px',
  p: 1,
  borderRadius: 1,
  transition: 'all 0.2s',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: 200,
  textDecoration: 'none',
  '&:hover': {
    color: MY_DRAWINGS_TABLE.accent,
    bgcolor: 'rgba(41, 50, 229, 0.08)',
  },
}

export const myDrawingsBreadcrumbCurrentSx = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.5,
  color: MY_DRAWINGS_GRID.textPrimary,
  fontWeight: 600,
  fontFamily: 'Roboto, sans-serif',
  fontSize: '16px',
  minWidth: 0,
}

export const myDrawingsGridContainerSx: SxProps<Theme> = {
  flex: 1,
  overflow: 'auto',
  p: 1,
}

export const myDrawingsGridWrapSx: SxProps<Theme> = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 1,
  width: '100%',
  pb: 1,
  boxSizing: 'border-box',
}

export function myDrawingsGridItemSx(depth: number): SxProps<Theme> {
  return {
    ml: depth > 0 ? `${depth * 16}px` : 0,
    position: 'relative',
    width: MY_DRAWINGS_GRID.cardWidth,
    height: MY_DRAWINGS_GRID.cardHeight,
  }
}
