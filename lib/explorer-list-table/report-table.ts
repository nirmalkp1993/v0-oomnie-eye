import type { ReportTableGroupNode } from '@/lib/report-group-tree'
import type { ReportGroup, ReportPlacemark } from '@/types/report-placemark'
import { matchesAllExplorerFilters } from '@/lib/explorer-list-table/filter-utils'
import type { ExplorerFilterItem, ExplorerListColumnDef } from '@/lib/explorer-list-table/types'

export const REPORT_LIST_COLUMNS: ExplorerListColumnDef[] = [
  { id: 'name', label: 'Placemark name', headerClassName: 'sticky left-0 z-10 min-w-[200px] bg-card' },
  { id: 'items', label: 'Items', headerClassName: 'w-[72px] text-center' },
  { id: 'pinIcon', label: 'Pin icon', headerClassName: 'min-w-[100px]' },
  { id: 'iconColor', label: 'Icon color', headerClassName: 'min-w-[120px]' },
  { id: 'category', label: 'Category', headerClassName: 'min-w-[100px]' },
  { id: 'tags', label: 'Tags', headerClassName: 'min-w-[140px]' },
  { id: 'city', label: 'City', headerClassName: 'min-w-[90px]' },
  { id: 'country', label: 'Country', headerClassName: 'min-w-[90px]' },
  { id: 'region', label: 'Region', headerClassName: 'min-w-[90px]' },
  { id: 'latitude', label: 'Latitude', headerClassName: 'min-w-[100px]' },
  { id: 'longitude', label: 'Longitude', headerClassName: 'min-w-[100px]' },
  { id: 'altitude', label: 'Altitude', headerClassName: 'min-w-[80px]' },
  { id: 'grounding', label: 'Grounding', headerClassName: 'min-w-[100px]' },
  { id: 'description', label: 'Description', headerClassName: 'min-w-[200px]' },
  {
    id: 'actions',
    label: 'Actions',
    hideable: false,
    filterable: false,
    headerClassName: 'sticky right-0 z-10 min-w-[72px] bg-card text-right',
  },
]

export function getPlacemarkFilterValues(p: ReportPlacemark): Record<string, string> {
  return {
    name: p.placemarkName,
    items: '',
    pinIcon: p.pinIcon,
    iconColor: p.iconColor,
    category: p.category,
    tags: p.tags.join(', '),
    city: p.city,
    country: p.country,
    region: p.region,
    latitude: p.latitude.toFixed(5),
    longitude: p.longitude.toFixed(5),
    altitude: String(p.altitude),
    grounding: p.grounding,
    description: p.description,
  }
}

export function getReportGroupFilterValues(
  group: ReportGroup,
  itemCount: number
): Record<string, string> {
  return {
    name: group.name,
    items: String(itemCount),
    pinIcon: '',
    iconColor: '',
    category: '',
    tags: '',
    city: '',
    country: '',
    region: '',
    latitude: '',
    longitude: '',
    altitude: '',
    grounding: '',
    description: '',
  }
}

function placemarkMatchesFilters(p: ReportPlacemark, filters: ExplorerFilterItem[]): boolean {
  const values = getPlacemarkFilterValues(p)
  return matchesAllExplorerFilters(filters, (id) => values[id] ?? '')
}

function groupMatchesFilters(
  group: ReportGroup,
  itemCount: number,
  filters: ExplorerFilterItem[]
): boolean {
  const values = getReportGroupFilterValues(group, itemCount)
  return matchesAllExplorerFilters(filters, (id) => values[id] ?? '')
}

export function pruneReportTableTree(
  node: ReportTableGroupNode,
  itemCount: number,
  filters: ExplorerFilterItem[],
  countInSubtree: (groupId: string) => number
): ReportTableGroupNode | null {
  const children = node.children
    .map((ch) => pruneReportTableTree(ch, countInSubtree(ch.group.id), filters, countInSubtree))
    .filter((n): n is ReportTableGroupNode => n !== null)

  const placemarks = node.placemarks.filter((p) => placemarkMatchesFilters(p, filters))

  const groupOk = groupMatchesFilters(node.group, itemCount, filters)
  if (groupOk || children.length > 0 || placemarks.length > 0) {
    return { ...node, children, placemarks }
  }
  return null
}

export function applyReportListFilters(
  rootTrees: ReportTableGroupNode[],
  rootPlacemarks: ReportPlacemark[],
  filters: ExplorerFilterItem[],
  countInSubtree: (groupId: string) => number
): { rootTrees: ReportTableGroupNode[]; rootPlacemarks: ReportPlacemark[] } {
  const active = filters.some(
    (f) =>
      f.columnId &&
      (f.operator === 'isEmpty' ||
        f.operator === 'isNotEmpty' ||
        f.value.trim() !== '')
  )
  if (!active) return { rootTrees, rootPlacemarks }

  const trees = rootTrees
    .map((n) => pruneReportTableTree(n, countInSubtree(n.group.id), filters, countInSubtree))
    .filter((n): n is ReportTableGroupNode => n !== null)

  const placemarks = rootPlacemarks.filter((p) => placemarkMatchesFilters(p, filters))

  return { rootTrees: trees, rootPlacemarks: placemarks }
}
