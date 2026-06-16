'use client'

import { create } from 'zustand'
import {
  addOfficeChild,
  addOfficeRoot,
  collectSubtreePathLabels,
  deleteOfficeNode,
  officeNameExists,
  updateOfficeAddress,
} from '@/src/lib/office-tree.utils'
import {
  formatOfficeAddress,
  formatOfficeLabel,
  isOfficeAddressComplete,
  isOfficeNameComplete,
  normalizeOfficeAddress,
  normalizeOfficeName,
} from '@/src/lib/office-address.utils'
import type { HierarchyTreeNode } from '@/src/lib/nested-tree-path-options'
import type { OfficeAddress } from '@/src/types/office'
import { OFFICE_HIERARCHY_TREE } from '@/src/mock-data/office-hierarchy'

interface OfficeStore {
  tree: HierarchyTreeNode[]

  createRoot: (officeName: string, address: OfficeAddress) => string | null
  createChild: (parentId: string, officeName: string, address: OfficeAddress) => string | null
  updateOffice: (id: string, officeName: string, address: OfficeAddress) => boolean
  remove: (id: string) => string[]
  getSubtreePathLabels: (id: string) => string[]
  officeExists: (officeName: string, address: OfficeAddress, excludeId?: string) => boolean
}

function validateOfficeDetails(
  officeName: string,
  address: OfficeAddress,
  tree: HierarchyTreeNode[],
  excludeId?: string,
): string | null {
  if (!isOfficeNameComplete(officeName)) return 'Office name is required'
  if (!isOfficeAddressComplete(address)) return 'All address fields are required'
  const label = formatOfficeLabel(normalizeOfficeName(officeName), normalizeOfficeAddress(address))
  if (officeNameExists(tree, label, excludeId)) return 'An office with this address already exists'
  return null
}

export const useOfficeStore = create<OfficeStore>((set, get) => ({
  tree: OFFICE_HIERARCHY_TREE.map((node) => structuredClone(node)),

  createRoot: (officeName, address) => {
    const error = validateOfficeDetails(officeName, address, get().tree)
    if (error) return null
    const { tree, id } = addOfficeRoot(get().tree, officeName, address)
    set({ tree })
    return id
  },

  createChild: (parentId, officeName, address) => {
    const error = validateOfficeDetails(officeName, address, get().tree)
    if (error) return null
    const result = addOfficeChild(get().tree, parentId, officeName, address)
    if (!result) return null
    set({ tree: result.tree })
    return result.id
  },

  updateOffice: (id, officeName, address) => {
    const error = validateOfficeDetails(officeName, address, get().tree, id)
    if (error) return false
    set({ tree: updateOfficeAddress(get().tree, id, officeName, address) })
    return true
  },

  remove: (id) => {
    const removedLabels = collectSubtreePathLabels(get().tree, id)
    set({ tree: deleteOfficeNode(get().tree, id) })
    return removedLabels
  },

  getSubtreePathLabels: (id) => collectSubtreePathLabels(get().tree, id),

  officeExists: (officeName, address, excludeId) =>
    officeNameExists(
      get().tree,
      formatOfficeLabel(normalizeOfficeName(officeName), normalizeOfficeAddress(address)),
      excludeId,
    ),
}))
