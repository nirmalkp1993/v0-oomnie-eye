import { PROFESSIONAL_LIGHT } from '@/src/components/theme/professional-light-theme'

/** Matches OomniEye PlacemarkCard / SettingsCard layout tokens */
export const PLACEMARK_CARD_BG_OPACITY_DEFAULT = 90

/** Professional Light shape.borderRadius — explicit px for reliable card clipping */
export const CARD_BORDER_RADIUS_PX = PROFESSIONAL_LIGHT.shape.borderRadius

/** MUI sx unit (1 × theme.shape.borderRadius) — kept for theme-aware sx props */
export const CARD_BORDER_RADIUS_UNIT = 1

/** Header icon box radius — matches Frontend SettingsCard (borderRadius: 2 → 16px) */
export const CARD_ICON_BORDER_RADIUS_UNIT = 2

/** Matches OomniEye-DigitalTwin-Frontend CARD_DIMENSIONS */
export const CARD_DIMENSIONS = {
  minHeight: 200,
  padding: 3,
  borderRadius: CARD_BORDER_RADIUS_UNIT,
  borderRadiusPx: CARD_BORDER_RADIUS_PX,
  spacing: 2,
} as const

export const PLACEMARK_HEADER_GRADIENT = {
  preview: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
  viewing: 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
  edit: 'linear-gradient(135deg, #ed6c02 0%, #e65100 100%)',
} as const
