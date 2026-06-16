'use client'

import { create } from 'zustand'
import {
  addOfficeChild,
  addOfficeRoot,
  collectSubtreePathLabels,
  deleteOfficeNode,
  officeNameExists,
  updateOfficeName,
} from '@/src/lib/office-tree.utils'
import type { HierarchyTreeNode } from '@/src/lib/nested-tree-path-options'
import { OFFICE_HIERARCHY_TREE } from '@/src/mock-data/office-hierarchy'

interface OfficeStore {
  tree: HierarchyTreeNode[]

  createRoot: (name: string) => string | null
  createChild: (parentId: string, name: string) => string | null
  rename: (id: string, name: string) => boolean
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
  if (officeNameExists(tree, trimmed, excludeId)) return 'A office with this name already exists'
  return null
}

export const useOfficeStore = create<OfficeStore>((set, get) => ({
  tree: OFFICE_HIERARCHY_TREE.map((node) => structuredClone(node)),

  createRoot: (name) => {
    const error = validateName(name, get().tree)
    if (error) return null
    const { tree, id } = addOfficeRoot(get().tree, name)
    set({ tree })
    return id
  },

  createChild: (parentId, name) => {
    const error = validateName(name, get().tree)
    if (error) return null
    const result = addOfficeChild(get().tree, parentId, name)
    if (!result) return null
    set({ tree: result.tree })
    return result.id
  },

  rename: (id, name) => {
    const error = validateName(name, get().tree, id)
    if (error) return false
    set({ tree: updateOfficeName(get().tree, id, name) })
    return true
  },

  remove: (id) => {
    const removedLabels = collectSubtreePathLabels(get().tree, id)
    set({ tree: deleteOfficeNode(get().tree, id) })
    return removedLabels
  },

  getSubtreePathLabels: (id) => collectSubtreePathLabels(get().tree, id),

  nameExists: (name, excludeId) => officeNameExists(get().tree, name, excludeId),
}))
