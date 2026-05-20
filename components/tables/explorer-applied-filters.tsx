'use client'

import { AppliedFiltersBar } from '@/components/tables/applied-filters-bar'
import { useExplorerListTableOptional } from '@/components/tables/explorer-list-table-context'

export function ExplorerAppliedFiltersBar() {
  const ctx = useExplorerListTableOptional()
  if (!ctx) return null

  const { filters, setFilters, columns } = ctx
  return (
    <AppliedFiltersBar
      filters={filters}
      onFiltersChange={setFilters}
      columns={columns.map((c) => ({ id: c.id, label: c.label }))}
    />
  )
}

/** Renders applied filter chips when list-table context is available. */
export function ExplorerAppliedFiltersBarGate() {
  const ctx = useExplorerListTableOptional()
  if (!ctx) return null
  return <ExplorerAppliedFiltersBar />
}
