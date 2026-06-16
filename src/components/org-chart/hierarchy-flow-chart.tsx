'use client'

import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useUpdateNodeInternals,
  type EdgeTypes,
  type Node,
  type NodeProps,
  type NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Box, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { HierarchyStepEdge } from '@/src/components/org-chart/hierarchy-step-edge'
import {
  buildHierarchyFlowGraph,
  HIERARCHY_NODE_HEIGHT,
  HIERARCHY_NODE_WIDTH,
  HIERARCHY_SOURCE_HANDLE,
  HIERARCHY_TARGET_HANDLE,
} from '@/src/components/org-chart/hierarchy-flow-layout'
import { HierarchyTreeCard } from '@/src/components/org-chart/hierarchy-tree-card'
import type {
  HierarchyFlowNodeData,
  HierarchyFlowNodeRenderProps,
  OrgChartTreeNode,
} from '@/src/components/org-chart/hierarchy-flow-types'

export interface HierarchyFlowChartProps<T extends OrgChartTreeNode> {
  roots: T[]
  highlight?: string
  ariaLabel: string
  selectedId?: string | null
  expanded: Set<string>
  onToggleExpand: (id: string) => void
  onSelect?: (node: T) => void
  onEdit?: (node: T) => void
  onDelete?: (node: T) => void
  onAddChild?: (node: T) => void
  allowEdit?: boolean
  allowDelete?: boolean
  allowCreate?: boolean
  childLabelSingular: string
  childLabelPlural: string
  /** @deprecated Cards render via HierarchyTreeCard internally. */
  renderCard?: (props: HierarchyFlowNodeRenderProps<T>) => ReactNode
}

const HierarchyCardNode = memo((props: NodeProps<Node<HierarchyFlowNodeData<OrgChartTreeNode>>>) => {
  const { data, id } = props
  const cardRef = useRef<HTMLDivElement>(null)
  const [cardHeight, setCardHeight] = useState(HIERARCHY_NODE_HEIGHT)
  const updateNodeInternals = useUpdateNodeInternals()

  useLayoutEffect(() => {
    const el = cardRef.current
    if (!el) return

    const measure = () => {
      const next = Math.ceil(el.getBoundingClientRect().height)
      setCardHeight((prev) => (prev === next ? prev : next))
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [data])

  useEffect(() => {
    updateNodeInternals(id)
  }, [cardHeight, id, updateNodeInternals])

  if (!data?.node) return null

  return (
    <Box
      className="nodrag nopan nowheel"
      sx={{
        position: 'relative',
        width: HIERARCHY_NODE_WIDTH,
        minHeight: HIERARCHY_NODE_HEIGHT,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        pointerEvents: 'all',
        background: 'transparent',
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <Handle
        id={HIERARCHY_TARGET_HANDLE}
        type="target"
        position={Position.Top}
        isConnectable={false}
        style={{
          opacity: 0,
          width: 1,
          height: 1,
          border: 'none',
          background: 'transparent',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
      <Box ref={cardRef} sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
        <HierarchyTreeCard {...(data as HierarchyFlowNodeRenderProps<OrgChartTreeNode>)} />
      </Box>
      <Handle
        id={HIERARCHY_SOURCE_HANDLE}
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        style={{
          opacity: 0,
          width: 1,
          height: 1,
          border: 'none',
          background: 'transparent',
          top: cardHeight,
          bottom: 'auto',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
    </Box>
  )
})
HierarchyCardNode.displayName = 'HierarchyCardNode'

const nodeTypes: NodeTypes = {
  hierarchyCard: HierarchyCardNode,
}

const edgeTypes: EdgeTypes = {
  hierarchyStep: HierarchyStepEdge,
}

function HierarchyFlowCanvas<T extends OrgChartTreeNode>({
  roots,
  highlight = '',
  ariaLabel,
  selectedId = null,
  expanded,
  onToggleExpand,
  onSelect,
  onEdit,
  onDelete,
  onAddChild,
  allowEdit = false,
  allowDelete = false,
  allowCreate = false,
  childLabelSingular,
  childLabelPlural,
}: Omit<HierarchyFlowChartProps<T>, 'renderCard'>) {
  const theme = useTheme()
  const { fitView } = useReactFlow()
  const updateNodeInternals = useUpdateNodeInternals()
  const containerRef = useRef<HTMLDivElement>(null)

  const handlersRef = useRef({
    onToggleExpand,
    onSelect,
    onEdit,
    onDelete,
    onAddChild,
    allowEdit,
    allowDelete,
    allowCreate,
    selectedId,
    childLabelSingular,
    childLabelPlural,
  })
  handlersRef.current = {
    onToggleExpand,
    onSelect,
    onEdit,
    onDelete,
    onAddChild,
    allowEdit,
    allowDelete,
    allowCreate,
    selectedId,
    childLabelSingular,
    childLabelPlural,
  }

  const buildData = useCallback(
    (
      node: T,
      ctx: {
        hasChildren: boolean
        childCount: number
        expanded: boolean
        isLeaf: boolean
      },
    ): HierarchyFlowNodeData<T> => ({
      node,
      highlight,
      selected: handlersRef.current.selectedId === node.id,
      hasChildren: ctx.hasChildren,
      childCount: ctx.childCount,
      expanded: ctx.expanded,
      isLeaf: ctx.isLeaf,
      allowEdit: handlersRef.current.allowEdit,
      allowDelete: handlersRef.current.allowDelete,
      allowCreate: handlersRef.current.allowCreate,
      childLabelSingular: handlersRef.current.childLabelSingular,
      childLabelPlural: handlersRef.current.childLabelPlural,
      onToggleExpand: ctx.hasChildren
        ? () => handlersRef.current.onToggleExpand(node.id)
        : undefined,
      onSelect: handlersRef.current.onSelect
        ? () => handlersRef.current.onSelect!(node)
        : undefined,
      onEdit: handlersRef.current.onEdit ? () => handlersRef.current.onEdit!(node) : undefined,
      onDelete: handlersRef.current.onDelete
        ? () => handlersRef.current.onDelete!(node)
        : undefined,
      onAddChild: handlersRef.current.onAddChild
        ? () => handlersRef.current.onAddChild!(node)
        : undefined,
    }),
    [highlight],
  )

  const edgeStroke =
    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.35)'

  const graph = useMemo(
    () => buildHierarchyFlowGraph(roots, expanded, buildData),
    [roots, expanded, buildData],
  )

  const styledEdges = useMemo(
    () =>
      graph.edges.map((edge) => ({
        ...edge,
        style: {
          ...edge.style,
          stroke: edgeStroke,
          strokeWidth: 2,
        },
      })),
    [graph.edges, edgeStroke],
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(graph.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(styledEdges)

  useEffect(() => {
    setNodes(graph.nodes)
    setEdges(styledEdges)
  }, [graph.nodes, styledEdges, setNodes, setEdges])

  const scheduleFitView = useCallback(() => {
    if (graph.nodes.length === 0) return
    requestAnimationFrame(() => {
      for (const node of graph.nodes) {
        updateNodeInternals(node.id)
      }
      requestAnimationFrame(() => {
        void fitView({ padding: 0.2, maxZoom: 1, duration: 120 })
      })
    })
  }, [fitView, graph.nodes, updateNodeInternals])

  useEffect(() => {
    scheduleFitView()
  }, [graph.nodes, graph.edges, scheduleFitView])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(() => scheduleFitView())
    observer.observe(el)
    return () => observer.disconnect()
  }, [scheduleFitView])

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'hierarchyStep' as const,
      style: { stroke: edgeStroke, strokeWidth: 2 },
    }),
    [edgeStroke],
  )

  if (roots.length === 0) return null

  return (
    <Box
      ref={containerRef}
      role="tree"
      aria-label={ariaLabel}
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 360,
        minWidth: 0,
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: (t) =>
          t.palette.mode === 'dark' ? alpha(t.palette.common.black, 0.2) : t.palette.grey[50],
        backgroundImage: (t) =>
          t.palette.mode === 'dark'
            ? 'none'
            : `radial-gradient(${t.palette.divider} 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
        '& .react-flow': {
          width: '100%',
          height: '100%',
        },
        '& .react-flow__node-hierarchyCard': {
          background: 'transparent !important',
          border: 'none !important',
          boxShadow: 'none !important',
          padding: 0,
        },
        '& .react-flow__edge-path': {
          stroke: `${edgeStroke} !important`,
          strokeWidth: '2px !important',
          fill: 'none',
        },
        '& .react-flow__controls-button': {
          borderColor: 'divider',
        },
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        panOnScroll={false}
        zoomOnScroll
        minZoom={0.35}
        maxZoom={1.25}
        onInit={() => scheduleFitView()}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} size={1} color={alpha(theme.palette.divider, 0.6)} />
        <Controls showInteractive={false} position="bottom-right" />
      </ReactFlow>
    </Box>
  )
}

export function HierarchyFlowChart<T extends OrgChartTreeNode>(props: HierarchyFlowChartProps<T>) {
  return (
    <ReactFlowProvider>
      <HierarchyFlowCanvas {...props} />
    </ReactFlowProvider>
  )
}
