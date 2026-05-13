export interface CameraGroup {
  id: string
  name: string
  /** Parent folder groups — a group may appear under several parents. Empty = root only */
  parentGroupIds?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Camera {
  id: string
  name: string
  ip: string
  type: 'RTSP' | 'ONVIF' | 'USB' | 'HTTP'
  /** Groups this camera is listed under (may be several). Empty/omit = root table rows only */
  groupIds?: string[]
  cameraId: string
  port: number
  apiBaseUrl: string
  telnetUsername: string
  telnetPassword: string
  cameraPassword: string
  mediaMtxUrl?: string
  uniqueIdentifier?: string
  status: 'live' | 'stopped' | 'connecting'
  thumbnail?: string
  createdAt: Date
  updatedAt: Date
}

export interface Recording {
  id: string
  cameraId: string
  cameraName: string
  scheduleName: string
  startDate: string
  endDate: string
  duration: string
  fileSize: string
  filePath: string
  createdAt: Date
}

export interface Schedule {
  id: string
  cameraId: string
  name: string
  days: string[]
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  enabled: boolean
  createdAt: Date
}

export interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'warning' | 'error' | 'success'
  message: string
  source: string
}

export type ViewMode = 'table' | 'card'

export type CameraTab = 'details' | 'stream' | 'recording' | 'schedule' | 'logs'
