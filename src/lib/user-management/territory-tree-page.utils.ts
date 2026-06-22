import type { HierarchyTreeNode } from '@/src/lib/nested-tree-path-options'

export interface TerritoryTableNode {
  node: HierarchyTreeNode
  children: TerritoryTableNode[]
}

export interface TerritoryFolderBreadcrumbItem {
  id: string
  name: string
}

function subtreeMatchesSearch(node: HierarchyTreeNode, query: string): boolean {
  const q = query.toLowerCase()
  if (node.name.toLowerCase().includes(q)) return true
  return (node.children ?? []).some((child) => subtreeMatchesSearch(child, query))
}

function buildTerritoryTableNode(
  node: HierarchyTreeNode,
  queryTrim: string,
): TerritoryTableNode | null {
  if (queryTrim.length > 0 && !subtreeMatchesSearch(node, queryTrim)) {
    return null
  }

  const children = (node.children ?? [])
    .map((child) => buildTerritoryTableNode(child, queryTrim))
    .filter((child): child is TerritoryTableNode => child !== null)

  return { node, children }
}

export function buildTerritoryTableTree(
  tree: HierarchyTreeNode[],
  searchQuery = '',
): TerritoryTableNode[] {
  const queryTrim = searchQuery.trim()
  return tree
    .map((root) => buildTerritoryTableNode(root, queryTrim))
    .filter((node): node is TerritoryTableNode => node !== null)
}

export function collectSubtreeTerritoryIds(
  tree: HierarchyTreeNode[],
  rootId: string,
): string[] {
  const ids: string[] = []

  const walk = (nodes: HierarchyTreeNode[]) => {
    for (const node of nodes) {
      if (node.id === rootId) {
        const collect = (n: HierarchyTreeNode) => {
          ids.push(n.id)
          for (const child of n.children ?? []) collect(child)
        }
        collect(node)
        return true
      }
      if (node.children?.length && walk(node.children)) return true
    }
    return false
  }

  walk(tree)
  return ids.length > 0 ? ids : [rootId]
}

export function findTerritoryNodeById(
  tree: HierarchyTreeNode[],
  id: string,
): HierarchyTreeNode | null {
  for (const node of tree) {
    if (node.id === id) return node
    if (node.children?.length) {
      const found = findTerritoryNodeById(node.children, id)
      if (found) return found
    }
  }
  return null
}

export function buildTerritoryAncestorBreadcrumbs(
  tree: HierarchyTreeNode[],
  territoryId: string,
): TerritoryFolderBreadcrumbItem[] {
  const path: TerritoryFolderBreadcrumbItem[] = []

  const walk = (nodes: HierarchyTreeNode[], ancestors: TerritoryFolderBreadcrumbItem[]): boolean => {
    for (const node of nodes) {
      const nextPath = [...ancestors, { id: node.id, name: node.name }]
      if (node.id === territoryId) {
        path.push(...nextPath)
        return true
      }
      if (node.children?.length && walk(node.children, nextPath)) return true
    }
    return false
  }

  walk(tree, [])
  return path
}

export function countOfficesInTerritorySubtree(
  territoryId: string,
  tree: HierarchyTreeNode[],
  assignments: Record<string, string>,
): number {
  const subtreeIds = new Set(collectSubtreeTerritoryIds(tree, territoryId))
  return Object.entries(assignments).filter(([, tid]) => subtreeIds.has(tid)).length
}
