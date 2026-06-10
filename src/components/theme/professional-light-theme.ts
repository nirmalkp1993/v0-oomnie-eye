/**
 * Professional Light (v3) — matches exported `professional-light` theme JSON.
 */
export const PROFESSIONAL_LIGHT = {
  palette: {
    primary: { main: '#1976d2', light: '#42a5f5', dark: '#1565c0', contrastText: '#ffffff' },
    secondary: { main: '#9c27b0', light: '#ba68c8', dark: '#7b1fa2', contrastText: '#ffffff' },
    error: { main: '#d32f2f', light: '#ef5350', dark: '#c62828', contrastText: '#ffffff' },
    warning: { main: '#ed6c02', light: '#ff9800', dark: '#e65100', contrastText: '#ffffff' },
    info: { main: '#0288d1', light: '#03a9f4', dark: '#01579b', contrastText: '#ffffff' },
    success: { main: '#2e7d32', light: '#4caf50', dark: '#1b5e20', contrastText: '#ffffff' },
    titleText: { main: '#ff9800', light: '#ffb74d', dark: '#f57c00', contrastText: '#000000' },
    background: { default: '#fafafa', paper: '#ffffff' },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  chrome: {
    background: '#ffffff',
    text: '#000000',
    textSecondary: '#616161',
    iconActive: '#1976d2',
    iconInactive: '#9e9e9e',
    border: '#e0e0e0',
  },
  typography: {
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
  spacing: {
    baseUnit: 4,
    cardSpacing: 2,
    containerPadding: 3,
  },
  shape: {
    borderRadius: 8,
    borderRadiusSm: 4,
    borderRadiusLg: 12,
    borderRadiusXl: 16,
  },
  zIndex: {
    modal: 1300,
    tooltip: 1400,
  },
  transitions: {
    duration: { shorter: 200, standard: 300 },
    easing: { easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)' },
  },
} as const

/** MUI spacing units (theme.spacing factor = baseUnit 4) */
export const PL_CONTAINER_PADDING = PROFESSIONAL_LIGHT.spacing.containerPadding
export const PL_CARD_SPACING = PROFESSIONAL_LIGHT.spacing.cardSpacing
