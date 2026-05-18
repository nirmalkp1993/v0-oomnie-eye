import type { GridColDef } from '@mui/x-data-grid'
import type { MultiFilterColumn } from '@/components/tables/multi-filter-popover'

/** Build filter column options from DataGrid column definitions. */
export function gridColDefsToFilterColumns(columns: GridColDef[]): MultiFilterColumn[] {
  return columns
    .filter((col) => {
      const field = col.field
      if (!field || field === 'actions') return false
      return col.filterable !== false
    })
    .map((col) => ({
      id: col.field as string,
      label: typeof col.headerName === 'string' ? col.headerName : String(col.field),
    }))
}
