'use client'

import type { SxProps, Theme } from '@mui/material'
import { useTerritoryStore } from '@/lib/territory-store'
import { HierarchyPathMultiSelect } from '@/src/components/user-management/hierarchy-path-multi-select'

export function TerritoryHierarchySelect({
  id,
  value,
  onChange,
  fieldSx,
  disabled,
}: {
  id?: string
  value: string[]
  onChange: (territoryLabels: string[]) => void
  fieldSx?: SxProps<Theme>
  disabled?: boolean
}) {
  const tree = useTerritoryStore((state) => state.tree)

  return (
    <HierarchyPathMultiSelect
      id={id}
      value={value}
      onChange={onChange}
      tree={tree}
      searchPlaceholder="Search territories..."
      emptySearchMessage="No territories match your search."
      fieldSx={fieldSx}
      disabled={disabled}
    />
  )
}
