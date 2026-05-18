'use client'

import { ExplorerListTableControls } from '@/components/tables/explorer-list-table-controls'
import { useExplorerListTableOptional } from '@/components/tables/explorer-list-table-context'

/** Renders filter/column controls only when list-table context is available. */
export function ExplorerListTableControlsGate() {
  const ctx = useExplorerListTableOptional()
  if (!ctx) return null
  return <ExplorerListTableControls />
}
