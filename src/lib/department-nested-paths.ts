import {
  collectNestedPathOptions,
  filterNestedPathOptions,
  type NestedPathOption,
} from '@/src/lib/nested-tree-path-options'
import { DEPARTMENT_HIERARCHY_TREE } from '@/src/mock-data/department-hierarchy'

export function getDepartmentNestedPathOptions(): NestedPathOption[] {
  return collectNestedPathOptions(DEPARTMENT_HIERARCHY_TREE)
}

export function getFilteredDepartmentNestedPathOptions(query: string): NestedPathOption[] {
  return filterNestedPathOptions(getDepartmentNestedPathOptions(), query)
}
