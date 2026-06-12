'use client'

import type { SxProps, Theme } from '@mui/material'
import { HierarchyPathSelect } from '@/src/components/user-management/hierarchy-path-select'
import { DEPARTMENT_HIERARCHY_TREE } from '@/src/mock-data/department-hierarchy'

export function DepartmentHierarchySelect({
  id,
  value,
  onChange,
  fieldSx,
}: {
  id?: string
  value: string
  onChange: (departmentLabel: string) => void
  fieldSx?: SxProps<Theme>
}) {
  return (
    <HierarchyPathSelect
      id={id}
      value={value}
      onChange={onChange}
      tree={DEPARTMENT_HIERARCHY_TREE}
      searchPlaceholder="Search departments..."
      emptySearchMessage="No departments match your search."
      fieldSx={fieldSx}
    />
  )
}
