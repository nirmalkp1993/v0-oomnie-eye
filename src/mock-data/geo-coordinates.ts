import type { GeoLocationType } from '@/src/mock-data/geo-tree'

export interface GeoCoordinate {
  latitude: number
  longitude: number
  zoom: number
}

const ZOOM_BY_TYPE: Record<GeoLocationType, number> = {
  world: 2,
  continent: 3,
  country: 5,
  state: 7,
  city: 11,
}

/** Approximate centroids for mock geo tree nodes (used for map preview fly-to). */
export const GEO_COORDINATES_BY_ID: Record<string, GeoCoordinate> = {
  world: { latitude: 20, longitude: 0, zoom: ZOOM_BY_TYPE.world },
  asia: { latitude: 34.05, longitude: 100.62, zoom: ZOOM_BY_TYPE.continent },
  india: { latitude: 20.59, longitude: 78.96, zoom: ZOOM_BY_TYPE.country },
  rajasthan: { latitude: 26.24, longitude: 73.02, zoom: ZOOM_BY_TYPE.state },
  jaipur: { latitude: 26.9124, longitude: 75.7873, zoom: ZOOM_BY_TYPE.city },
  jodhpur: { latitude: 26.2389, longitude: 73.0243, zoom: ZOOM_BY_TYPE.city },
  udaipur: { latitude: 24.5854, longitude: 73.7125, zoom: ZOOM_BY_TYPE.city },
  maharashtra: { latitude: 19.7515, longitude: 75.7139, zoom: ZOOM_BY_TYPE.state },
  mumbai: { latitude: 19.076, longitude: 72.8777, zoom: ZOOM_BY_TYPE.city },
  pune: { latitude: 18.5204, longitude: 73.8567, zoom: ZOOM_BY_TYPE.city },
  delhi: { latitude: 28.7041, longitude: 77.1025, zoom: ZOOM_BY_TYPE.city },
  japan: { latitude: 36.2048, longitude: 138.2529, zoom: ZOOM_BY_TYPE.country },
  tokyo: { latitude: 35.6762, longitude: 139.6503, zoom: ZOOM_BY_TYPE.city },
  osaka: { latitude: 34.6937, longitude: 135.5023, zoom: ZOOM_BY_TYPE.city },
  uae: { latitude: 23.4241, longitude: 53.8478, zoom: ZOOM_BY_TYPE.country },
  dubai: { latitude: 25.2048, longitude: 55.2708, zoom: ZOOM_BY_TYPE.city },
  europe: { latitude: 54.53, longitude: 15.26, zoom: ZOOM_BY_TYPE.continent },
  germany: { latitude: 51.1657, longitude: 10.4515, zoom: ZOOM_BY_TYPE.country },
  berlin: { latitude: 52.52, longitude: 13.405, zoom: ZOOM_BY_TYPE.city },
  munich: { latitude: 48.1351, longitude: 11.582, zoom: ZOOM_BY_TYPE.city },
  france: { latitude: 46.2276, longitude: 2.2137, zoom: ZOOM_BY_TYPE.country },
  paris: { latitude: 48.8566, longitude: 2.3522, zoom: ZOOM_BY_TYPE.city },
  uk: { latitude: 55.3781, longitude: -3.436, zoom: ZOOM_BY_TYPE.country },
  london: { latitude: 51.5074, longitude: -0.1278, zoom: ZOOM_BY_TYPE.city },
  'north-america': { latitude: 54.53, longitude: -105.26, zoom: ZOOM_BY_TYPE.continent },
  usa: { latitude: 39.8283, longitude: -98.5795, zoom: ZOOM_BY_TYPE.country },
  california: { latitude: 36.7783, longitude: -119.4179, zoom: ZOOM_BY_TYPE.state },
  'los-angeles': { latitude: 34.0522, longitude: -118.2437, zoom: ZOOM_BY_TYPE.city },
  'san-francisco': { latitude: 37.7749, longitude: -122.4194, zoom: ZOOM_BY_TYPE.city },
  'new-york': { latitude: 40.7128, longitude: -74.006, zoom: ZOOM_BY_TYPE.city },
  canada: { latitude: 56.1304, longitude: -106.3468, zoom: ZOOM_BY_TYPE.country },
  toronto: { latitude: 43.6532, longitude: -79.3832, zoom: ZOOM_BY_TYPE.city },
}

export function getGeoCoordinates(id: string): GeoCoordinate | null {
  return GEO_COORDINATES_BY_ID[id] ?? null
}
