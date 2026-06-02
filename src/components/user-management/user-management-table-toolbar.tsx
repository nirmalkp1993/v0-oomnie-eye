'use client'

import type { ReactNode } from 'react'
import { EnterpriseExplorerToolbar } from '@/src/components/enterprise'

export type UserManagementTableToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder: string
  resultCount: number
  resultLabel?: string
  filtersSlot?: ReactNode
  trailingActions?: ReactNode
}

/** Toolbar chrome — same as camera module (`EnterpriseExplorerToolbar` drawings variant). */
export function UserManagementTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  resultCount,
  resultLabel = 'item',
  filtersSlot,
  trailingActions,
}: UserManagementTableToolbarProps) {
  return (
    <EnterpriseExplorerToolbar
      variant="drawings"
      searchQuery={search}
      onSearchChange={onSearchChange}
      searchPlaceholder={searchPlaceholder}
      resultCount={resultCount}
      resultLabel={resultLabel}
      viewMode="table"
      onViewModeChange={() => {}}
      showViewModeToggle={false}
      showTableControls
      trailingActions={
        <>
          {filtersSlot}
          {trailingActions}
        </>
      }
    />
  )
}
