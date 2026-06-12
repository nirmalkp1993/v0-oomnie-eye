'use client'

import type { SxProps, Theme } from '@mui/material'
import { useOfficeStore } from '@/lib/office-store'
import { HierarchyPathSelect } from '@/src/components/user-management/hierarchy-path-select'

export function OfficeHierarchySelect({
  id,
  value,
  onChange,
  fieldSx,
}: {
  id?: string
  value: string
  onChange: (officeLabel: string) => void
  fieldSx?: SxProps<Theme>
}) {
  const tree = useOfficeStore((state) => state.tree)

  return (
    <HierarchyPathSelect
      id={id}
      value={value}
      onChange={onChange}
      tree={tree}
      searchPlaceholder="Search offices..."
      emptySearchMessage="No offices match your search."
      fieldSx={fieldSx}
    />
  )
}
