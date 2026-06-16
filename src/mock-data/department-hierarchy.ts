import type { HierarchyTreeNode } from '@/src/lib/nested-tree-path-options'

/** Default organizational departments. */
export const DEPARTMENT_HIERARCHY_TREE: HierarchyTreeNode[] = [
  {
    id: 'dept-operations',
    name: 'Operations',
    children: [
      { id: 'dept-administration', name: 'Administration' },
      { id: 'dept-hr', name: 'HR' },
    ],
  },
  {
    id: 'dept-growth',
    name: 'Growth',
    children: [
      { id: 'dept-sales', name: 'Sales' },
      { id: 'dept-marketing', name: 'Marketing' },
    ],
  },
  {
    id: 'dept-technology',
    name: 'Technology',
    children: [
      { id: 'dept-it', name: 'IT' },
      { id: 'dept-finance', name: 'Finance' },
    ],
  },
]
