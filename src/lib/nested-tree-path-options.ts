export interface HierarchyTreeNode {
  id: string
  name: string
  children?: HierarchyTreeNode[]
}

export interface NestedPathOption {
  id: string
  label: string
}

const PATH_SEPARATOR = ' > '

export function collectNestedPathOptions(
  nodes: HierarchyTreeNode[],
  parentNames: string[] = [],
): NestedPathOption[] {
  const options: NestedPathOption[] = []

  for (const node of nodes) {
    const pathNames = [...parentNames, node.name]
    const label = pathNames.join(PATH_SEPARATOR)
    options.push({ id: node.id, label })

    if (node.children?.length) {
      options.push(...collectNestedPathOptions(node.children, pathNames))
    }
  }

  return options
}

export function filterNestedPathOptions(
  options: NestedPathOption[],
  query: string,
): NestedPathOption[] {
  const q = query.trim().toLowerCase()
  if (!q) return options
  return options.filter((option) => option.label.toLowerCase().includes(q))
}
