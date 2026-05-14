/** Pin category for the Reports module (tabs + API payload discriminator). */
export type ReportPinType = 'places' | 'camera' | 'site_patrol' | 'assets' | 'iots'

export interface ReportPlacemark {
  id: string
  pinType: ReportPinType
  placemarkName: string
  /** Icon key from API; mapped to Lucide in UI */
  pinIcon: string
  iconColor: string
  category: string
  tags: string[]
  city: string
  country: string
  region: string
  latitude: number
  longitude: number
  altitude: number
  grounding: string
  description: string
  groupIds: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ReportGroup {
  id: string
  pinType: ReportPinType
  name: string
  parentGroupIds: string[]
  createdAt: Date
  updatedAt: Date
}
