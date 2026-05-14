/**
 * Demo-only pins for Earth dock UI / filtering (not persisted to pin store).
 */
export type MockEarthDockPinType = 'place' | 'camera' | 'patrol' | 'assets' | 'iot'

export interface MockEarthDockPin {
  id: string
  type: MockEarthDockPinType
  name: string
  latitude: number
  longitude: number
  status: 'active' | 'offline' | 'maintenance'
}

/** Mixed global distribution for map demo */
export const MOCK_EARTH_DOCK_PINS: MockEarthDockPin[] = [
  { id: 'dock-pin-001', type: 'place', name: 'Gateway Plaza', latitude: 40.6892, longitude: -74.0445, status: 'active' },
  { id: 'dock-pin-002', type: 'camera', name: 'Camera Alpha', latitude: 28.6139, longitude: 77.209, status: 'active' },
  { id: 'dock-pin-003', type: 'patrol', name: 'Night Route 7', latitude: 51.5074, longitude: -0.1278, status: 'active' },
  { id: 'dock-pin-004', type: 'assets', name: 'Cold Storage A', latitude: 35.6762, longitude: 139.6503, status: 'maintenance' },
  { id: 'dock-pin-005', type: 'iot', name: 'Sensor Hub 12', latitude: -33.8688, longitude: 151.2093, status: 'active' },
  { id: 'dock-pin-006', type: 'place', name: 'Harbor Lookout', latitude: 37.7749, longitude: -122.4194, status: 'active' },
  { id: 'dock-pin-007', type: 'camera', name: 'Perimeter PTZ', latitude: 48.8566, longitude: 2.3522, status: 'offline' },
  { id: 'dock-pin-008', type: 'patrol', name: 'Dock Sweep', latitude: 25.2048, longitude: 55.2708, status: 'active' },
  { id: 'dock-pin-009', type: 'assets', name: 'Fleet Yard', latitude: -23.5505, longitude: -46.6333, status: 'active' },
  { id: 'dock-pin-010', type: 'iot', name: 'LoRa Gateway', latitude: 52.52, longitude: 13.405, status: 'active' },
  { id: 'dock-pin-011', type: 'place', name: 'Visitor Center', latitude: 19.4326, longitude: -99.1332, status: 'active' },
  { id: 'dock-pin-012', type: 'camera', name: 'Lobby 4K', latitude: 43.6532, longitude: -79.3832, status: 'active' },
  { id: 'dock-pin-013', type: 'patrol', name: 'Perimeter East', latitude: 59.3293, longitude: 18.0686, status: 'maintenance' },
  { id: 'dock-pin-014', type: 'assets', name: 'Spare Parts', latitude: 1.3521, longitude: 103.8198, status: 'active' },
  { id: 'dock-pin-015', type: 'iot', name: 'BLE Beacon Grid', latitude: 22.3193, longitude: 114.1694, status: 'offline' },
  { id: 'dock-pin-016', type: 'place', name: 'HQ Atrium', latitude: 40.7128, longitude: -74.006, status: 'active' },
  { id: 'dock-pin-017', type: 'camera', name: 'Parking LPR', latitude: 34.0522, longitude: -118.2437, status: 'active' },
  { id: 'dock-pin-018', type: 'patrol', name: 'Warehouse Loop', latitude: 50.1109, longitude: 8.6821, status: 'active' },
  { id: 'dock-pin-019', type: 'assets', name: 'Generator B', latitude: -34.6037, longitude: -58.3816, status: 'active' },
  { id: 'dock-pin-020', type: 'iot', name: 'Climate Node', latitude: 55.7558, longitude: 37.6173, status: 'active' },
  { id: 'dock-pin-021', type: 'place', name: 'South Gate', latitude: -37.8136, longitude: 144.9631, status: 'active' },
  { id: 'dock-pin-022', type: 'camera', name: 'Roof Thermal', latitude: 39.9042, longitude: 116.4074, status: 'maintenance' },
  { id: 'dock-pin-023', type: 'patrol', name: 'Marina Watch', latitude: 25.7617, longitude: -80.1918, status: 'active' },
  { id: 'dock-pin-024', type: 'assets', name: 'Container Stack 3', latitude: 35.2271, longitude: -80.8431, status: 'active' },
  { id: 'dock-pin-025', type: 'iot', name: 'Power Monitor', latitude: 30.0444, longitude: 31.2357, status: 'active' },
]
