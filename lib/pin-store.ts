'use client'

import { create } from 'zustand'
import type { CameraPin, PinRecording, PinEditorTab, PinViewerTab } from '@/types/pin'

interface PinStore {
  pins: CameraPin[]
  pinRecordings: PinRecording[]
  selectedPin: CameraPin | null
  isAddingPin: boolean
  isPinEditorOpen: boolean
  isPinViewerOpen: boolean
  editorTab: PinEditorTab
  viewerTab: PinViewerTab
  pendingPinLocation: { latitude: number; longitude: number; altitude: number } | null
  hasUnsavedChanges: boolean
  editingPin: CameraPin | null
  
  // Actions
  setIsAddingPin: (adding: boolean) => void
  setPendingPinLocation: (location: { latitude: number; longitude: number; altitude: number } | null) => void
  setIsPinEditorOpen: (open: boolean) => void
  setIsPinViewerOpen: (open: boolean) => void
  setSelectedPin: (pin: CameraPin | null) => void
  setEditorTab: (tab: PinEditorTab) => void
  setViewerTab: (tab: PinViewerTab) => void
  setEditingPin: (pin: CameraPin | null) => void
  setHasUnsavedChanges: (hasChanges: boolean) => void
  
  addPin: (pin: Omit<CameraPin, 'id' | 'createdAt' | 'updatedAt'>) => CameraPin
  updatePin: (id: string, data: Partial<CameraPin>) => void
  deletePin: (id: string) => void
  
  linkCameraToPin: (pinId: string, cameraId: string) => void
  unlinkCameraFromPin: (pinId: string, cameraId: string) => void
  
  getPinRecordings: (pinId: string) => PinRecording[]
  checkPinNameExists: (name: string, excludeId?: string) => boolean
}

// Mock data for initial pins
const mockPins: CameraPin[] = []

const mockPinRecordings: PinRecording[] = [
  {
    id: 'rec-1',
    pinId: 'pin-1',
    title: 'Entrance Patrol Recording',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
    duration: '30m',
    recordedAt: new Date('2026-04-28T08:00:00'),
    status: 'completed',
  },
  {
    id: 'rec-2',
    pinId: 'pin-1',
    title: 'Loading Dock Scan',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    duration: '22m',
    recordedAt: new Date('2026-04-27T15:45:00'),
    status: 'completed',
  },
  {
    id: 'rec-3',
    pinId: 'pin-1',
    title: 'Night Security Sweep',
    thumbnailUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=300&fit=crop',
    duration: '45m',
    recordedAt: new Date('2026-04-26T23:20:00'),
    status: 'completed',
  },
  {
    id: 'rec-4',
    pinId: 'pin-1',
    title: 'South Gate Motion Alert',
    thumbnailUrl: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=300&fit=crop',
    duration: '11m',
    recordedAt: new Date('2026-04-25T19:10:00'),
    status: 'failed',
  },
  {
    id: 'rec-5',
    pinId: 'pin-1',
    title: 'Parking Lane Audit',
    thumbnailUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
    duration: '19m',
    recordedAt: new Date('2026-04-24T18:35:00'),
    status: 'completed',
  },
]

export const usePinStore = create<PinStore>((set, get) => ({
  pins: mockPins,
  pinRecordings: mockPinRecordings,
  selectedPin: null,
  isAddingPin: false,
  isPinEditorOpen: false,
  isPinViewerOpen: false,
  editorTab: 'camera',
  viewerTab: 'preview',
  pendingPinLocation: null,
  hasUnsavedChanges: false,
  editingPin: null,
  
  setIsAddingPin: (adding) => set({ isAddingPin: adding }),
  setPendingPinLocation: (location) => set({ pendingPinLocation: location }),
  setIsPinEditorOpen: (open) => set({ isPinEditorOpen: open }),
  setIsPinViewerOpen: (open) => set({ isPinViewerOpen: open }),
  setSelectedPin: (pin) => set({ selectedPin: pin }),
  setEditorTab: (tab) => set({ editorTab: tab }),
  setViewerTab: (tab) => set({ viewerTab: tab }),
  setEditingPin: (pin) => set({ editingPin: pin, hasUnsavedChanges: false }),
  setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),
  
  addPin: (pinData) => {
    const newPin: CameraPin = {
      ...pinData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    set((state) => ({
      pins: [...state.pins, newPin],
      pendingPinLocation: null,
      isPinEditorOpen: false,
      selectedPin: newPin,
    }))
    return newPin
  },
  
  updatePin: (id, data) => {
    set((state) => ({
      pins: state.pins.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: new Date() } : p
      ),
      selectedPin: state.selectedPin?.id === id
        ? { ...state.selectedPin, ...data, updatedAt: new Date() }
        : state.selectedPin,
      editingPin: state.editingPin?.id === id
        ? { ...state.editingPin, ...data, updatedAt: new Date() }
        : state.editingPin,
      hasUnsavedChanges: false,
    }))
  },
  
  deletePin: (id) => {
    set((state) => ({
      pins: state.pins.filter((p) => p.id !== id),
      selectedPin: state.selectedPin?.id === id ? null : state.selectedPin,
      isPinEditorOpen: state.editingPin?.id === id ? false : state.isPinEditorOpen,
      isPinViewerOpen: state.selectedPin?.id === id ? false : state.isPinViewerOpen,
      editingPin: state.editingPin?.id === id ? null : state.editingPin,
    }))
  },
  
  linkCameraToPin: (pinId, cameraId) => {
    set((state) => ({
      pins: state.pins.map((p) =>
        p.id === pinId
          ? { ...p, linkedCameraIds: [...p.linkedCameraIds, cameraId], updatedAt: new Date() }
          : p
      ),
      editingPin: state.editingPin?.id === pinId
        ? { ...state.editingPin, linkedCameraIds: [...state.editingPin.linkedCameraIds, cameraId] }
        : state.editingPin,
      hasUnsavedChanges: true,
    }))
  },
  
  unlinkCameraFromPin: (pinId, cameraId) => {
    set((state) => ({
      pins: state.pins.map((p) =>
        p.id === pinId
          ? { ...p, linkedCameraIds: p.linkedCameraIds.filter((id) => id !== cameraId), updatedAt: new Date() }
          : p
      ),
      editingPin: state.editingPin?.id === pinId
        ? { ...state.editingPin, linkedCameraIds: state.editingPin.linkedCameraIds.filter((id) => id !== cameraId) }
        : state.editingPin,
      hasUnsavedChanges: true,
    }))
  },
  
  getPinRecordings: (pinId) => {
    return get().pinRecordings.filter((r) => r.pinId === pinId)
  },
  
  checkPinNameExists: (name, excludeId) => {
    const { pins } = get()
    return pins.some((p) => p.name.toLowerCase() === name.toLowerCase() && p.id !== excludeId)
  },
}))
