import {
  type HierarchyTreeNode,
  type NestedPathOption,
} from '@/src/lib/nested-tree-path-options'

export function findHierarchyNode(
  nodes: HierarchyTreeNode[],
  id: string,
): HierarchyTreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children?.length) {
      const found = findHierarchyNode(node.children, id)
      if (found) return found
    }
  }
  return null
}

export function isDescendantOf(
  nodes: HierarchyTreeNode[],
  ancestorId: string,
  nodeId: string,
): boolean {
  if (ancestorId === nodeId) return true
  const ancestor = findHierarchyNode(nodes, ancestorId)
  if (!ancestor?.children?.length) return false

  const walk = (items: HierarchyTreeNode[]): boolean => {
    for (const node of items) {
      if (node.id === nodeId) return true
      if (node.children?.length && walk(node.children)) return true
    }
    return false
  }

  return walk(ancestor.children)
}

function mapHierarchyTree(
  nodes: HierarchyTreeNode[],
  mapper: (node: HierarchyTreeNode) => HierarchyTreeNode,
): HierarchyTreeNode[] {
  return nodes.map((node) => {
    const next = mapper(node)
    if (next.children?.length) {
      return { ...next, children: mapHierarchyTree(next.children, mapper) }
    }
    return next
  })
}

export function extractHierarchyNode(
  nodes: HierarchyTreeNode[],
  nodeId: string,
): { tree: HierarchyTreeNode[]; node: HierarchyTreeNode | null } {
  let extracted: HierarchyTreeNode | null = null

  const walk = (items: HierarchyTreeNode[]): HierarchyTreeNode[] => {
    const result: HierarchyTreeNode[] = []

    for (const node of items) {
      if (node.id === nodeId) {
        extracted = node
        continue
      }

      const children = node.children?.length ? walk(node.children) : undefined
      result.push({
        ...node,
        children: children?.length ? children : undefined,
      })
    }

    return result
  }

  return { tree: walk(nodes), node: extracted }
}

export function reparentHierarchySubtree(
  nodes: HierarchyTreeNode[],
  nodeId: string,
  newParentId: string,
): HierarchyTreeNode[] | null {
  if (nodeId === newParentId) return null
  if (isDescendantOf(nodes, nodeId, newParentId)) return null

  const { tree: withoutNode, node } = extractHierarchyNode(nodes, nodeId)
  if (!node) return null

  let attached = false
  const nextTree = mapHierarchyTree(withoutNode, (parent) => {
    if (parent.id !== newParentId) return parent
    attached = true
    const children = [...(parent.children ?? []), node]
    return { ...parent, children }
  })

  return attached ? nextTree : null
}

export function getDirectChildNodes(
  nodes: HierarchyTreeNode[],
  parentId: string,
): HierarchyTreeNode[] {
  return findHierarchyNode(nodes, parentId)?.children ?? []
}

function getRootPathOptions(tree: HierarchyTreeNode[]): NestedPathOption[] {
  return tree.map((node) => ({ id: node.id, label: node.name }))
}

export function getAttachCandidatesForNewRoot(
  tree: HierarchyTreeNode[],
): NestedPathOption[] {
  return getRootPathOptions(tree)
}

export function getReparentCandidateOptions(
  tree: HierarchyTreeNode[],
  parentId: string,
): NestedPathOption[] {
  const parent = findHierarchyNode(tree, parentId)
  const directChildIds = new Set((parent?.children ?? []).map((child) => child.id))

  return getRootPathOptions(tree).filter((option) => {
    if (option.id === parentId) return false
    if (directChildIds.has(option.id)) return false
    if (isDescendantOf(tree, parentId, option.id)) return false
    return true
  })
}
