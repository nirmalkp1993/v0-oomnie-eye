'use client'

import { create } from 'zustand'
import type {
  Camera,
  CameraGroup,
  Recording,
  Schedule,
  LogEntry,
  ViewMode,
  CameraTab,
} from '@/types/camera'
import { mockCameras, mockCameraGroups, mockRecordings, mockSchedules, mockLogs } from './mock-data'

function cameraMatchesSearch(c: Camera, query: string): boolean {
  if (!query) return true
  const q = query.toLowerCase()
  return (
    c.name.toLowerCase().includes(q) ||
    c.ip.toLowerCase().includes(q) ||
    c.type.toLowerCase().includes(q)
  )
}

export interface CameraTableGroupBlock {
  group: CameraGroup
  /** Cameras shown under this group (respects search) */
  cameras: Camera[]
}

interface CameraStore {
  cameras: Camera[]
  cameraGroups: CameraGroup[]
  recordings: Recording[]
  schedules: Schedule[]
  logs: LogEntry[]
  viewMode: ViewMode
  searchQuery: string
  selectedCamera: Camera | null
  activeTab: CameraTab
  isAddDialogOpen: boolean
  isCreateGroupDialogOpen: boolean
  isDeleteDialogOpen: boolean
  isDeleteGroupDialogOpen: boolean
  cameraToDelete: Camera | null
  groupToDelete: CameraGroup | null

  setViewMode: (mode: ViewMode) => void
  setSearchQuery: (query: string) => void
  setSelectedCamera: (camera: Camera | null) => void
  setActiveTab: (tab: CameraTab) => void
  setIsAddDialogOpen: (open: boolean) => void
  setIsCreateGroupDialogOpen: (open: boolean) => void
  setIsDeleteDialogOpen: (open: boolean) => void
  setIsDeleteGroupDialogOpen: (open: boolean) => void
  setCameraToDelete: (camera: Camera | null) => void
  setGroupToDelete: (group: CameraGroup | null) => void

  addCamera: (camera: Omit<Camera, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'groupId'>) => void
  updateCamera: (id: string, data: Partial<Camera>) => void
  deleteCamera: (id: string) => void

  createGroupWithCameras: (name: string, cameraIds: string[]) => void
  addCamerasToGroup: (groupId: string, cameraIds: string[]) => void
  deleteGroup: (groupId: string) => void

  addSchedule: (schedule: Omit<Schedule, 'id' | 'createdAt'>) => void
  updateSchedule: (id: string, data: Partial<Schedule>) => void
  deleteSchedule: (id: string) => void

  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void
  clearLogs: () => void

  getFilteredCameras: () => Camera[]
  getCameraTableTree: () => { groupBlocks: CameraTableGroupBlock[]; rootCameras: Camera[] }
  getCameraSchedules: (cameraId: string) => Schedule[]
  getCameraRecordings: (cameraId: string) => Recording[]
  getCameraLogs: (cameraId: string) => LogEntry[]
}

export const useCameraStore = create<CameraStore>((set, get) => ({
  cameras: mockCameras,
  cameraGroups: mockCameraGroups,
  recordings: mockRecordings,
  schedules: mockSchedules,
  logs: mockLogs,
  viewMode: 'card',
  searchQuery: '',
  selectedCamera: null,
  activeTab: 'details',
  isAddDialogOpen: false,
  isCreateGroupDialogOpen: false,
  isDeleteDialogOpen: false,
  isDeleteGroupDialogOpen: false,
  cameraToDelete: null,
  groupToDelete: null,

  setViewMode: (mode) => set({ viewMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCamera: (camera) => set({ selectedCamera: camera, activeTab: 'stream' }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setIsAddDialogOpen: (open) => set({ isAddDialogOpen: open }),
  setIsCreateGroupDialogOpen: (open) => set({ isCreateGroupDialogOpen: open }),
  setIsDeleteDialogOpen: (open) => set({ isDeleteDialogOpen: open }),
  setIsDeleteGroupDialogOpen: (open) => set({ isDeleteGroupDialogOpen: open }),
  setCameraToDelete: (camera) => set({ cameraToDelete: camera }),
  setGroupToDelete: (group) => set({ groupToDelete: group }),

  addCamera: (cameraData) => {
    const newCamera: Camera = {
      ...cameraData,
      id: crypto.randomUUID(),
      status: 'connecting',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    set((state) => ({
      cameras: [...state.cameras, newCamera],
      isAddDialogOpen: false,
      selectedCamera: newCamera,
      activeTab: 'stream',
    }))

    setTimeout(() => {
      set((state) => ({
        cameras: state.cameras.map((c) =>
          c.id === newCamera.id ? { ...c, status: 'live' } : c,
        ),
        selectedCamera:
          state.selectedCamera?.id === newCamera.id
            ? { ...state.selectedCamera, status: 'live' }
            : state.selectedCamera,
      }))
    }, 2000)
  },

  updateCamera: (id, data) => {
    set((state) => ({
      cameras: state.cameras.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt: new Date() } : c,
      ),
      selectedCamera:
        state.selectedCamera?.id === id
          ? { ...state.selectedCamera, ...data, updatedAt: new Date() }
          : state.selectedCamera,
    }))
  },

  deleteCamera: (id) => {
    set((state) => ({
      cameras: state.cameras.filter((c) => c.id !== id),
      selectedCamera: state.selectedCamera?.id === id ? null : state.selectedCamera,
      isDeleteDialogOpen: false,
      cameraToDelete: null,
    }))
  },

  createGroupWithCameras: (name, cameraIds) => {
    const trimmed = name.trim()
    if (!trimmed || cameraIds.length === 0) return
    const now = new Date()
    const group: CameraGroup = {
      id: crypto.randomUUID(),
      name: trimmed,
      createdAt: now,
      updatedAt: now,
    }
    const idSet = new Set(cameraIds)
    set((state) => ({
      cameraGroups: [...state.cameraGroups, group],
      cameras: state.cameras.map((c) =>
        idSet.has(c.id) ? { ...c, groupId: group.id, updatedAt: new Date() } : c,
      ),
      isCreateGroupDialogOpen: false,
    }))
  },

  addCamerasToGroup: (groupId, cameraIds) => {
    if (!cameraIds.length) return
    const idSet = new Set(cameraIds)
    set((state) => ({
      cameras: state.cameras.map((c) =>
        idSet.has(c.id) ? { ...c, groupId, updatedAt: new Date() } : c,
      ),
      isCreateGroupDialogOpen: false,
    }))
  },

  deleteGroup: (groupId) => {
    set((state) => ({
      cameraGroups: state.cameraGroups.filter((g) => g.id !== groupId),
      cameras: state.cameras.map((c) =>
        c.groupId === groupId ? { ...c, groupId: null, updatedAt: new Date() } : c,
      ),
      isDeleteGroupDialogOpen: false,
      groupToDelete: null,
    }))
  },

  addSchedule: (scheduleData) => {
    const newSchedule: Schedule = {
      ...scheduleData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    }
    set((state) => ({ schedules: [...state.schedules, newSchedule] }))
  },

  updateSchedule: (id, data) => {
    set((state) => ({
      schedules: state.schedules.map((s) => (s.id === id ? { ...s, ...data } : s)),
    }))
  },

  deleteSchedule: (id) => {
    set((state) => ({
      schedules: state.schedules.filter((s) => s.id !== id),
    }))
  },

  addLog: (logData) => {
    const newLog: LogEntry = {
      ...logData,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    }
    set((state) => ({ logs: [newLog, ...state.logs] }))
  },

  clearLogs: () => set({ logs: [] }),

  getFilteredCameras: () => {
    const { cameras, searchQuery } = get()
    if (!searchQuery.trim()) return cameras
    const q = searchQuery.trim()
    return cameras.filter((c) => cameraMatchesSearch(c, q))
  },

  getCameraTableTree: () => {
    const { cameras, cameraGroups, searchQuery } = get()
    const q = searchQuery.trim()

    const sortedGroups = [...cameraGroups].sort((a, b) => a.name.localeCompare(b.name))
    const groupBlocks: CameraTableGroupBlock[] = []

    for (const group of sortedGroups) {
      const inGroup = cameras.filter((c) => c.groupId === group.id)
      const groupNameMatch = q && group.name.toLowerCase().includes(q.toLowerCase())
      let visibleCameras: Camera[]
      if (!q) {
        visibleCameras = inGroup
      } else if (groupNameMatch) {
        visibleCameras = inGroup
      } else {
        visibleCameras = inGroup.filter((c) => cameraMatchesSearch(c, q))
      }
      const showGroup = !q || groupNameMatch || visibleCameras.length > 0
      if (showGroup) {
        groupBlocks.push({
          group,
          cameras: !q || groupNameMatch ? inGroup : visibleCameras,
        })
      }
    }

    const rootCameras = cameras
      .filter((c) => !c.groupId)
      .filter((c) => cameraMatchesSearch(c, q))
      .sort((a, b) => a.name.localeCompare(b.name))

    return { groupBlocks, rootCameras }
  },

  getCameraSchedules: (cameraId) => {
    return get().schedules.filter((s) => s.cameraId === cameraId)
  },

  getCameraRecordings: (cameraId) => {
    return get().recordings.filter((r) => r.cameraId === cameraId)
  },

  getCameraLogs: (_cameraId: string) => {
    return get().logs
  },
}))
