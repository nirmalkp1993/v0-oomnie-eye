import type { HierarchyTreeNode } from '@/src/lib/nested-tree-path-options'

export interface OfficeAddress {
  addressLine: string
  city: string
  state: string
  pincode: string
  country: string
}

export interface OfficeTreeNode extends HierarchyTreeNode {
  /** User-provided friendly office name (shown before address). */
  officeName?: string
  address?: OfficeAddress
}

export const EMPTY_OFFICE_ADDRESS: OfficeAddress = {
  addressLine: '',
  city: '',
  state: '',
  pincode: '',
  country: '',
}

export const EMPTY_OFFICE_NAME = ''
