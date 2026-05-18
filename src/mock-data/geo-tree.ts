import { MOCK_GEO_DATA } from '@/src/mock-data/mockGeoData'

export type GeoLocationType = 'world' | 'continent' | 'country' | 'state' | 'city'

export interface GeoTreeNode {
  id: string
  name: string
  type: GeoLocationType
  children?: GeoTreeNode[]
}

/** @deprecated Use MOCK_GEO_DATA — kept for existing imports */
export const GEO_TREE_ROOT: GeoTreeNode = MOCK_GEO_DATA as GeoTreeNode
