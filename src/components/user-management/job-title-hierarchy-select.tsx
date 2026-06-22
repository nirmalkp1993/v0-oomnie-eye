'use client'

import type { SxProps, Theme } from '@mui/material'
import { useJobTitleStore } from '@/lib/job-title-store'
import { HierarchyPathMultiSelect } from '@/src/components/user-management/hierarchy-path-multi-select'

export function JobTitleHierarchySelect({
  id,
  value,
  onChange,
  fieldSx,
  disabled,
}: {
  id?: string
  value: string[]
  onChange: (jobTitleLabels: string[]) => void
  fieldSx?: SxProps<Theme>
  disabled?: boolean
}) {
  const tree = useJobTitleStore((state) => state.tree)

  return (
    <HierarchyPathMultiSelect
      id={id}
      value={value}
      onChange={onChange}
      tree={tree}
      searchPlaceholder="Search job titles..."
      emptySearchMessage="No job titles match your search."
      fieldSx={fieldSx}
      disabled={disabled}
    />
  )
}
