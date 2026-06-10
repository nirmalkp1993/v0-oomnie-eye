import type { Camera, Recording } from './camera'

export interface CameraPin {
  id: string
  name: string
  description?: string
  category?: string
  latitude: number
  longitude: number
  altitude: number
  groundingMode: 'relative' | 'absolute' | 'clampToGround'
  iconType: 'pin' | 'camera' | 'marker'
  iconColor: string
  iconSize: number
  labelSize: number
  linkedCameraIds: string[]
  placesAutoOpen: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PinRecording {
  id: string
  pinId: string
  title: string
  description?: string
  thumbnailUrl: string
  duration: string
  recordedAt: Date
  status: 'completed' | 'failed' | 'processing'
}

export type PinEditorTab = 'camera' | 'general' | 'position' | 'style' | 'permission'
export type PinViewerTab = 'preview' | 'info' | 'recording'
