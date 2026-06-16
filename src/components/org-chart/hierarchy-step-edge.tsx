'use client'

import { BaseEdge, type EdgeProps } from '@xyflow/react'
import { ORG_CHART_STEM_HEIGHT_PX } from '@/src/components/org-chart/branch-connector-svg'

export function HierarchyStepEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  markerEnd,
}: EdgeProps) {
  const busY = sourceY + ORG_CHART_STEM_HEIGHT_PX
  const path = `M ${sourceX},${sourceY} L ${sourceX},${busY} L ${targetX},${busY} L ${targetX},${targetY}`

  return <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />
}
