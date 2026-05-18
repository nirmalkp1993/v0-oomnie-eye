export type ExplorerFilterOperator =
  | 'contains'
  | 'equals'
  | 'notContains'
  | 'isEmpty'
  | 'isNotEmpty'

export type ExplorerFilterItem = {
  id: string
  columnId: string
  operator: ExplorerFilterOperator
  value: string
}

export type ExplorerListColumnDef = {
  id: string
  label: string
  /** @default true */
  hideable?: boolean
  /** @default true */
  defaultVisible?: boolean
  /** @default true (except actions) */
  filterable?: boolean
  headerClassName?: string
}

export const EXPLORER_FILTER_OPERATORS: { value: ExplorerFilterOperator; label: string }[] = [
  { value: 'contains', label: 'contains' },
  { value: 'equals', label: 'equals' },
  { value: 'notContains', label: 'does not contain' },
  { value: 'isEmpty', label: 'is empty' },
  { value: 'isNotEmpty', label: 'is not empty' },
]
