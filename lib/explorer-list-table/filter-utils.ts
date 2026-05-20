import {
  EXPLORER_FILTER_OPERATORS,
  type ExplorerFilterItem,
  type ExplorerFilterOperator,
} from '@/lib/explorer-list-table/types'

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

export function isActiveExplorerFilter(f: ExplorerFilterItem): boolean {
  return Boolean(
    f.columnId &&
      (f.operator === 'isEmpty' ||
        f.operator === 'isNotEmpty' ||
        f.value.trim() !== '')
  )
}

export function getActiveExplorerFilters(filters: ExplorerFilterItem[]): ExplorerFilterItem[] {
  return filters.filter(isActiveExplorerFilter)
}

export function hasActiveExplorerFilters(filters: ExplorerFilterItem[]): boolean {
  return getActiveExplorerFilters(filters).length > 0
}

export function countActiveExplorerFilters(filters: ExplorerFilterItem[]): number {
  return getActiveExplorerFilters(filters).length
}

export function formatExplorerFilterLabel(
  filter: ExplorerFilterItem,
  columnLabel: string
): string {
  const op =
    EXPLORER_FILTER_OPERATORS.find((o) => o.value === filter.operator)?.label ?? filter.operator
  if (filter.operator === 'isEmpty' || filter.operator === 'isNotEmpty') {
    return `${columnLabel} ${op}`
  }
  const value = filter.value.trim()
  return value ? `${columnLabel} ${op} "${value}"` : `${columnLabel} ${op}`
}

export function createEmptyExplorerFilter(): ExplorerFilterItem {
  return {
    id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    columnId: '',
    operator: 'contains',
    value: '',
  }
}
