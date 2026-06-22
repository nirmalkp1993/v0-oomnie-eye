'use client'

import { create } from 'zustand'
import {
  buildTerritoryTableTree,
  type TerritoryTableNode,
} from '@/src/lib/user-management/territory-tree-page.utils'
import type { HierarchyTreeNode } from '@/src/lib/nested-tree-path-options'

interface OfficeTerritoryPageStore {
  selectedTerritoryId: string | null
  searchQuery: string
  listTerritoryExpanded: Record<string, boolean>

  setSelectedTerritoryId: (id: string | null) => void
  setSearchQuery: (query: string) => void
  toggleListTerritoryExpanded: (id: string) => void
  expandAllListTerritories: (tree: HierarchyTreeNode[]) => void
  collapseAllListTerritories: () => void
  getTerritoryTree: (tree: HierarchyTreeNode[]) => TerritoryTableNode[]
}

function collectTerritoryIds(nodes: HierarchyTreeNode[]): string[] {
  const ids: string[] = []
  const walk = (list: HierarchyTreeNode[]) => {
    for (const node of list) {
      ids.push(node.id)
      if (node.children?.length) walk(node.children)
    }
  }
  walk(nodes)
  return ids
}

export const useOfficeTerritoryPageStore = create<OfficeTerritoryPageStore>((set, get) => ({
  selectedTerritoryId: null,
  searchQuery: '',
  listTerritoryExpanded: {},

  setSelectedTerritoryId: (id) => set({ selectedTerritoryId: id }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleListTerritoryExpanded: (id) =>
    set((state) => ({
      listTerritoryExpanded: {
        ...state.listTerritoryExpanded,
        [id]: !(state.listTerritoryExpanded[id] ?? true),
      },
    })),

  expandAllListTerritories: (tree) =>
    set(() => {
      const expanded: Record<string, boolean> = {}
      for (const id of collectTerritoryIds(tree)) {
        expanded[id] = true
      }
      return { listTerritoryExpanded: expanded }
    }),

  collapseAllListTerritories: () => set({ listTerritoryExpanded: {} }),

  getTerritoryTree: (tree) => buildTerritoryTableTree(tree, get().searchQuery),
}))
