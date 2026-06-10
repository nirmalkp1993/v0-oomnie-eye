'use client'

import { createTheme, alpha } from '@mui/material/styles'
import { PROFESSIONAL_LIGHT } from './professional-light-theme'

const PL = PROFESSIONAL_LIGHT
const { palette: p, shape, typography: t } = PL

/**
 * Matches OomniEye-DigitalTwin-Frontend `professional-light` content theme
 * (PlacemarkCard / SettingsCard / earth dialogs).
 */
export const muiPlacemarkClusterTheme = createTheme({
  palette: {
    mode: 'light',
    primary: p.primary,
    secondary: p.secondary,
    error: p.error,
    warning: p.warning,
    info: p.info,
    success: p.success,
    background: p.background,
    text: p.text,
    divider: p.divider,
    action: {
      hover: 'rgba(0, 0, 0, 0.04)',
    },
  },
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
    body1: { fontSize: '1rem', fontWeight: 300, lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', fontWeight: 300, lineHeight: 1.43 },
    button: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.75, textTransform: 'uppercase' },
    caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.66 },
    overline: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 2.66, textTransform: 'uppercase' },
  },
  shape: {
    borderRadius: shape.borderRadius,
  },
  spacing: PL.spacing.baseUnit,
  zIndex: {
    modal: PL.zIndex.modal,
    tooltip: PL.zIndex.tooltip,
    fab: 1050,
  },
  components: {
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: shape.borderRadius,
          overflow: 'hidden',
          backgroundImage: 'none',
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
          textTransform: 'uppercase',
          '&:hover': { borderColor: PL.chrome.border, backgroundColor: 'rgba(0, 0, 0, 0.04)' },
        },
        sizeSmall: { fontSize: '0.8125rem' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: shape.borderRadius,
          border: `1px solid ${p.divider}`,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 64 },
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
          backgroundColor: p.primary.main,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          minHeight: 64,
          minWidth: 140,
          maxWidth: 200,
          fontWeight: 500,
          fontSize: '14px',
          lineHeight: '20px',
          color: `${p.text.primary} !important`,
          opacity: 1,
          '& .MuiTab-iconWrapper': {
            marginRight: '8px',
            marginBottom: '0 !important',
          },
          '&:hover': {
            color: `${p.primary.main} !important`,
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
          '&.Mui-selected': {
            color: `${p.primary.main} !important`,
            backgroundColor: 'rgba(25, 118, 210, 0.08)',
            fontWeight: 600,
          },
          '&.Mui-selected:hover': {
            color: `${p.primary.light} !important`,
            backgroundColor: 'rgba(25, 118, 210, 0.12)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 400, fontSize: '0.75rem' },
        colorSuccess: { backgroundColor: p.success.main, color: '#fff' },
        colorWarning: { backgroundColor: p.warning.main, color: '#fff' },
        colorError: { backgroundColor: p.error.main, color: '#fff' },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: shape.borderRadius,
          fontSize: '0.875rem',
          fontWeight: 300,
          '& fieldset': { borderColor: PL.chrome.border },
          '&:hover fieldset': { borderColor: alpha(p.primary.main, 0.45) },
          '&.Mui-focused fieldset': { borderColor: p.primary.main },
        },
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
  },
})
