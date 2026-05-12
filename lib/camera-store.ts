'use client'

import { create } from 'zustand'
import type { Camera, Recording, Schedule, LogEntry, ViewMode, CameraTab } from '@/types/camera'
import { mockCameras, mockRecordings, mockSchedules, mockLogs } from './mock-data'

interface CameraStore {
  cameras: Camera[]
  recordings: Recording[]
  schedules: Schedule[]
  logs: LogEntry[]
  viewMode: ViewMode
  searchQuery: string
  selectedCamera: Camera | null
  activeTab: CameraTab
  isAddDialogOpen: boolean
  isDeleteDialogOpen: boolean
  cameraToDelete: Camera | null
  
  // Actions
  setViewMode: (mode: ViewMode) => void
  setSearchQuery: (query: string) => void
  setSelectedCamera: (camera: Camera | null) => void
  setActiveTab: (tab: CameraTab) => void
  setIsAddDialogOpen: (open: boolean) => void
  setIsDeleteDialogOpen: (open: boolean) => void
  setCameraToDelete: (camera: Camera | null) => void
  
  addCamera: (camera: Omit<Camera, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void
  updateCamera: (id: string, data: Partial<Camera>) => void
  deleteCamera: (id: string) => void
  
  addSchedule: (schedule: Omit<Schedule, 'id' | 'createdAt'>) => void
  updateSchedule: (id: string, data: Partial<Schedule>) => void
  deleteSchedule: (id: string) => void
  
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void
  clearLogs: () => void
  
  getFilteredCameras: () => Camera[]
  getCameraSchedules: (cameraId: string) => Schedule[]
  getCameraRecordings: (cameraId: string) => Recording[]
  getCameraLogs: (cameraId: string) => LogEntry[]
}

export const useCameraStore = create<CameraStore>((set, get) => ({
  cameras: mockCameras,
  recordings: mockRecordings,
  schedules: mockSchedules,
  logs: mockLogs,
  viewMode: 'card',
  searchQuery: '',
  selectedCamera: null,
  activeTab: 'details',
  isAddDialogOpen: false,
  isDeleteDialogOpen: false,
  cameraToDelete: null,
  
  setViewMode: (mode) => set({ viewMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCamera: (camera) => set({ selectedCamera: camera, activeTab: 'stream' }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setIsAddDialogOpen: (open) => set({ isAddDialogOpen: open }),
  setIsDeleteDialogOpen: (open) => set({ isDeleteDialogOpen: open }),
  setCameraToDelete: (camera) => set({ cameraToDelete: camera }),
  
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
    
    // Simulate connection after a short delay
    setTimeout(() => {
      set((state) => ({
        cameras: state.cameras.map((c) =>
          c.id === newCamera.id ? { ...c, status: 'live' } : c
        ),
        selectedCamera: state.selectedCamera?.id === newCamera.id 
          ? { ...state.selectedCamera, status: 'live' }
          : state.selectedCamera,
      }))
    }, 2000)
  },
  
  updateCamera: (id, data) => {
    set((state) => ({
      cameras: state.cameras.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt: new Date() } : c
      ),
      selectedCamera: state.selectedCamera?.id === id
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
      schedules: state.schedules.map((s) =>
        s.id === id ? { ...s, ...data } : s
      ),
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
    if (!searchQuery) return cameras
    const query = searchQuery.toLowerCase()
    return cameras.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.ip.toLowerCase().includes(query) ||
        c.type.toLowerCase().includes(query)
    )
  },
  
  getCameraSchedules: (cameraId) => {
    return get().schedules.filter((s) => s.cameraId === cameraId)
  },
  
  getCameraRecordings: (cameraId) => {
    return get().recordings.filter((r) => r.cameraId === cameraId)
  },
  
  getCameraLogs: () => {
    return get().logs
  },
}))
