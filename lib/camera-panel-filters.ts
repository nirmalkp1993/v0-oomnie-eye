import type { Camera } from '@/types/camera'
import { applyCameraListFilters } from '@/lib/explorer-list-table/camera-table'
import type { ExplorerFilterItem } from '@/lib/explorer-list-table/types'

export function cameraMatchesPanelSearch(c: Camera, q: string): boolean {
  if (!q.trim()) return true
  const ql = q.trim().toLowerCase()
  return (
    c.name.toLowerCase().includes(ql) ||
    c.ip.toLowerCase().includes(ql) ||
    c.type.toLowerCase().includes(ql)
  )
}

export function filterPanelCameras(
  cameras: Camera[],
  searchQuery: string,
  filters: ExplorerFilterItem[],
): Camera[] {
  const searched = searchQuery.trim()
    ? cameras.filter((c) => cameraMatchesPanelSearch(c, searchQuery))
    : cameras
  return applyCameraListFilters([], searched, filters, () => 0).rootCameras
}
