'use client'

import type { SxProps, Theme } from '@mui/material'
import { useJobTitleStore } from '@/lib/job-title-store'
import { HierarchyPathSelect } from '@/src/components/user-management/hierarchy-path-select'

export function JobTitleHierarchySelect({
  id,
  value,
  onChange,
  fieldSx,
}: {
  id?: string
  value: string
  onChange: (jobTitleLabel: string) => void
  fieldSx?: SxProps<Theme>
}) {
  const tree = useJobTitleStore((state) => state.tree)

  return (
    <HierarchyPathSelect
      id={id}
      value={value}
      onChange={onChange}
      tree={tree}
      searchPlaceholder="Search job titles..."
      emptySearchMessage="No job titles match your search."
      fieldSx={fieldSx}
    />
  )
}
