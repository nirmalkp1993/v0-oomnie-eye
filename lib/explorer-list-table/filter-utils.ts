import type { ExplorerFilterItem, ExplorerFilterOperator } from '@/lib/explorer-list-table/types'

export function matchesExplorerFilter(
  cellValue: string,
  operator: ExplorerFilterOperator,
  filterValue: string
): boolean {
  const cell = cellValue.trim()
  const q = filterValue.trim()
  const cellL = cell.toLowerCase()
  const qL = q.toLowerCase()

  switch (operator) {
    case 'contains':
      return q === '' || cellL.includes(qL)
    case 'equals':
      return q === '' || cellL === qL
    case 'notContains':
      return q === '' || !cellL.includes(qL)
    case 'isEmpty':
      return cell === ''
    case 'isNotEmpty':
      return cell !== ''
    default:
      return true
  }
}

export function matchesAllExplorerFilters(
  filters: ExplorerFilterItem[],
  getValue: (columnId: string) => string
): boolean {
  const active = filters.filter(
    (f) =>
      f.columnId &&
      (f.operator === 'isEmpty' ||
        f.operator === 'isNotEmpty' ||
        f.value.trim() !== '')
  )
  if (active.length === 0) return true
  return active.every((f) => matchesExplorerFilter(getValue(f.columnId), f.operator, f.value))
}

export function countActiveExplorerFilters(filters: ExplorerFilterItem[]): number {
  return filters.filter(
    (f) =>
      f.columnId &&
      (f.operator === 'isEmpty' ||
        f.operator === 'isNotEmpty' ||
        f.value.trim() !== '')
  ).length
}

export function createEmptyExplorerFilter(): ExplorerFilterItem {
  return {
    id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    columnId: '',
    operator: 'contains',
    value: '',
  }
}
