import type { GeoTreeNode } from '@/src/mock-data/geo-tree'

export function geoLabelMap(node: GeoTreeNode, acc: Record<string, string> = {}): Record<string, string> {
  acc[node.id] = node.name
  if (node.children) {
    for (const child of node.children) geoLabelMap(child, acc)
  }
  return acc
}
