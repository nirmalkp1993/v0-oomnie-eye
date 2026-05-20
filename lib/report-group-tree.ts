import type { ReportGroup, ReportPinType, ReportPlacemark } from '@/types/report-placemark'

function placemarkGroupIds(p: ReportPlacemark): string[] {
  return p.groupIds ?? []
}

function groupParentIds(g: ReportGroup): string[] {
  return g.parentGroupIds ?? []
}

export function placemarkMatchesSearch(p: ReportPlacemark, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const blob = [
    p.placemarkName,
    p.pinIcon,
    p.iconColor,
    p.category,
    p.tags.join(' '),
    p.city,
    p.country,
    p.region,
    String(p.latitude),
    String(p.longitude),
    String(p.altitude),
    p.grounding,
    p.description,
  ]
    .join(' ')
    .toLowerCase()
  return blob.includes(q)
}

function subtreeHasSearchMatch(
  group: ReportGroup,
  placemarks: ReportPlacemark[],
  allGroups: ReportGroup[],
  q: string,
  visited: Set<string>,
): boolean {
  if (visited.has(group.id)) return false
  visited.add(group.id)
  const ql = q.toLowerCase()
  if (group.name.toLowerCase().includes(ql)) return true
  if (
    placemarks.some(
      (p) => placemarkGroupIds(p).includes(group.id) && placemarkMatchesSearch(p, q),
    )
  ) {
    return true
  }
  return allGroups
    .filter((g) => groupParentIds(g).includes(group.id))
    .some((cg) => subtreeHasSearchMatch(cg, placemarks, allGroups, q, visited))
}

export interface ReportTableGroupNode {
  group: ReportGroup
  placemarks: ReportPlacemark[]
  children: ReportTableGroupNode[]
}

function buildReportGroupTreeNode(
  group: ReportGroup,
  placemarks: ReportPlacemark[],
  allGroups: ReportGroup[],
  qTrim: string,
  ancestorPath: Set<string>,
): ReportTableGroupNode | null {
  if (ancestorPath.has(group.id)) return null

  const hasSearch = qTrim.length > 0
  if (hasSearch && !subtreeHasSearchMatch(group, placemarks, allGroups, qTrim, new Set())) {
    return null
  }

  const childGroups = allGroups
    .filter((g) => groupParentIds(g).includes(group.id))
    .sort((a, b) => a.name.localeCompare(b.name))

  const nextPath = new Set(ancestorPath).add(group.id)

  const childNodes = childGroups
    .map((cg) => buildReportGroupTreeNode(cg, placemarks, allGroups, qTrim, nextPath))
    .filter((n): n is ReportTableGroupNode => n !== null)

  const direct = placemarks.filter((p) => placemarkGroupIds(p).includes(group.id))
  const groupNameMatch = hasSearch && group.name.toLowerCase().includes(qTrim.toLowerCase())

  let displayPlacemarks: ReportPlacemark[]
  if (!hasSearch) displayPlacemarks = direct
  else if (groupNameMatch) displayPlacemarks = direct
  else displayPlacemarks = direct.filter((p) => placemarkMatchesSearch(p, qTrim))

  displayPlacemarks = [...displayPlacemarks].sort((a, b) =>
    a.placemarkName.localeCompare(b.placemarkName),
  )

  return { group, placemarks: displayPlacemarks, children: childNodes }
}

export function collectPlacemarkIdsInGroupSubtree(
  groupId: string,
  placemarks: ReportPlacemark[],
  groups: ReportGroup[],
): Set<string> {
  const ids = new Set<string>()
  for (const p of placemarks) {
    if (placemarkGroupIds(p).includes(groupId)) ids.add(p.id)
  }
  for (const g of groups) {
    if (groupParentIds(g).includes(groupId)) {
      for (const id of collectPlacemarkIdsInGroupSubtree(g.id, placemarks, groups)) {
        ids.add(id)
      }
    }
  }
  return ids
}

export function countPlacemarksInGroupSubtree(
  groupId: string,
  placemarks: ReportPlacemark[],
  groups: ReportGroup[],
): number {
  return collectPlacemarkIdsInGroupSubtree(groupId, placemarks, groups).size
}

export function getReportTableTree(
  pinType: ReportPinType,
  placemarks: ReportPlacemark[],
  groups: ReportGroup[],
  searchQuery: string,
): { rootTrees: ReportTableGroupNode[]; rootPlacemarks: ReportPlacemark[] } {
  const qTrim = searchQuery.trim()
  const byType = (p: ReportPlacemark) => p.pinType === pinType
  const gByType = (g: ReportGroup) => g.pinType === pinType

  const pList = placemarks.filter(byType)
  const gList = groups.filter(gByType)

  const roots = gList
    .filter((g) => groupParentIds(g).length === 0)
    .sort((a, b) => a.name.localeCompare(b.name))

  const rootTrees: ReportTableGroupNode[] = roots
    .map((g) => buildReportGroupTreeNode(g, pList, gList, qTrim, new Set()))
    .filter((n): n is ReportTableGroupNode => n !== null)

  const rootPlacemarks = pList
    .filter((p) => placemarkGroupIds(p).length === 0)
    .filter((p) => placemarkMatchesSearch(p, qTrim))
    .sort((a, b) => a.placemarkName.localeCompare(b.placemarkName))

  return { rootTrees, rootPlacemarks }
}

export function findReportTableGroupNode(
  nodes: ReportTableGroupNode[],
  groupId: string
): ReportTableGroupNode | null {
  for (const node of nodes) {
    if (node.group.id === groupId) return node
    const found = findReportTableGroupNode(node.children, groupId)
    if (found) return found
  }
  return null
}
