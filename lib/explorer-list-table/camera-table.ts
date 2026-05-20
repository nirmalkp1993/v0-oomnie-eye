import type { CameraTableGroupNode } from '@/lib/camera-store'
import type { Camera, CameraGroup } from '@/types/camera'
import {
  hasActiveExplorerFilters,
  matchesAllExplorerFilters,
} from '@/lib/explorer-list-table/filter-utils'
import type { ExplorerFilterItem, ExplorerListColumnDef } from '@/lib/explorer-list-table/types'

export const CAMERA_LIST_COLUMNS: ExplorerListColumnDef[] = [
  { id: 'name', label: 'Name', headerClassName: 'min-w-[200px]' },
  { id: 'ip', label: 'IP' },
  { id: 'items', label: 'Items', headerClassName: 'text-center w-[72px]', filterable: true },
  { id: 'type', label: 'Type', headerClassName: 'w-[88px]' },
  { id: 'cameraId', label: 'Camera ID' },
  { id: 'port', label: 'Port' },
  { id: 'apiBaseUrl', label: 'API Base URL' },
  { id: 'telnetUsername', label: 'Telnet Username' },
  { id: 'status', label: 'Status' },
  {
    id: 'actions',
    label: 'Actions',
    hideable: false,
    filterable: false,
    sortable: false,
    headerClassName: 'text-right',
  },
]

export function getCameraFilterValues(camera: Camera): Record<string, string> {
  return {
    name: camera.name,
    ip: camera.ip,
    items: '',
    type: 'camera',
    cameraId: camera.cameraId,
    port: String(camera.port),
    apiBaseUrl: camera.apiBaseUrl,
    telnetUsername: camera.telnetUsername,
    status:
      camera.status === 'live'
        ? 'LIVE'
        : camera.status === 'connecting'
          ? 'CONNECTING'
          : 'STOPPED',
  }
}

export function getCameraGroupFilterValues(
  group: CameraGroup,
  itemCount: number
): Record<string, string> {
  return {
    name: group.name,
    ip: '',
    items: String(itemCount),
    type: 'group',
    cameraId: '',
    port: '',
    apiBaseUrl: '',
    telnetUsername: '',
    status: '',
  }
}

export function cameraMatchesExplorerFilters(camera: Camera, filters: ExplorerFilterItem[]): boolean {
  const values = getCameraFilterValues(camera)
  return matchesAllExplorerFilters(filters, (id) => values[id] ?? '')
}

function cameraMatchesFilters(camera: Camera, filters: ExplorerFilterItem[]): boolean {
  return cameraMatchesExplorerFilters(camera, filters)
}

function groupMatchesFilters(
  group: CameraGroup,
  itemCount: number,
  filters: ExplorerFilterItem[]
): boolean {
  const values = getCameraGroupFilterValues(group, itemCount)
  return matchesAllExplorerFilters(filters, (id) => values[id] ?? '')
}

function groupParentIds(g: CameraGroup): string[] {
  return g.parentGroupIds ?? []
}

function cameraGroupIds(c: Camera): string[] {
  return c.groupIds ?? []
}

/** Whether a group card should show at the current explorer level when filters are active. */
export function cameraGroupMatchesExplorerFilters(
  group: CameraGroup,
  cameras: Camera[],
  groups: CameraGroup[],
  filters: ExplorerFilterItem[],
  countInSubtree: (groupId: string) => number
): boolean {
  if (!hasActiveExplorerFilters(filters)) return true
  if (groupMatchesFilters(group, countInSubtree(group.id), filters)) return true

  const childGroups = groups.filter((g) => groupParentIds(g).includes(group.id))
  if (
    childGroups.some((ch) =>
      cameraGroupMatchesExplorerFilters(ch, cameras, groups, filters, countInSubtree)
    )
  ) {
    return true
  }

  const directCameras = cameras.filter((c) => cameraGroupIds(c).includes(group.id))
  return directCameras.some((c) => cameraMatchesFilters(c, filters))
}

export function pruneCameraTableTree(
  node: CameraTableGroupNode,
  itemCount: number,
  filters: ExplorerFilterItem[],
  countInSubtree: (groupId: string) => number
): CameraTableGroupNode | null {
  const children = node.children
    .map((ch) => pruneCameraTableTree(ch, countInSubtree(ch.group.id), filters, countInSubtree))
    .filter((n): n is CameraTableGroupNode => n !== null)

  const cameras = node.cameras.filter((c) => cameraMatchesFilters(c, filters))

  const groupOk = groupMatchesFilters(node.group, itemCount, filters)
  if (groupOk || children.length > 0 || cameras.length > 0) {
    return { ...node, children, cameras }
  }
  return null
}

export function applyCameraListFilters(
  rootTrees: CameraTableGroupNode[],
  rootCameras: Camera[],
  filters: ExplorerFilterItem[],
  countInSubtree: (groupId: string) => number
): { rootTrees: CameraTableGroupNode[]; rootCameras: Camera[] } {
  const active = filters.some(
    (f) =>
      f.columnId &&
      (f.operator === 'isEmpty' ||
        f.operator === 'isNotEmpty' ||
        f.value.trim() !== '')
  )
  if (!active) return { rootTrees, rootCameras }

  const trees = rootTrees
    .map((n) => pruneCameraTableTree(n, countInSubtree(n.group.id), filters, countInSubtree))
    .filter((n): n is CameraTableGroupNode => n !== null)

  const cameras = rootCameras.filter((c) => cameraMatchesFilters(c, filters))

  return { rootTrees: trees, rootCameras: cameras }
}
