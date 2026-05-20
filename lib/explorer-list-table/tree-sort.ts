import { compareExplorerSortValues } from '@/lib/explorer-list-table/sort-utils'
import type { ExplorerSortState } from '@/lib/explorer-list-table/types'

export type ExplorerTreeSibling<G, L> =
  | { kind: 'group'; node: G }
  | { kind: 'leaf'; item: L }

/**
 * Returns group rows then leaf rows when unsorted; merges and sorts both when sort is set.
 */
export function getSortedTreeSiblings<G, L>(
  groups: G[],
  leaves: L[],
  sort: ExplorerSortState,
  getGroupValue: (group: G) => string,
  getLeafValue: (leaf: L) => string
): ExplorerTreeSibling<G, L>[] {
  const groupItems: ExplorerTreeSibling<G, L>[] = groups.map((node) => ({
    kind: 'group',
    node,
  }))
  const leafItems: ExplorerTreeSibling<G, L>[] = leaves.map((item) => ({
    kind: 'leaf',
    item,
  }))

  if (!sort) {
    return [...groupItems, ...leafItems]
  }

  const { direction } = sort
  return [...groupItems, ...leafItems].sort((a, b) => {
    const aVal = a.kind === 'group' ? getGroupValue(a.node) : getLeafValue(a.item)
    const bVal = b.kind === 'group' ? getGroupValue(b.node) : getLeafValue(b.item)
    return compareExplorerSortValues(aVal, bVal, direction)
  })
}
