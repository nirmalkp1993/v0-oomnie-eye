/**
 * Earth / placemark dialog widths — aligned with OomniEye-DigitalTwin-Frontend:
 * - PlacemarkCard & pin editor: maxWidth="md" → 900px
 * - Wide layouts (schedule grid): maxWidth="lg" → 1200px
 */
export const EARTH_DIALOG_WIDTH_PX = 900
export const EARTH_DIALOG_WIDTH_WIDE_PX = 1200
export const EARTH_DIALOG_WIDTH_EXTRA_WIDE_PX = 1400
export const EARTH_DIALOG_WIDTH_CONFIRM_PX = 520

export const earthDialogMaxWidthPx = {
  sm: 444,
  md: 600,
  /** Compact confirmation dialogs (retire, delete, etc.) */
  confirm: EARTH_DIALOG_WIDTH_CONFIRM_PX,
  lg: EARTH_DIALOG_WIDTH_PX,
  xl: EARTH_DIALOG_WIDTH_PX,
  '2xl': EARTH_DIALOG_WIDTH_PX,
  '3xl': EARTH_DIALOG_WIDTH_PX,
  '4xl': EARTH_DIALOG_WIDTH_PX,
  /** Wide layout for weekly recording schedule grid */
  '5xl': EARTH_DIALOG_WIDTH_WIDE_PX,
  /** Extra-wide layout for user management add/edit/view modals */
  '6xl': EARTH_DIALOG_WIDTH_EXTRA_WIDE_PX,
} as const

export type EarthDialogMaxWidth = keyof typeof earthDialogMaxWidthPx

/** Above MUI Dialog (z-index 1300) so portaled Select/Popover menus appear on top */
export const EARTH_DIALOG_DROPDOWN_Z_CLASS = 'z-[1400]'

/** Section card accent colors — aligned with muiPlacemarkClusterTheme / earth pin dialogs */
export const EARTH_DIALOG_SECTION_ACCENTS = {
  primary: '#1976d2',
  secondary: '#9c27b0',
  info: '#0288d1',
  warning: '#ed6c02',
  success: '#2e7d32',
} as const
