export interface CameraThumbnailMarker {
  xPercent: number
  yPercent: number
}

export interface CameraGroup {
  id: string
  name: string
  /** Parent folder groups — a group may appear under several parents. Empty = root only */
  parentGroupIds?: string[]
  createdAt: Date
  updatedAt: Date
}

export type RecordingMode = 'continuous' | 'scheduled'
export type StorageTarget = 'local' | 'nas'
export type RecordingScheduleDayKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'
export type RecordingScheduleSlots = Record<RecordingScheduleDayKey, boolean[]>

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
  /** Camera icon position on thumbnail image (0–100% of visible image area). */
  thumbnailMarker?: CameraThumbnailMarker
  location?: string
  recordingEnabled?: boolean
  recordingMode?: RecordingMode
  storageTarget?: StorageTarget
  recordingScheduleSlots?: RecordingScheduleSlots
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

export type CameraTab =
  | 'details'
  | 'stream'
  | 'scheduleRecording'
  | 'recording'
  | 'schedule'
  | 'logs'
