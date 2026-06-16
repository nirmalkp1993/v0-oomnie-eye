import dagre from '@dagrejs/dagre'
import { Position, type Edge, type Node } from '@xyflow/react'
import { orgChartConnectorHeightPx } from '@/src/components/org-chart/branch-connector-svg'
import type { HierarchyFlowNodeData, OrgChartTreeNode } from '@/src/components/org-chart/hierarchy-flow-types'

export const HIERARCHY_NODE_WIDTH = 200
export const HIERARCHY_NODE_HEIGHT = 78
const ROOT_FOREST_GAP = 48
const HIERARCHY_RANK_SEP = orgChartConnectorHeightPx()

export const HIERARCHY_SOURCE_HANDLE = 'source'
export const HIERARCHY_TARGET_HANDLE = 'target'

function nodeId(id: string): string {
  return `hierarchy-${id}`
}

function visitVisible<T extends OrgChartTreeNode>(
  node: T,
  expanded: Set<string>,
  parentFlowId: string | null,
  flowNodes: Node<HierarchyFlowNodeData<T>>[],
  flowEdges: Edge[],
  dataFactory: (
    node: T,
    ctx: {
      hasChildren: boolean
      childCount: number
      expanded: boolean
      isLeaf: boolean
    },
  ) => HierarchyFlowNodeData<T>,
): void {
  const id = nodeId(node.id)
  const childCount = node.children.length
  const hasChildren = childCount > 0
  const isExpanded = hasChildren && expanded.has(node.id)

  flowNodes.push({
    id,
    type: 'hierarchyCard',
    position: { x: 0, y: 0 },
    width: HIERARCHY_NODE_WIDTH,
    height: HIERARCHY_NODE_HEIGHT,
    measured: {
      width: HIERARCHY_NODE_WIDTH,
      height: HIERARCHY_NODE_HEIGHT,
    },
    data: dataFactory(node, {
      hasChildren,
      childCount,
      expanded: isExpanded,
      isLeaf: !hasChildren,
    }),
    draggable: false,
    selectable: false,
    connectable: false,
  })

  if (parentFlowId) {
    flowEdges.push({
      id: `${parentFlowId}-${id}`,
      source: parentFlowId,
      target: id,
      sourceHandle: HIERARCHY_SOURCE_HANDLE,
      targetHandle: HIERARCHY_TARGET_HANDLE,
      type: 'hierarchyStep',
      animated: false,
      style: { strokeWidth: 2 },
    })
  }

  if (isExpanded) {
    for (const child of node.children as T[]) {
      visitVisible(child, expanded, id, flowNodes, flowEdges, dataFactory)
    }
  }
}

function layoutForest<T extends OrgChartTreeNode>(
  flowNodes: Node<HierarchyFlowNodeData<T>>[],
  flowEdges: Edge[],
): Node<HierarchyFlowNodeData<T>>[] {
  if (flowNodes.length === 0) return []

  const graph = new dagre.graphlib.Graph()
  graph.setDefaultEdgeLabel(() => ({}))
  graph.setGraph({
    rankdir: 'TB',
    nodesep: 48,
    ranksep: HIERARCHY_RANK_SEP,
    marginx: 20,
    marginy: 16,
  })

  for (const node of flowNodes) {
    graph.setNode(node.id, {
      width: HIERARCHY_NODE_WIDTH,
      height: HIERARCHY_NODE_HEIGHT,
    })
  }
  for (const edge of flowEdges) {
    graph.setEdge(edge.source, edge.target)
  }

  dagre.layout(graph)

  return flowNodes.map((node) => {
    const layoutNode = graph.node(node.id)
    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: {
        x: layoutNode.x - HIERARCHY_NODE_WIDTH / 2,
        y: layoutNode.y - HIERARCHY_NODE_HEIGHT / 2,
      },
    }
  })
}

export function buildHierarchyFlowGraph<T extends OrgChartTreeNode>(
  roots: T[],
  expanded: Set<string>,
  dataFactory: (
    node: T,
    ctx: {
      hasChildren: boolean
      childCount: number
      expanded: boolean
      isLeaf: boolean
    },
  ) => HierarchyFlowNodeData<T>,
): { nodes: Node<HierarchyFlowNodeData<T>>[]; edges: Edge[] } {
  const allNodes: Node<HierarchyFlowNodeData<T>>[] = []
  const allEdges: Edge[] = []
  let xOffset = 0

  for (const root of roots) {
    const forestNodes: Node<HierarchyFlowNodeData<T>>[] = []
    const forestEdges: Edge[] = []
    visitVisible(root, expanded, null, forestNodes, forestEdges, dataFactory)

    const laidOut = layoutForest(forestNodes, forestEdges)
    if (laidOut.length === 0) continue

    const minX = Math.min(...laidOut.map((n) => n.position.x))
    const maxX = Math.max(...laidOut.map((n) => n.position.x + HIERARCHY_NODE_WIDTH))
    const width = maxX - minX

    for (const node of laidOut) {
      allNodes.push({
        ...node,
        position: {
          x: node.position.x - minX + xOffset,
          y: node.position.y,
        },
      })
    }
    allEdges.push(...forestEdges)
    xOffset += width + ROOT_FOREST_GAP
  }

  return { nodes: allNodes, edges: allEdges }
}
