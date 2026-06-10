'use client'

import type {} from '@mui/x-data-grid/themeAugmentation'
import { createTheme, alpha } from '@mui/material/styles'
import { PROFESSIONAL_LIGHT } from './professional-light-theme'

const PL = PROFESSIONAL_LIGHT
const { palette: p, shape, typography: t } = PL

export const muiAdminTheme = createTheme({
  palette: {
    mode: 'light',
    primary: p.primary,
    secondary: p.secondary,
    error: p.error,
    success: p.success,
    warning: p.warning,
    info: p.info,
    background: p.background,
    divider: p.divider,
    text: p.text,
    action: {
      active: p.text.primary,
      hover: alpha(p.primary.main, 0.06),
      selected: alpha(p.primary.main, 0.1),
      disabled: p.text.disabled,
      disabledBackground: alpha(p.divider, 0.5),
    },
  },
  shape: {
    borderRadius: shape.borderRadius,
  },
  spacing: PL.spacing.baseUnit,
  typography: {
    fontFamily: `"${t.fontFamily.split(',')[0]}", "Helvetica", "Arial", sans-serif`,
    fontSize: t.fontSize,
    fontWeightLight: t.fontWeightLight,
    fontWeightRegular: t.fontWeightRegular,
    fontWeightMedium: t.fontWeightMedium,
    fontWeightBold: t.fontWeightBold,
    h1: { fontSize: '6rem', fontWeight: 300, lineHeight: 1.167, color: '#FF9800' },
    h2: { fontSize: '3.75rem', fontWeight: 300, lineHeight: 1.2, color: '#FF9800' },
    h3: { fontSize: '3rem', fontWeight: 300, lineHeight: 1.167, color: '#FF9800' },
    h4: { fontSize: '2.125rem', fontWeight: 300, lineHeight: 1.235, color: '#FF9800' },
    h5: { fontSize: '1.5rem', fontWeight: 300, lineHeight: 1.334, color: '#FF9800' },
    h6: { fontSize: '1rem', fontWeight: 300, lineHeight: 1.6, color: '#FF9800' },
    subtitle1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.75 },
    subtitle2: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.57 },
    body1: { fontSize: '1rem', fontWeight: 300, lineHeight: 1.5, color: p.text.primary },
    body2: { fontSize: '0.875rem', fontWeight: 300, lineHeight: 1.43, color: p.text.secondary },
    caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.66, color: p.text.secondary },
    button: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.75, textTransform: 'uppercase' },
    overline: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 2.66, textTransform: 'uppercase' },
  },
  zIndex: {
    modal: PL.zIndex.modal,
    tooltip: PL.zIndex.tooltip,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: p.background.default },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: shape.borderRadius,
        },
        outlined: {
          borderColor: p.divider,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: shape.borderRadius,
          fontWeight: 400,
          textTransform: 'uppercase',
          fontSize: '0.875rem',
          lineHeight: 1.75,
        },
        containedPrimary: {
          backgroundColor: p.primary.main,
          '&:hover': { backgroundColor: p.primary.dark },
        },
        outlined: {
          borderColor: PL.chrome.border,
          color: p.text.primary,
          '&:hover': { borderColor: PL.chrome.border, backgroundColor: 'rgba(0, 0, 0, 0.04)' },
        },
        outlinedError: {
          borderColor: alpha(p.error.main, 0.5),
          color: p.error.main,
          '&:hover': { backgroundColor: alpha(p.error.main, 0.06) },
        },
        text: { color: p.text.secondary },
        textInherit: { color: p.text.primary },
        sizeSmall: { fontSize: '0.8125rem', padding: '4px 10px' },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: shape.borderRadius,
          color: PL.chrome.iconInactive,
          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)', color: PL.chrome.iconActive },
        },
        colorInherit: { color: PL.chrome.iconInactive },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: shape.borderRadius,
          backgroundColor: p.background.paper,
          fontSize: '0.875rem',
          fontWeight: 300,
          '& fieldset': { borderColor: PL.chrome.border },
          '&:hover fieldset': { borderColor: alpha(p.primary.main, 0.45) },
          '&.Mui-focused fieldset': { borderColor: p.primary.main, borderWidth: 1 },
        },
        inputSizeSmall: { paddingTop: 8, paddingBottom: 8 },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          fontWeight: 400,
          color: p.text.secondary,
          '&.Mui-focused': { color: p.primary.main },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: { root: { fontSize: '0.75rem', fontWeight: 400 } },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: shape.borderRadius,
          backgroundColor: p.background.paper,
          fontSize: '0.875rem',
          fontWeight: 300,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: shape.borderRadius,
          border: `1px solid ${p.divider}`,
          boxShadow: '0 10px 40px rgba(15, 23, 41, 0.1)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          fontWeight: 300,
          borderRadius: shape.borderRadiusSm,
          marginInline: 4,
          '&:hover': { backgroundColor: alpha(p.primary.main, 0.08) },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: shape.borderRadius,
          border: `1px solid ${p.divider}`,
          boxShadow: '0 24px 64px rgba(15, 23, 41, 0.12)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.5rem',
          fontWeight: 300,
          lineHeight: 1.334,
          paddingBottom: 8,
          color: '#FF9800',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: { root: { paddingTop: PL.spacing.containerPadding } },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: `${PL.spacing.cardSpacing * PL.spacing.baseUnit}px ${PL.spacing.containerPadding * PL.spacing.baseUnit}px`,
          gap: PL.spacing.cardSpacing * PL.spacing.baseUnit,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 400,
          fontSize: '0.75rem',
          borderRadius: shape.borderRadiusSm,
        },
        colorSuccess: { backgroundColor: p.success.main, color: '#fff' },
        colorWarning: { backgroundColor: p.warning.main, color: '#fff' },
        outlined: { borderColor: p.divider },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 64 },
        indicator: {
          backgroundColor: p.primary.main,
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '14px',
          lineHeight: '20px',
          minHeight: 64,
          minWidth: 140,
          maxWidth: 200,
          color: p.text.primary,
          opacity: 1,
          '&:hover': {
            color: p.primary.main,
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
          '&.Mui-selected': {
            color: p.primary.main,
            fontWeight: 600,
            backgroundColor: 'rgba(25, 118, 210, 0.08)',
          },
          '&.Mui-selected:hover': {
            color: p.primary.light,
            backgroundColor: 'rgba(25, 118, 210, 0.12)',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: p.text.secondary,
          '&.Mui-checked': { color: p.primary.main },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': { color: p.primary.main },
          '&.Mui-checked + .MuiSwitch-track': { backgroundColor: alpha(p.primary.main, 0.5) },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontSize: '0.75rem',
          fontWeight: 500,
          color: p.text.secondary,
          backgroundColor: p.background.default,
          borderColor: PL.chrome.border,
        },
        root: { fontSize: '0.875rem', fontWeight: 300, borderColor: PL.chrome.border },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: { '&:hover': { backgroundColor: alpha(p.primary.main, 0.04) } },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardSuccess: { backgroundColor: p.success.main, color: '#fff' },
        standardInfo: { backgroundColor: p.info.main, color: '#fff' },
        standardWarning: { backgroundColor: p.warning.main, color: '#fff' },
        standardError: { backgroundColor: p.error.main, color: '#fff' },
        filledSuccess: { backgroundColor: p.success.main },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          borderRadius: shape.borderRadius,
          fontSize: '0.875rem',
          fontWeight: 300,
          fontFamily: t.fontFamily,
          color: p.text.primary,
          backgroundColor: p.background.paper,
          '--DataGrid-rowBorderColor': PL.chrome.border,
        },
        columnHeaders: {
          backgroundColor: 'transparent',
          color: p.primary.main,
          fontSize: '0.875rem',
          fontWeight: 500,
          borderBottom: `1px solid ${PL.chrome.border}`,
        },
        columnHeaderTitle: {
          fontWeight: 500,
          color: p.primary.main,
        },
        columnHeader: {
          '& .MuiDataGrid-menuIconButton': { display: 'none' },
        },
        panel: {
          borderRadius: shape.borderRadius,
          border: `1px solid ${p.divider}`,
          boxShadow: '0 10px 40px rgba(15, 23, 41, 0.1)',
        },
        panelHeader: {
          fontWeight: 500,
          fontSize: '0.875rem',
        },
        footerContainer: {
          borderTop: `1px solid ${PL.chrome.border}`,
          backgroundColor: p.background.paper,
          fontSize: '0.8125rem',
          fontWeight: 300,
          color: p.text.secondary,
        },
        row: {
          '&:hover': { backgroundColor: alpha(p.primary.main, 0.05) },
          '&.Mui-selected': {
            backgroundColor: alpha(p.primary.main, 0.08),
            '&:hover': { backgroundColor: alpha(p.primary.main, 0.1) },
          },
        },
        cell: {
          borderColor: PL.chrome.border,
          color: p.text.secondary,
        },
        toolbarContainer: {
          backgroundColor: p.background.paper,
          borderBottom: `1px solid ${PL.chrome.border}`,
          minHeight: 48,
        },
        overlay: {
          backgroundColor: alpha(p.background.paper, 0.85),
        },
      },
    },
  },
})
