'use client'

import { ExplorerListTableControls } from '@/components/tables/explorer-list-table-controls'
import { useExplorerListTableOptional } from '@/components/tables/explorer-list-table-context'

/** Renders filter/column controls only when list-table context is available. */
export function ExplorerListTableControlsGate({
  showColumns = true,
  variant = 'default',
}: {
  showColumns?: boolean
  variant?: 'default' | 'drawings'
}) {
  const ctx = useExplorerListTableOptional()
  if (!ctx) return null
  return <ExplorerListTableControls showColumns={showColumns} variant={variant} />
}
