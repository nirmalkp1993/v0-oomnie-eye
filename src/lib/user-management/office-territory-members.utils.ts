import type { HierarchyTreeNode } from '@/src/lib/nested-tree-path-options'
import type { OfficeListItem } from '@/src/types/office-page'
import type { OfficeTreeNode } from '@/src/types/office'

export function flattenOfficeTree(nodes: HierarchyTreeNode[]): OfficeListItem[] {
  const result: OfficeListItem[] = []

  const walk = (list: HierarchyTreeNode[]) => {
    for (const node of list) {
      const officeNode = node as OfficeTreeNode
      result.push({
        id: node.id,
        name: node.name,
        officeName: officeNode.officeName ?? node.name,
        addressLine: officeNode.address?.addressLine ?? '',
        city: officeNode.address?.city ?? '',
        state: officeNode.address?.state ?? '',
        country: officeNode.address?.country ?? '',
      })
      if (node.children?.length) walk(node.children)
    }
  }

  walk(nodes)
  return result
}

export function getOfficesForTerritory(
  territoryId: string,
  allOffices: OfficeListItem[],
  assignments: Record<string, string>,
): OfficeListItem[] {
  return allOffices.filter((office) => assignments[office.id] === territoryId)
}

export function getUnassignedOffices(
  allOffices: OfficeListItem[],
  assignments: Record<string, string>,
): OfficeListItem[] {
  return allOffices.filter((office) => !assignments[office.id])
}

export function filterPanelOffices(offices: OfficeListItem[], searchQuery: string): OfficeListItem[] {
  const q = searchQuery.trim().toLowerCase()
  if (!q) return offices
  return offices.filter((office) =>
    [office.name, office.officeName, office.city, office.state, office.country, office.addressLine]
      .join(' ')
      .toLowerCase()
      .includes(q),
  )
}

export function getOfficeRowCellValue(row: OfficeListItem, columnId: string): string {
  switch (columnId) {
    case 'name':
      return row.officeName || row.name
    case 'city':
      return row.city || '—'
    case 'state':
      return row.state || '—'
    case 'country':
      return row.country || '—'
    default:
      return '—'
  }
}
