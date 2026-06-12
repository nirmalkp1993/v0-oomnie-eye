import {
  collectNestedPathOptions,
  type HierarchyTreeNode,
} from '@/src/lib/nested-tree-path-options'

export function findOfficeNode(
  nodes: HierarchyTreeNode[],
  id: string,
): HierarchyTreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children?.length) {
      const found = findOfficeNode(node.children, id)
      if (found) return found
    }
  }
  return null
}

export function collectSubtreePathLabels(
  nodes: HierarchyTreeNode[],
  nodeId: string,
): string[] {
  const node = findOfficeNode(nodes, nodeId)
  if (!node) return []
  return collectNestedPathOptions([node]).map((option) => option.label)
}

function mapOfficeTree(
  nodes: HierarchyTreeNode[],
  mapper: (node: HierarchyTreeNode) => HierarchyTreeNode,
): HierarchyTreeNode[] {
  return nodes.map((node) => {
    const next = mapper(node)
    if (next.children?.length) {
      return { ...next, children: mapOfficeTree(next.children, mapper) }
    }
    return next
  })
}

export function addOfficeRoot(
  nodes: HierarchyTreeNode[],
  name: string,
): { tree: HierarchyTreeNode[]; id: string } {
  const id = crypto.randomUUID()
  return {
    tree: [...nodes, { id, name: name.trim() }],
    id,
  }
}

export function addOfficeChild(
  nodes: HierarchyTreeNode[],
  parentId: string,
  name: string,
): { tree: HierarchyTreeNode[]; id: string } | null {
  if (!findOfficeNode(nodes, parentId)) return null

  const id = crypto.randomUUID()
  const child: HierarchyTreeNode = { id, name: name.trim() }

  const tree = mapOfficeTree(nodes, (node) => {
    if (node.id !== parentId) return node
    const children = node.children ? [...node.children, child] : [child]
    return { ...node, children }
  })

  return { tree, id }
}

export function updateOfficeName(
  nodes: HierarchyTreeNode[],
  id: string,
  name: string,
): HierarchyTreeNode[] {
  return mapOfficeTree(nodes, (node) =>
    node.id === id ? { ...node, name: name.trim() } : node,
  )
}

function filterOfficeTree(
  nodes: HierarchyTreeNode[],
  predicate: (node: HierarchyTreeNode) => boolean,
): HierarchyTreeNode[] {
  const result: HierarchyTreeNode[] = []

  for (const node of nodes) {
    if (!predicate(node)) continue
    const children = node.children?.length
      ? filterOfficeTree(node.children, predicate)
      : undefined
    result.push({
      ...node,
      children: children?.length ? children : undefined,
    })
  }

  return result
}

export function deleteOfficeNode(
  nodes: HierarchyTreeNode[],
  id: string,
): HierarchyTreeNode[] {
  return filterOfficeTree(nodes, (node) => node.id !== id)
}

export function officeNameExists(
  nodes: HierarchyTreeNode[],
  name: string,
  excludeId?: string,
): boolean {
  const trimmed = name.trim().toLowerCase()
  if (!trimmed) return false

  const walk = (items: HierarchyTreeNode[]): boolean => {
    for (const node of items) {
      if (node.id !== excludeId && node.name.trim().toLowerCase() === trimmed) {
        return true
      }
      if (node.children?.length && walk(node.children)) return true
    }
    return false
  }

  return walk(nodes)
}
