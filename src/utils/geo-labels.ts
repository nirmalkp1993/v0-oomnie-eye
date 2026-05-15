import type { GeoTreeNode } from '@/src/mock-data/geo-tree'

export function geoLabelMap(node: GeoTreeNode, acc: Record<string, string> = {}): Record<string, string> {
  acc[node.id] = node.label
  if (node.children) {
    for (const c of node.children) geoLabelMap(c, acc)
  }
  return acc
}
