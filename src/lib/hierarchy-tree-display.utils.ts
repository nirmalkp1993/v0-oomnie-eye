import type { HierarchyTreeNode } from '@/src/lib/nested-tree-path-options'
import type { OrgChartTreeNode } from '@/src/components/org-chart/hierarchy-flow-types'

export function normalizeOrgChartNodes(nodes: HierarchyTreeNode[]): OrgChartTreeNode[] {
  return nodes.map((node) => ({
    id: node.id,
    name: node.name,
    children: normalizeOrgChartNodes(node.children ?? []),
  }))
}

export function collectOrgChartIdsWithChildren(nodes: OrgChartTreeNode[]): string[] {
  const ids: string[] = []
  const visit = (node: OrgChartTreeNode) => {
    if (node.children.length > 0) {
      ids.push(node.id)
      for (const child of node.children) visit(child)
    }
  }
  for (const node of nodes) visit(node)
  return ids
}

export function collectAllOrgChartIds(nodes: OrgChartTreeNode[]): string[] {
  const ids: string[] = []
  const visit = (node: OrgChartTreeNode) => {
    ids.push(node.id)
    for (const child of node.children) visit(child)
  }
  for (const node of nodes) visit(node)
  return ids
}

export function filterOrgChartHierarchy(nodes: OrgChartTreeNode[], query: string): OrgChartTreeNode[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return nodes

  const matches = (node: OrgChartTreeNode) => node.name.toLowerCase().includes(needle)

  const visit = (input: OrgChartTreeNode[]): OrgChartTreeNode[] => {
    const result: OrgChartTreeNode[] = []
    for (const node of input) {
      if (matches(node)) {
        result.push(node)
        continue
      }
      const filteredChildren = visit(node.children)
      if (filteredChildren.length > 0) {
        result.push({ ...node, children: filteredChildren })
      }
    }
    return result
  }

  return visit(nodes)
}

export function countOrgChartSearchMatches(nodes: OrgChartTreeNode[], query: string): number {
  const needle = query.trim().toLowerCase()
  if (!needle) return 0

  let count = 0
  const visit = (input: OrgChartTreeNode[]) => {
    for (const node of input) {
      if (node.name.toLowerCase().includes(needle)) count += 1
      visit(node.children)
    }
  }
  visit(nodes)
  return count
}
