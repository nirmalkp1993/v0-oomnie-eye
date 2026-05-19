/** Matches PlacemarkCardPanel default width in earth pin dialogs */
export const EARTH_DIALOG_WIDTH_PX = 760

export const earthDialogMaxWidthPx = {
  sm: 400,
  md: 480,
  lg: 600,
  xl: 700,
  '2xl': EARTH_DIALOG_WIDTH_PX,
  '3xl': EARTH_DIALOG_WIDTH_PX,
  '4xl': EARTH_DIALOG_WIDTH_PX,
} as const

export type EarthDialogMaxWidth = keyof typeof earthDialogMaxWidthPx

/** Section card accent colors — aligned with muiPlacemarkClusterTheme / earth pin dialogs */
export const EARTH_DIALOG_SECTION_ACCENTS = {
  primary: '#1976d2',
  secondary: '#9c27b0',
  info: '#0288d1',
  warning: '#ed6c02',
  success: '#2e7d32',
} as const
