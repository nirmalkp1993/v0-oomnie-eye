'use client'

import { create } from 'zustand'
import {
  addTerritoryChild,
  addTerritoryRoot,
  collectSubtreePathLabels,
  deleteTerritoryNode,
  territoryNameExists,
  updateTerritoryName,
} from '@/src/lib/territory-tree.utils'
import { reparentHierarchySubtree } from '@/src/lib/hierarchy-tree.utils'
import type { HierarchyTreeNode } from '@/src/lib/nested-tree-path-options'
import { TERRITORY_HIERARCHY_TREE } from '@/src/mock-data/territory-hierarchy'

interface TerritoryStore {
  tree: HierarchyTreeNode[]

  createRoot: (name: string) => string | null
  createChild: (parentId: string, name: string) => string | null
  rename: (id: string, name: string) => boolean
  reparent: (nodeId: string, newParentId: string) => boolean
  remove: (id: string) => string[]
  getSubtreePathLabels: (id: string) => string[]
  nameExists: (name: string, excludeId?: string) => boolean
}

function validateName(
  name: string,
  tree: HierarchyTreeNode[],
  excludeId?: string,
): string | null {
  const trimmed = name.trim()
  if (!trimmed) return 'Name is required'
  if (territoryNameExists(tree, trimmed, excludeId)) return 'A territory with this name already exists'
  return null
}

export const useTerritoryStore = create<TerritoryStore>((set, get) => ({
  tree: TERRITORY_HIERARCHY_TREE.map((node) => structuredClone(node)),

  createRoot: (name) => {
    const error = validateName(name, get().tree)
    if (error) return null
    const { tree, id } = addTerritoryRoot(get().tree, name)
    set({ tree })
    return id
  },

  createChild: (parentId, name) => {
    const error = validateName(name, get().tree)
    if (error) return null
    const result = addTerritoryChild(get().tree, parentId, name)
    if (!result) return null
    set({ tree: result.tree })
    return result.id
  },

  rename: (id, name) => {
    const error = validateName(name, get().tree, id)
    if (error) return false
    set({ tree: updateTerritoryName(get().tree, id, name) })
    return true
  },

  reparent: (nodeId, newParentId) => {
    const next = reparentHierarchySubtree(get().tree, nodeId, newParentId)
    if (!next) return false
    set({ tree: next })
    return true
  },

  remove: (id) => {
    const removedLabels = collectSubtreePathLabels(get().tree, id)
    set({ tree: deleteTerritoryNode(get().tree, id) })
    return removedLabels
  },

  getSubtreePathLabels: (id) => collectSubtreePathLabels(get().tree, id),

  nameExists: (name, excludeId) => territoryNameExists(get().tree, name, excludeId),
}))
