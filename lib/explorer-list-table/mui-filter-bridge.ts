import { GridLogicOperator, type GridFilterModel } from '@mui/x-data-grid'
import type { ExplorerFilterItem, ExplorerFilterOperator } from '@/lib/explorer-list-table/types'

function toMuiOperator(operator: ExplorerFilterOperator): string {
  switch (operator) {
    case 'contains':
      return 'contains'
    case 'equals':
      return 'equals'
    case 'notContains':
      return 'doesNotContain'
    case 'isEmpty':
      return 'isEmpty'
    case 'isNotEmpty':
      return 'isNotEmpty'
    default:
      return 'contains'
  }
}

function isActiveExplorerFilter(f: ExplorerFilterItem): boolean {
  if (!f.columnId) return false
  if (f.operator === 'isEmpty' || f.operator === 'isNotEmpty') return true
  return f.value.trim() !== ''
}

/** Maps multi-rule explorer filters to MUI DataGrid `filterModel` (AND). */
export function explorerFiltersToGridFilterModel(filters: ExplorerFilterItem[]): GridFilterModel {
  const items = filters.filter(isActiveExplorerFilter).map((f) => ({
    id: f.id,
    field: f.columnId,
    operator: toMuiOperator(f.operator),
    value:
      f.operator === 'isEmpty' || f.operator === 'isNotEmpty' ? undefined : f.value,
  }))

  return {
    logicOperator: GridLogicOperator.And,
    items,
  }
}
