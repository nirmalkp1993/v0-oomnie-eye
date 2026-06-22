import {
  collectNestedPathOptions,
  filterNestedPathOptions,
  type HierarchyTreeNode,
  type NestedPathOption,
} from '@/src/lib/nested-tree-path-options'

export function getTerritoryNestedPathOptions(tree: HierarchyTreeNode[]): NestedPathOption[] {
  return collectNestedPathOptions(tree)
}

export function getFilteredTerritoryNestedPathOptions(
  tree: HierarchyTreeNode[],
  query: string,
): NestedPathOption[] {
  return filterNestedPathOptions(getTerritoryNestedPathOptions(tree), query)
}
