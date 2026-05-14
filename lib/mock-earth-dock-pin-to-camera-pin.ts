import type { MockEarthDockPin } from '@/lib/mock-earth-dock-pins'
import type { CameraPin } from '@/types/pin'

const TYPE_COLOR: Record<MockEarthDockPin['type'], string> = {
  place: '#3b82f6',
  camera: '#f59e0b',
  patrol: '#a855f7',
  assets: '#22c55e',
  iot: '#06b6d4',
}

/** Map demo overlay pin → store shape for PinViewer (read-only demo) */
export function mockEarthDockPinToCameraPin(p: MockEarthDockPin): CameraPin {
  const now = new Date()
  return {
    id: p.id,
    name: p.name,
    description: `Demo ${p.type} pin · ${p.status}`,
    category: p.type,
    latitude: p.latitude,
    longitude: p.longitude,
    altitude: 50,
    groundingMode: 'relative',
    iconType: p.type === 'camera' ? 'camera' : 'pin',
    iconColor: TYPE_COLOR[p.type],
    iconSize: 40,
    labelSize: 13,
    linkedCameraIds: [],
    placesAutoOpen: false,
    createdAt: now,
    updatedAt: now,
  }
}
