'use client'

import type { SxProps, Theme } from '@mui/material'
import { HierarchyPathSelect } from '@/src/components/user-management/hierarchy-path-select'
import { JOB_TITLE_HIERARCHY_TREE } from '@/src/mock-data/job-title-hierarchy'

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
  return (
    <HierarchyPathSelect
      id={id}
      value={value}
      onChange={onChange}
      tree={JOB_TITLE_HIERARCHY_TREE}
      searchPlaceholder="Search job titles..."
      emptySearchMessage="No job titles match your search."
      fieldSx={fieldSx}
    />
  )
}
