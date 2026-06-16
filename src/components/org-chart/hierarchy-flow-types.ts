/** Minimal tree node shape used by hierarchy org-chart diagrams. */
export interface OrgChartTreeNode {
  id: string
  name: string
  children: OrgChartTreeNode[]
}

export interface HierarchyFlowNodeRenderProps<T extends OrgChartTreeNode> {
  node: T
  highlight: string
  selected: boolean
  hasChildren: boolean
  childCount: number
  expanded: boolean
  onToggleExpand?: () => void
  onSelect?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onAddChild?: () => void
  allowEdit: boolean
  allowDelete: boolean
  allowCreate: boolean
  isLeaf: boolean
  childLabelSingular: string
  childLabelPlural: string
}

export interface HierarchyFlowNodeData<T extends OrgChartTreeNode> {
  node: T
  highlight: string
  selected: boolean
  hasChildren: boolean
  childCount: number
  expanded: boolean
  onToggleExpand?: () => void
  onSelect?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onAddChild?: () => void
  allowEdit: boolean
  allowDelete: boolean
  allowCreate: boolean
  isLeaf: boolean
  childLabelSingular: string
  childLabelPlural: string
}
