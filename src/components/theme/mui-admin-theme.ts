'use client'

import type {} from '@mui/x-data-grid/themeAugmentation'
import { createTheme, alpha } from '@mui/material/styles'

/** Mirrors `app/globals.css` :root — keeps User Management visually aligned with Camera / Earth modules */
const bg = '#f5f5f7'
const paper = '#ffffff'
const fg = '#1a1a2e'
const mutedFg = '#6b7280'
const border = '#d1d5db'
const mutedBg = '#e8e8ed'
const inputBg = '#f3f4f6'
const primary = '#0891b2'
const primaryDark = '#0e7490'
const primaryLight = '#22d3ee'
const accent = '#ea580c'
const radius = 10

export const muiAdminTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: primary,
      light: primaryLight,
      dark: primaryDark,
      contrastText: '#ffffff',
    },
    secondary: {
      main: mutedBg,
      contrastText: fg,
    },
    error: { main: '#dc2626', contrastText: '#ffffff' },
    success: { main: '#16a34a', contrastText: '#ffffff' },
    warning: { main: accent, contrastText: '#1a1a2e' },
    info: { main: primary, contrastText: '#ffffff' },
    background: {
      default: bg,
      paper,
    },
    divider: border,
    text: {
      primary: fg,
      secondary: mutedFg,
    },
    action: {
      active: fg,
      hover: alpha(primary, 0.06),
      selected: alpha(primary, 0.1),
      disabled: alpha(fg, 0.38),
      disabledBackground: alpha(border, 0.5),
    },
  },
  shape: {
    borderRadius: radius,
  },
  typography: {
    fontFamily: "'Geist', 'Geist Fallback', ui-sans-serif, system-ui, sans-serif",
    fontSize: 14,
    htmlFontSize: 16,
    h4: { fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.25, letterSpacing: '-0.02em', color: fg },
    h5: { fontWeight: 700, fontSize: '1.25rem', color: fg },
    h6: { fontWeight: 600, fontSize: '1rem', color: fg },
    subtitle1: { fontWeight: 600, fontSize: '0.9375rem', color: fg },
    subtitle2: { fontWeight: 600, fontSize: '0.875rem', color: fg },
    body1: { fontSize: '0.875rem', lineHeight: 1.5, color: fg },
    body2: { fontSize: '0.875rem', lineHeight: 1.5, color: mutedFg },
    caption: { fontSize: '0.75rem', color: mutedFg },
    button: { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: bg },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: radius,
        },
        outlined: {
          borderColor: border,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: radius, fontWeight: 600, textTransform: 'none' },
        containedPrimary: {
          backgroundColor: primary,
          '&:hover': { backgroundColor: primaryDark },
        },
        outlined: {
          borderColor: border,
          color: fg,
          '&:hover': { borderColor: border, backgroundColor: alpha(fg, 0.04) },
        },
        outlinedError: {
          borderColor: alpha('#dc2626', 0.5),
          color: '#dc2626',
          '&:hover': { backgroundColor: alpha('#dc2626', 0.06) },
        },
        text: { color: mutedFg },
        textInherit: { color: fg },
        sizeSmall: { fontSize: '0.8125rem', padding: '4px 10px' },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: radius,
          color: mutedFg,
          '&:hover': { backgroundColor: alpha(fg, 0.06), color: fg },
        },
        colorInherit: { color: mutedFg },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radius,
          backgroundColor: inputBg,
          fontSize: '0.875rem',
          '& fieldset': { borderColor: border },
          '&:hover fieldset': { borderColor: alpha(primary, 0.45) },
          '&.Mui-focused fieldset': { borderColor: primary, borderWidth: 1 },
        },
        inputSizeSmall: { paddingTop: 8, paddingBottom: 8 },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { fontSize: '0.875rem', color: mutedFg, '&.Mui-focused': { color: primary } },
      },
    },
    MuiFormHelperText: {
      styleOverrides: { root: { fontSize: '0.75rem' } },
    },
    MuiSelect: {
      styleOverrides: {
        root: { borderRadius: radius, backgroundColor: inputBg, fontSize: '0.875rem' },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: radius,
          border: `1px solid ${border}`,
          boxShadow: '0 10px 40px rgba(15, 23, 41, 0.1)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          borderRadius: 6,
          marginInline: 4,
          '&:hover': { backgroundColor: alpha(primary, 0.08) },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: radius,
          border: `1px solid ${border}`,
          boxShadow: '0 24px 64px rgba(15, 23, 41, 0.12)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: { fontSize: '1.125rem', fontWeight: 700, paddingBottom: 8, color: fg },
      },
    },
    MuiDialogContent: {
      styleOverrides: { root: { paddingTop: 8 } },
    },
    MuiDialogActions: {
      styleOverrides: { root: { padding: '12px 24px 20px', gap: 8 } },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: '0.75rem', borderRadius: 9999 },
        colorSuccess: { backgroundColor: '#16a34a', color: '#fff' },
        colorWarning: { backgroundColor: accent, color: '#1a1a2e' },
        outlined: { borderColor: border },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 64,
        },
        indicator: {
          backgroundColor: primary,
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
          color: fg,
          opacity: 1,
          '&:hover': {
            color: primary,
            backgroundColor: alpha(primary, 0.06),
          },
          '&.Mui-selected': {
            color: primary,
            fontWeight: 600,
            backgroundColor: alpha(primary, 0.08),
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: mutedFg,
          '&.Mui-checked': { color: primary },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': { color: primary },
          '&.Mui-checked + .MuiSwitch-track': { backgroundColor: alpha(primary, 0.5) },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontSize: '0.75rem', fontWeight: 700, color: mutedFg, backgroundColor: mutedBg, borderColor: border },
        root: { fontSize: '0.875rem', borderColor: border },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: { '&:hover': { backgroundColor: alpha(primary, 0.04) } },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardSuccess: { backgroundColor: '#16a34a', color: '#fff' },
        standardInfo: { backgroundColor: primary, color: '#fff' },
        standardWarning: { backgroundColor: accent, color: '#1a1a2e' },
        standardError: { backgroundColor: '#dc2626', color: '#fff' },
        filledSuccess: { backgroundColor: '#16a34a' },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          borderRadius: radius,
          fontSize: '0.875rem',
          fontFamily: "'Geist', 'Geist Fallback', ui-sans-serif, system-ui, sans-serif",
          color: fg,
          backgroundColor: paper,
          '--DataGrid-rowBorderColor': border,
        },
        columnHeaders: {
          backgroundColor: 'transparent',
          color: primary,
          fontSize: '0.875rem',
          fontWeight: 600,
          borderBottom: `1px solid ${border}`,
        },
        columnHeaderTitle: {
          fontWeight: 600,
          color: primary,
        },
        columnHeader: {
          '& .MuiDataGrid-menuIconButton': { display: 'none' },
        },
        panel: {
          borderRadius: radius,
          border: `1px solid ${border}`,
          boxShadow: '0 10px 40px rgba(15, 23, 41, 0.1)',
        },
        panelHeader: {
          fontWeight: 600,
          fontSize: '0.875rem',
        },
        footerContainer: {
          borderTop: `1px solid ${border}`,
          backgroundColor: paper,
          fontSize: '0.8125rem',
          color: mutedFg,
        },
        row: {
          '&:hover': { backgroundColor: alpha(primary, 0.05) },
          '&.Mui-selected': {
            backgroundColor: alpha(primary, 0.08),
            '&:hover': { backgroundColor: alpha(primary, 0.1) },
          },
        },
        cell: {
          borderColor: border,
          color: mutedFg,
        },
        toolbarContainer: {
          backgroundColor: paper,
          borderBottom: `1px solid ${border}`,
          minHeight: 48,
        },
        overlay: {
          backgroundColor: alpha(paper, 0.85),
        },
      },
    },
  },
})
