import {
  collectNestedPathOptions,
  filterNestedPathOptions,
  type NestedPathOption,
} from '@/src/lib/nested-tree-path-options'
import { JOB_TITLE_HIERARCHY_TREE } from '@/src/mock-data/job-title-hierarchy'

export function getJobTitleNestedPathOptions(): NestedPathOption[] {
  return collectNestedPathOptions(JOB_TITLE_HIERARCHY_TREE)
}

export function getFilteredJobTitleNestedPathOptions(query: string): NestedPathOption[] {
  return filterNestedPathOptions(getJobTitleNestedPathOptions(), query)
}
