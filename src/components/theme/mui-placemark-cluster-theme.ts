'use client'

import { createTheme } from '@mui/material/styles'

/**
 * Matches OomniEye-DigitalTwin-Frontend `professional-light` content theme
 * (PlacemarkCard / SettingsCard / info card h6 orange titles).
 */
export const muiPlacemarkClusterTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#9c27b0',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
      contrastText: '#ffffff',
    },
    success: {
      main: '#2e7d32',
      contrastText: '#ffffff',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
    action: {
      hover: 'rgba(0, 0, 0, 0.04)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
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
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  zIndex: {
    fab: 1050,
  },
})
