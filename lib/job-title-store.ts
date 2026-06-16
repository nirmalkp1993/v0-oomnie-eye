'use client'

import { create } from 'zustand'
import {
  addJobTitleChild,
  addJobTitleRoot,
  collectSubtreePathLabels,
  deleteJobTitleNode,
  jobTitleNameExists,
  updateJobTitleName,
} from '@/src/lib/job-title-tree.utils'
import type { HierarchyTreeNode } from '@/src/lib/nested-tree-path-options'
import { JOB_TITLE_HIERARCHY_TREE } from '@/src/mock-data/job-title-hierarchy'

interface JobTitleStore {
  tree: HierarchyTreeNode[]

  createRoot: (name: string) => string | null
  createChild: (parentId: string, name: string) => string | null
  rename: (id: string, name: string) => boolean
  remove: (id: string) => string[]
  getSubtreePathLabels: (id: string) => string[]
  nameExists: (name: string, excludeId?: string) => boolean
  ensureSeeded: () => void
}

function validateName(
  name: string,
  tree: HierarchyTreeNode[],
  excludeId?: string,
): string | null {
  const trimmed = name.trim()
  if (!trimmed) return 'Name is required'
  if (jobTitleNameExists(tree, trimmed, excludeId)) return 'A job title with this name already exists'
  return null
}

export const useJobTitleStore = create<JobTitleStore>((set, get) => ({
  tree: JOB_TITLE_HIERARCHY_TREE.map((node) => structuredClone(node)),

  createRoot: (name) => {
    const error = validateName(name, get().tree)
    if (error) return null
    const { tree, id } = addJobTitleRoot(get().tree, name)
    set({ tree })
    return id
  },

  createChild: (parentId, name) => {
    const error = validateName(name, get().tree)
    if (error) return null
    const result = addJobTitleChild(get().tree, parentId, name)
    if (!result) return null
    set({ tree: result.tree })
    return result.id
  },

  rename: (id, name) => {
    const error = validateName(name, get().tree, id)
    if (error) return false
    set({ tree: updateJobTitleName(get().tree, id, name) })
    return true
  },

  remove: (id) => {
    const removedLabels = collectSubtreePathLabels(get().tree, id)
    set({ tree: deleteJobTitleNode(get().tree, id) })
    return removedLabels
  },

  getSubtreePathLabels: (id) => collectSubtreePathLabels(get().tree, id),

  nameExists: (name, excludeId) => jobTitleNameExists(get().tree, name, excludeId),

  ensureSeeded: () => {
    if (get().tree.length === 0) {
      set({ tree: JOB_TITLE_HIERARCHY_TREE.map((node) => structuredClone(node)) })
    }
  },
}))
