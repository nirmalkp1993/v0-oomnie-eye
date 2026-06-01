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

function cameraGroupIds(c: Camera): string[] {
  return c.groupIds ?? []
}

function groupParentIds(g: CameraGroup): string[] {
  return g.parentGroupIds ?? []
}

function addUniqueId(ids: string[], id: string): string[] {
  if (ids.includes(id)) return ids
  return [...ids, id]
}

function subtreeHasSearchMatch(
  group: CameraGroup,
  cameras: Camera[],
  allGroups: CameraGroup[],
  q: string,
  visited: Set<string>,
): boolean {
  if (visited.has(group.id)) return false
  visited.add(group.id)
  const ql = q.toLowerCase()
  if (group.name.toLowerCase().includes(ql)) return true
  if (cameras.some((c) => cameraGroupIds(c).includes(group.id) && cameraMatchesSearch(c, q))) {
    return true
  }
  return allGroups
    .filter((g) => groupParentIds(g).includes(group.id))
    .some((cg) => subtreeHasSearchMatch(cg, cameras, allGroups, q, visited))
}

export interface CameraTableGroupNode {
  group: CameraGroup
  cameras: Camera[]
  children: CameraTableGroupNode[]
}

function buildGroupTreeNode(
  group: CameraGroup,
  cameras: Camera[],
  allGroups: CameraGroup[],
  qTrim: string,
  ancestorPath: Set<string>,
): CameraTableGroupNode | null {
  if (ancestorPath.has(group.id)) {
    return null
  }

  const hasSearch = qTrim.length > 0

  if (hasSearch && !subtreeHasSearchMatch(group, cameras, allGroups, qTrim, new Set())) {
    return null
  }

  const childGroups = allGroups
    .filter((g) => groupParentIds(g).includes(group.id))
    .sort((a, b) => a.name.localeCompare(b.name))

  const nextPath = new Set(ancestorPath).add(group.id)

  const childNodes = childGroups
    .map((cg) => buildGroupTreeNode(cg, cameras, allGroups, qTrim, nextPath))
    .filter((n): n is CameraTableGroupNode => n !== null)

  const directCams = cameras.filter((c) => cameraGroupIds(c).includes(group.id))
  const groupNameMatch = hasSearch && group.name.toLowerCase().includes(qTrim.toLowerCase())

  let displayCameras: Camera[]
  if (!hasSearch) {
    displayCameras = directCams
  } else if (groupNameMatch) {
    displayCameras = directCams
  } else {
    displayCameras = directCams.filter((c) => cameraMatchesSearch(c, qTrim))
  }

  displayCameras = [...displayCameras].sort((a, b) => a.name.localeCompare(b.name))

  return { group, cameras: displayCameras, children: childNodes }
}

export function findCameraTableGroupNode(
  nodes: CameraTableGroupNode[],
  groupId: string
): CameraTableGroupNode | null {
  for (const node of nodes) {
    if (node.group.id === groupId) return node
    const found = findCameraTableGroupNode(node.children, groupId)
    if (found) return found
  }
  return null
}

/** Unique cameras listed under this group or any nested subgroup */
export function collectCameraIdsInGroupSubtree(
  groupId: string,
  cameras: Camera[],
  groups: CameraGroup[],
): Set<string> {
  const ids = new Set<string>()
  for (const c of cameras) {
    if (cameraGroupIds(c).includes(groupId)) ids.add(c.id)
  }
  for (const g of groups) {
    if (groupParentIds(g).includes(groupId)) {
      for (const id of collectCameraIdsInGroupSubtree(g.id, cameras, groups)) {
        ids.add(id)
      }
    }
  }
  return ids
}

export function countCamerasInGroupSubtree(
  groupId: string,
  cameras: Camera[],
  groups: CameraGroup[],
): number {
  return collectCameraIdsInGroupSubtree(groupId, cameras, groups).size
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
  isNewRootGroupModalOpen: boolean
  subgroupModalParentId: string | null
  addCamerasModalGroupId: string | null
  /** Camera Group module: selected folder for 3-panel assignment UI */
  selectedAssignGroupId: string | null
  isDeleteDialogOpen: boolean
  isDeleteGroupDialogOpen: boolean
  cameraToDelete: Camera | null
  groupToDelete: CameraGroup | null

  /** List view: expanded state for group rows (tree) */
  listGroupExpanded: Record<string, boolean>
  setListGroupExpanded: (groupId: string, open: boolean) => void
  toggleListGroupExpanded: (groupId: string) => void
  expandAllListGroups: () => void
  collapseAllListGroups: () => void

  /** Grid explorer: folder ids from root → current (empty = root) */
  cardExplorerStack: string[]
  pushCardExplorerFolder: (groupId: string) => void
  navigateCardExplorerToSegmentIndex: (segmentIndex: number) => void

  setViewMode: (mode: ViewMode) => void
  setSearchQuery: (query: string) => void
  setSelectedCamera: (camera: Camera | null) => void
  setActiveTab: (tab: CameraTab) => void
  setIsAddDialogOpen: (open: boolean) => void
  setIsNewRootGroupModalOpen: (open: boolean) => void
  setSubgroupModalParentId: (parentId: string | null) => void
  setAddCamerasModalGroupId: (groupId: string | null) => void
  setSelectedAssignGroupId: (groupId: string | null) => void
  setIsDeleteDialogOpen: (open: boolean) => void
  setIsDeleteGroupDialogOpen: (open: boolean) => void
  setCameraToDelete: (camera: Camera | null) => void
  setGroupToDelete: (group: CameraGroup | null) => void

  addCamera: (camera: Omit<Camera, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'groupIds'>) => void
  updateCamera: (id: string, data: Partial<Camera>) => void
  deleteCamera: (id: string) => void

  createRootGroup: (name: string) => void
  createSubgroupUnder: (parentId: string, name: string) => void
  addCamerasToParentGroup: (
    parentId: string,
    cameraIds: string[],
    options?: { closeAddModal?: boolean },
  ) => void
  removeCamerasFromParentGroup: (parentId: string, cameraIds: string[]) => void
  deleteGroup: (groupId: string) => void

  addSchedule: (schedule: Omit<Schedule, 'id' | 'createdAt'>) => void
  updateSchedule: (id: string, data: Partial<Schedule>) => void
  deleteSchedule: (id: string) => void

  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void
  clearLogs: () => void

  getFilteredCameras: () => Camera[]
  getCameraTableTree: () => { rootTrees: CameraTableGroupNode[]; rootCameras: Camera[] }
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
  viewMode: 'table',
  searchQuery: '',
  selectedCamera: null,
  activeTab: 'details',
  isAddDialogOpen: false,
  isNewRootGroupModalOpen: false,
  subgroupModalParentId: null,
  addCamerasModalGroupId: null,
  selectedAssignGroupId: null,
  isDeleteDialogOpen: false,
  isDeleteGroupDialogOpen: false,
  cameraToDelete: null,
  groupToDelete: null,
  listGroupExpanded: {},

  cardExplorerStack: [],

  setViewMode: (mode) =>
    set((state) => ({
      viewMode: mode,
      ...(mode === 'table' ? { cardExplorerStack: [] } : {}),
    })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCamera: (camera) =>
    set({
      selectedCamera: camera,
      ...(camera ? { activeTab: 'details' as const } : {}),
    }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setIsAddDialogOpen: (open) => set({ isAddDialogOpen: open }),
  setIsNewRootGroupModalOpen: (open) => set({ isNewRootGroupModalOpen: open }),
  setSubgroupModalParentId: (parentId) => set({ subgroupModalParentId: parentId }),
  setAddCamerasModalGroupId: (groupId) => set({ addCamerasModalGroupId: groupId }),
  setSelectedAssignGroupId: (groupId) => set({ selectedAssignGroupId: groupId }),
  setIsDeleteDialogOpen: (open) => set({ isDeleteDialogOpen: open }),
  setIsDeleteGroupDialogOpen: (open) => set({ isDeleteGroupDialogOpen: open }),
  setCameraToDelete: (camera) => set({ cameraToDelete: camera }),
  setGroupToDelete: (group) => set({ groupToDelete: group }),

  setListGroupExpanded: (groupId, open) =>
    set((state) => ({
      listGroupExpanded: { ...state.listGroupExpanded, [groupId]: open },
    })),
  toggleListGroupExpanded: (groupId) =>
    set((state) => ({
      listGroupExpanded: {
        ...state.listGroupExpanded,
        [groupId]: !(state.listGroupExpanded[groupId] ?? true),
      },
    })),
  expandAllListGroups: () =>
    set((state) => {
      const next = { ...state.listGroupExpanded }
      for (const g of state.cameraGroups) {
        next[g.id] = true
      }
      return { listGroupExpanded: next }
    }),
  collapseAllListGroups: () => set({ listGroupExpanded: {} }),

  pushCardExplorerFolder: (groupId) =>
    set((state) => ({ cardExplorerStack: [...state.cardExplorerStack, groupId] })),

  navigateCardExplorerToSegmentIndex: (segmentIndex) =>
    set((state) => ({
      cardExplorerStack:
        segmentIndex <= 0 ? [] : state.cardExplorerStack.slice(0, segmentIndex),
    })),

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

  createRootGroup: (name) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const now = new Date()
    const g: CameraGroup = {
      id: crypto.randomUUID(),
      name: trimmed,
      parentGroupIds: [],
      createdAt: now,
      updatedAt: now,
    }
    set((state) => ({
      cameraGroups: [...state.cameraGroups, g],
      isNewRootGroupModalOpen: false,
    }))
  },

  createSubgroupUnder: (parentId, name) => {
    const trimmed = name.trim()
    if (!trimmed || !parentId) return
    const now = new Date()
    const g: CameraGroup = {
      id: crypto.randomUUID(),
      name: trimmed,
      parentGroupIds: [parentId],
      createdAt: now,
      updatedAt: now,
    }
    set((state) => ({
      cameraGroups: [...state.cameraGroups, g],
      subgroupModalParentId: null,
    }))
  },

  addCamerasToParentGroup: (parentId, cameraIds, options) => {
    if (!parentId || cameraIds.length === 0) return
    const now = new Date()
    const idSet = new Set(cameraIds)
    const closeAddModal = options?.closeAddModal !== false
    set((state) => ({
      cameras: state.cameras.map((c) =>
        idSet.has(c.id)
          ? {
              ...c,
              groupIds: addUniqueId(cameraGroupIds(c), parentId),
              updatedAt: now,
            }
          : c,
      ),
      ...(closeAddModal ? { addCamerasModalGroupId: null } : {}),
    }))
  },

  removeCamerasFromParentGroup: (parentId, cameraIds) => {
    if (!parentId || cameraIds.length === 0) return
    const now = new Date()
    const idSet = new Set(cameraIds)
    set((state) => ({
      cameras: state.cameras.map((c) =>
        idSet.has(c.id)
          ? {
              ...c,
              groupIds: cameraGroupIds(c).filter((id) => id !== parentId),
              updatedAt: now,
            }
          : c,
      ),
    }))
  },

  deleteGroup: (groupId) => {
    set((state) => ({
      cameraGroups: state.cameraGroups
        .filter((g) => g.id !== groupId)
        .map((g) => {
          const pg = groupParentIds(g).filter((id) => id !== groupId)
          if (pg.length === groupParentIds(g).length) return g
          return { ...g, parentGroupIds: pg, updatedAt: new Date() }
        }),
      cameras: state.cameras.map((c) => {
        const next = cameraGroupIds(c).filter((id) => id !== groupId)
        if (next.length === cameraGroupIds(c).length) return c
        return { ...c, groupIds: next, updatedAt: new Date() }
      }),
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
    const qTrim = searchQuery.trim()

    const roots = cameraGroups
      .filter((g) => groupParentIds(g).length === 0)
      .sort((a, b) => a.name.localeCompare(b.name))

    const rootTrees: CameraTableGroupNode[] = roots
      .map((g) => buildGroupTreeNode(g, cameras, cameraGroups, qTrim, new Set()))
      .filter((n): n is CameraTableGroupNode => n !== null)

    const rootCameras = cameras
      .filter((c) => cameraGroupIds(c).length === 0)
      .filter((c) => cameraMatchesSearch(c, qTrim))
      .sort((a, b) => a.name.localeCompare(b.name))

    return { rootTrees, rootCameras }
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
