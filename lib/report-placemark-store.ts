'use client'

import { create } from 'zustand'
import type { ViewMode } from '@/types/camera'
import type { ReportGroup, ReportPinType, ReportPlacemark } from '@/types/report-placemark'
import { mockReportGroups, mockReportPlacemarks } from '@/lib/report-placemark-mock-data'
import { getReportTableTree, type ReportTableGroupNode } from '@/lib/report-group-tree'

function placemarkGroupIds(p: ReportPlacemark): string[] {
  return p.groupIds ?? []
}

function groupParentIds(g: ReportGroup): string[] {
  return g.parentGroupIds ?? []
}

function addUniqueId(ids: string[], id: string): string[] {
  if (ids.includes(id)) return ids
  return [...ids, id]
}

export const REPORT_PIN_TYPES: ReportPinType[] = [
  'places',
  'camera',
  'site_patrol',
  'assets',
  'iots',
]

export const REPORT_PIN_TAB_LABEL: Record<ReportPinType, string> = {
  places: 'Places',
  camera: 'Camera',
  site_patrol: 'Site Patrol',
  assets: 'Assets',
  iots: 'IoTs',
}

interface ReportPlacemarkStore {
  activePinType: ReportPinType
  placemarks: ReportPlacemark[]
  reportGroups: ReportGroup[]
  searchQuery: string
  viewMode: ViewMode
  /** Card grid: folder ids from root → current (empty = root) */
  reportCardExplorerStack: string[]

  isNewRootGroupModalOpen: boolean
  subgroupModalParentId: string | null
  addPlacemarksModalGroupId: string | null
  isDeleteGroupDialogOpen: boolean
  groupToDelete: ReportGroup | null

  setActivePinType: (t: ReportPinType) => void
  setSearchQuery: (q: string) => void
  setViewMode: (mode: ViewMode) => void
  pushReportCardExplorerFolder: (groupId: string) => void
  navigateReportCardExplorerToSegmentIndex: (segmentIndex: number) => void
  setIsNewRootGroupModalOpen: (open: boolean) => void
  setSubgroupModalParentId: (parentId: string | null) => void
  setAddPlacemarksModalGroupId: (groupId: string | null) => void
  setIsDeleteGroupDialogOpen: (open: boolean) => void
  setGroupToDelete: (g: ReportGroup | null) => void

  createRootGroup: (name: string) => void
  createSubgroupUnder: (parentId: string, name: string) => void
  addPlacemarksToParentGroup: (parentId: string, placemarkIds: string[]) => void
  deleteGroup: (groupId: string) => void

  getReportTableTree: () => { rootTrees: ReportTableGroupNode[]; rootPlacemarks: ReportPlacemark[] }
}

export const useReportPlacemarkStore = create<ReportPlacemarkStore>((set, get) => ({
  activePinType: 'places',
  placemarks: mockReportPlacemarks,
  reportGroups: mockReportGroups,
  searchQuery: '',
  viewMode: 'card',
  reportCardExplorerStack: [],

  isNewRootGroupModalOpen: false,
  subgroupModalParentId: null,
  addPlacemarksModalGroupId: null,
  isDeleteGroupDialogOpen: false,
  groupToDelete: null,

  setActivePinType: (t) =>
    set((state) => ({
      activePinType: t,
      searchQuery: '',
      reportCardExplorerStack: [],
      isNewRootGroupModalOpen: false,
      subgroupModalParentId: null,
      addPlacemarksModalGroupId: null,
    })),

  setSearchQuery: (q) => set({ searchQuery: q }),
  setViewMode: (mode) =>
    set((state) => ({
      viewMode: mode,
      ...(mode === 'table' ? { reportCardExplorerStack: [] } : {}),
    })),

  pushReportCardExplorerFolder: (groupId) =>
    set((state) => ({ reportCardExplorerStack: [...state.reportCardExplorerStack, groupId] })),

  navigateReportCardExplorerToSegmentIndex: (segmentIndex) =>
    set((state) => ({
      reportCardExplorerStack:
        segmentIndex <= 0 ? [] : state.reportCardExplorerStack.slice(0, segmentIndex),
    })),
  setIsNewRootGroupModalOpen: (open) => set({ isNewRootGroupModalOpen: open }),
  setSubgroupModalParentId: (parentId) => set({ subgroupModalParentId: parentId }),
  setAddPlacemarksModalGroupId: (groupId) => set({ addPlacemarksModalGroupId: groupId }),
  setIsDeleteGroupDialogOpen: (open) => set({ isDeleteGroupDialogOpen: open }),
  setGroupToDelete: (g) => set({ groupToDelete: g }),

  createRootGroup: (name) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const pinType = get().activePinType
    const t = new Date()
    const g: ReportGroup = {
      id: crypto.randomUUID(),
      pinType,
      name: trimmed,
      parentGroupIds: [],
      createdAt: t,
      updatedAt: t,
    }
    set((state) => ({
      reportGroups: [...state.reportGroups, g],
      isNewRootGroupModalOpen: false,
    }))
  },

  createSubgroupUnder: (parentId, name) => {
    const trimmed = name.trim()
    if (!trimmed || !parentId) return
    const parent = get().reportGroups.find((x) => x.id === parentId)
    if (!parent) return
    const t = new Date()
    const g: ReportGroup = {
      id: crypto.randomUUID(),
      pinType: parent.pinType,
      name: trimmed,
      parentGroupIds: [parentId],
      createdAt: t,
      updatedAt: t,
    }
    set((state) => ({
      reportGroups: [...state.reportGroups, g],
      subgroupModalParentId: null,
    }))
  },

  addPlacemarksToParentGroup: (parentId, placemarkIds) => {
    if (!parentId || placemarkIds.length === 0) return
    const now = new Date()
    const idSet = new Set(placemarkIds)
    set((state) => ({
      placemarks: state.placemarks.map((p) =>
        idSet.has(p.id)
          ? {
              ...p,
              groupIds: addUniqueId(placemarkGroupIds(p), parentId),
              updatedAt: now,
            }
          : p,
      ),
      addPlacemarksModalGroupId: null,
    }))
  },

  deleteGroup: (groupId) => {
    set((state) => ({
      reportGroups: state.reportGroups
        .filter((g) => g.id !== groupId)
        .map((g) => {
          const pg = groupParentIds(g).filter((id) => id !== groupId)
          if (pg.length === groupParentIds(g).length) return g
          return { ...g, parentGroupIds: pg, updatedAt: new Date() }
        }),
      placemarks: state.placemarks.map((p) => {
        const next = placemarkGroupIds(p).filter((id) => id !== groupId)
        if (next.length === placemarkGroupIds(p).length) return p
        return { ...p, groupIds: next, updatedAt: new Date() }
      }),
      isDeleteGroupDialogOpen: false,
      groupToDelete: null,
    }))
  },

  getReportTableTree: () => {
    const { activePinType, placemarks, reportGroups, searchQuery } = get()
    return getReportTableTree(activePinType, placemarks, reportGroups, searchQuery)
  },
}))
