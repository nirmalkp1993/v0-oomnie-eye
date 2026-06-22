'use client'

import type { SxProps, Theme } from '@mui/material'
import { useDepartmentStore } from '@/lib/department-store'
import { HierarchyPathMultiSelect } from '@/src/components/user-management/hierarchy-path-multi-select'

export function DepartmentHierarchySelect({
  id,
  value,
  onChange,
  fieldSx,
  disabled,
}: {
  id?: string
  value: string[]
  onChange: (departmentLabels: string[]) => void
  fieldSx?: SxProps<Theme>
  disabled?: boolean
}) {
  const tree = useDepartmentStore((state) => state.tree)

  return (
    <HierarchyPathMultiSelect
      id={id}
      value={value}
      onChange={onChange}
      tree={tree}
      searchPlaceholder="Search departments..."
      emptySearchMessage="No departments match your search."
      fieldSx={fieldSx}
      disabled={disabled}
    />
  )
}
